/* 동물 달리기 500m — 경주 규칙
   화면과 따로 떨어져 있어서 브라우저에서도, node 에서도(밸런스 시험) 그대로 돈다. */
(function (root) {
  'use strict';

  var LEN = 500;          // 경주 거리 (m)
  var RUBBER = 0.03;      // 뒤처진 동물의 추격 보정 (최대 3%)

  // ───────────── 난수 ─────────────
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function makeRng(seed) {
    var f = mulberry32(seed >>> 0);
    return {
      next: f,
      range: function (a, b) { return a + (b - a) * f(); },
      int: function (a, b) { return a + Math.floor(f() * (b - a + 1)); },
      chance: function (p) { return f() < p; },
      pick: function (arr) { return arr[Math.floor(f() * arr.length)]; },
      gauss: function () {
        var u = 0, v = 0;
        while (u === 0) u = f();
        while (v === 0) v = f();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      },
      shuffle: function (arr) {
        for (var i = arr.length - 1; i > 0; i--) {
          var j = Math.floor(f() * (i + 1));
          var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
      },
      weighted: function (pairs) {
        var s = 0, i;
        for (i = 0; i < pairs.length; i++) s += pairs[i][1];
        var x = f() * s;
        for (i = 0; i < pairs.length; i++) { x -= pairs[i][1]; if (x <= 0) return pairs[i][0]; }
        return pairs[pairs.length - 1][0];
      }
    };
  }

  // ───────────── 조사 (이/가 · 을/를 · 은/는) ─────────────
  function hasBatchim(s) {
    if (!s) return false;
    var c = s.charCodeAt(s.length - 1);
    if (c >= 0xAC00 && c <= 0xD7A3) return (c - 0xAC00) % 28 !== 0;
    var ch = s.charAt(s.length - 1).toLowerCase();
    if (/[0-9]/.test(ch)) return '013678'.indexOf(ch) >= 0;
    if (/[a-z]/.test(ch)) return 'lmnrbcdgkpt'.indexOf(ch) >= 0;
    return false;
  }
  function josa(s, withB, withoutB) { return s + (hasBatchim(s) ? withB : withoutB); }

  // ───────────── 동물 150종 (앞의 50종은 스킬을 하나하나 따로 만들었고, 뒤의 100종은 표로 정의) ─────────────
  // speed : 기본 속력(m/s) · accel : 가속 · light : 가벼움(바람 영향) · agi : 날렵함(장애물 피하기)
  // wx : 날씨별 속력 보정 (storm 은 rain 값을 같이 씀)
  // tr : 특성 — water 물웅덩이 좋아함 · ice 빙판 좋아함 · nofog 안개에 안 헤맴 · heavy 장애물을 밟고 지나감 · hurdler 허들 잘 넘음
  //      glutton 간식 효과 오래감 · steady 날씨 영향 덜 받음 · quick 출발 빠름 · nimble 금방 일어남 · mud 진흙 좋아함 · reach 결승선에서 목이 먼저 닿음
  var ANIMALS = [
    { id: 'rabbit', name: '토끼', speed: 7.607, accel: 8.0, light: 1.0, agi: 1.0, tr: { hurdler: 1 },
      wx: { rain: -0.02, snow: 0.03, heat: -0.01 },
      skill: { name: '깡충깡충 대시', desc: '세 번 크게 뛰어 단숨에 앞으로 나가요.' },
      passive: '너무 앞서면 방심해서 낮잠을 자기도 해요.' },
    { id: 'turtle', name: '거북이', speed: 7.444, accel: 5.5, light: 0.2, agi: 0.2, tr: { steady: 1, water: 1 },
      wx: { rain: 0.04, heat: 0.02, snow: -0.02 },
      skill: { name: '등껍질 스핀', desc: '껍질 속에 쏙 들어가 팽이처럼 돌진! 방해도 튕겨 내요.' },
      passive: '꾸준해서 날씨가 나빠도 덜 느려져요.' },
    { id: 'cheetah', name: '치타', speed: 7.687, accel: 10.0, light: 0.6, agi: 0.8, tr: { quick: 1 },
      wx: { heat: 0.03, snow: -0.05, rain: -0.03 },
      skill: { name: '번개 스프린트', desc: '누구보다 빠른 폭발 질주. 하지만 곧 지쳐서 헥헥거려요.' },
      passive: '출발이 가장 빨라요.' },
    { id: 'fox', name: '여우', speed: 7.589, accel: 7.0, light: 0.7, agi: 0.8, tr: { nofog: 1 },
      wx: { fog: 0.04, snow: 0.01 },
      skill: { name: '슬쩍하기', desc: '다른 동물이 들고 있는 아이템을 몰래 가져와요.' },
      passive: '안개 속에서도 길을 잘 찾아요.' },
    { id: 'bear', name: '곰', speed: 7.687, accel: 6.0, light: 0.1, agi: 0.4, tr: {},
      wx: { snow: 0.04, heat: -0.05 },
      skill: { name: '쩌렁쩌렁 포효', desc: '가까이 있는 동물들이 깜짝 놀라 느려져요.' },
      passive: '무거워서 바람에 끄떡없어요.' },
    { id: 'penguin', name: '펭귄', speed: 7.408, accel: 6.0, light: 0.6, agi: 0.5, tr: { water: 1, ice: 1 },
      wx: { snow: 0.07, rain: 0.03, heat: -0.08 },
      skill: { name: '배치기 슬라이딩', desc: '배로 쭈욱 미끄러져요. 비나 눈이 오면 훨씬 멀리 가요.' },
      passive: '미끄러운 길이 오히려 좋아요.' },
    { id: 'elephant', name: '코끼리', speed: 7.797, accel: 5.5, light: 0.0, agi: 0.2, tr: { heavy: 1 },
      wx: { rain: 0.02, snow: -0.02 },
      skill: { name: '코 물대포', desc: '선두에게 물을 뿜어 느리게 만들어요.' },
      passive: '두더지와 허들쯤은 그냥 밟고 지나가요.' },
    { id: 'kangaroo', name: '캥거루', speed: 7.611, accel: 7.0, light: 0.6, agi: 1.0, tr: { hurdler: 1 },
      wx: { heat: 0.03, snow: -0.04 },
      skill: { name: '슈퍼 점프', desc: '하늘 높이 뛰어 장애물과 방해를 훌쩍 넘어가요.' },
      passive: '허들은 식은 죽 먹기예요.' },
    { id: 'skunk', name: '스컹크', speed: 7.72, accel: 6.5, light: 0.8, agi: 0.6, tr: {},
      wx: { fog: 0.02 },
      skill: { name: '뿡뿡 구름', desc: '뒤따라오는 동물들이 코를 막느라 느려져요.' },
      passive: '뒤에 아무도 없으면 방귀 로켓으로 추격해요.' },
    { id: 'pig', name: '돼지', speed: 7.52, accel: 6.0, light: 0.2, agi: 0.4, tr: { glutton: 1, mud: 1 },
      wx: { rain: 0.02, heat: -0.02 },
      skill: { name: '꿀꿀 돌진', desc: '데굴데굴 굴러 돌진! 스쳐 지나간 동물은 휘청거려요.' },
      passive: '간식을 먹으면 힘이 더 오래가요.' },
    { id: 'dog', name: '강아지', speed: 7.735, accel: 7.5, light: 0.6, agi: 0.7, tr: {},
      wx: { heat: -0.02, snow: 0.02 },
      skill: { name: '같이 가자!', desc: '바로 뒤에 있는 친구와 함께 빨라져요.' },
      passive: '의리파라서 친구를 도와줘요.' },
    { id: 'cat', name: '고양이', speed: 7.588, accel: 8.0, light: 0.9, agi: 0.9, tr: { nimble: 1, nofog: 1 },
      wx: { rain: -0.05, fog: 0.04 },
      skill: { name: '냥냥 펀치', desc: '앞선 동물을 톡! 쳐서 빙글 돌게 만들어요.' },
      passive: '넘어져도 금방 일어나요.' },
    { id: 'panda', name: '판다', speed: 7.503, accel: 5.8, light: 0.2, agi: 0.4, tr: { glutton: 1 },
      wx: { snow: 0.03, heat: -0.05 },
      skill: { name: '대나무 간식 타임', desc: '잠깐 멈춰 대나무를 먹고 엄청난 힘으로 질주해요.' },
      passive: '간식을 먹으면 힘이 더 오래가요.' },
    { id: 'duck', name: '오리', speed: 7.473, accel: 6.5, light: 1.0, agi: 0.6, tr: { water: 1 },
      wx: { rain: 0.08, snow: -0.02, heat: -0.01 },
      skill: { name: '파닥파닥 활공', desc: '낮게 날아서 웅덩이도 장애물도 휙 지나가요.' },
      passive: '비 오는 날을 제일 좋아해요.' }
    ,
    // ── 여기부터 새로 들어온 36종 ──
    { id: 'lion', name: '사자', speed: 7.688, accel: 7.0, light: 0.3, agi: 0.6, tr: {},
      wx: { heat: 0.02, rain: -0.02 },
      skill: { name: '왕의 포효', desc: '앞서가는 동물들이 움찔하며 느려져요.' },
      passive: '더운 날씨에 조금 더 힘이 나요.' },
    { id: 'tiger', name: '호랑이', speed: 7.69, accel: 8.0, light: 0.4, agi: 0.8, tr: {},
      wx: { fog: 0.02, heat: -0.01 },
      skill: { name: '호랑이 덮치기', desc: '앞선 동물에게 훌쩍 뛰어올라 넘어뜨려요.' },
      passive: '안개 낀 날 살금살금 잘 달려요.' },
    { id: 'zebra', name: '얼룩말', speed: 7.607, accel: 7.5, light: 0.5, agi: 0.7, tr: {},
      wx: { heat: 0.02, snow: -0.03 },
      skill: { name: '줄무늬 착시', desc: '주변 동물들이 눈이 어질어질, 길을 헷갈려요.' },
      passive: '착시를 쓰는 동안에는 방해가 안 통해요.' },
    { id: 'giraffe', name: '기린', speed: 7.598, accel: 5.5, light: 0.5, agi: 0.4, tr: { reach: 1 },
      wx: { heat: 0.02, snow: -0.03 },
      skill: { name: '높은 나무 열매', desc: '아무도 못 닿는 높은 곳에서 좋은 아이템을 따 와요.' },
      passive: '결승선에서는 긴 목이 먼저 닿아요.' },
    { id: 'horse', name: '말', speed: 7.567, accel: 8.0, light: 0.4, agi: 0.8, tr: { hurdler: 1 },
      wx: {},
      skill: { name: '전력 질주', desc: '오랫동안 꾸준히 빠르게 달려요.' },
      passive: '허들도 가볍게 넘어요.' },
    { id: 'cow', name: '젖소', speed: 7.643, accel: 5.5, light: 0.1, agi: 0.3, tr: {},
      wx: { rain: 0.01, heat: -0.02 },
      skill: { name: '신선한 우유', desc: '느려지는 효과를 싹 씻어 내고 방패까지 둘러요.' },
      passive: '묵직해서 바람에 잘 안 밀려요.' },
    { id: 'sheep', name: '양', speed: 7.807, accel: 6.0, light: 0.7, agi: 0.5, tr: {},
      wx: { snow: 0.03, heat: -0.05, rain: -0.02 },
      skill: { name: '양 세기 자장가', desc: '가까운 동물 둘이 양을 세다 스르르 잠들어요.' },
      passive: '털옷 덕분에 눈 오는 날이 좋아요.' },
    { id: 'goat', name: '염소', speed: 7.521, accel: 7.0, light: 0.5, agi: 0.8, tr: { hurdler: 1 },
      wx: { snow: 0.02 },
      skill: { name: '오기 박치기', desc: '뒤처져 있을수록 더 세게 치고 나가요.' },
      passive: '허들쯤은 훌쩍 넘어요.' },
    { id: 'deer', name: '사슴', speed: 7.63, accel: 8.0, light: 0.6, agi: 0.9, tr: { hurdler: 1 },
      wx: { fog: 0.02, snow: 0.02 },
      skill: { name: '뿔 반사', desc: '다음 방해를 뿔로 받아쳐, 건 동물에게 되돌려줘요.' },
      passive: '허들도 사뿐히 넘어요.' },
    { id: 'koala', name: '코알라', speed: 7.686, accel: 6.0, light: 0.6, agi: 0.4, tr: { glutton: 1 },
      wx: { rain: -0.02 },
      skill: { name: '어부바', desc: '앞 동물 등에 찰싹 매달려 편하게 가요.' },
      passive: '간식을 먹으면 힘이 더 오래가요.' },
    { id: 'sloth', name: '나무늘보', speed: 7.713, accel: 5.0, light: 0.5, agi: 0.2, tr: { steady: 1 },
      wx: { rain: 0.02 },
      skill: { name: '느긋함 전염', desc: '다른 동물 모두가 덩달아 느릿느릿해져요.' },
      passive: '느긋해서 날씨가 나빠도 덜 느려져요.' },
    { id: 'monkey', name: '원숭이', speed: 7.742, accel: 8.0, light: 0.7, agi: 0.9, tr: {},
      wx: { heat: 0.01, snow: -0.04 },
      skill: { name: '바나나 세례', desc: '앞선 동물 둘의 레인에 바나나 껍질을 던져요.' },
      passive: '날렵해서 두더지를 잘 피해요.' },
    { id: 'gorilla', name: '고릴라', speed: 7.609, accel: 6.0, light: 0.05, agi: 0.4, tr: { heavy: 1 },
      wx: { snow: -0.02, fog: 0.01 },
      skill: { name: '쿵쿵 가슴 두드리기', desc: '땅이 울려서 가까운 동물들이 넘어져요.' },
      passive: '두더지와 허들쯤은 그냥 밟고 지나가요.' },
    { id: 'hippo', name: '하마', speed: 7.652, accel: 5.5, light: 0.0, agi: 0.2, tr: { heavy: 1, water: 1, mud: 1 },
      wx: { rain: 0.05, heat: -0.03 },
      skill: { name: '진흙탕 만들기', desc: '지나간 자리에 진흙탕을 남겨 뒤따르는 동물이 미끄러져요.' },
      passive: '비 오는 날 물웅덩이가 반가워요.' },
    { id: 'rhino', name: '코뿔소', speed: 7.54, accel: 5.0, light: 0.0, agi: 0.3, tr: { heavy: 1 },
      wx: { heat: 0.02 },
      skill: { name: '멈출 수 없는 돌진', desc: '달릴수록 점점 빨라지고 어떤 방해도 안 통해요.' },
      passive: '두더지와 허들쯤은 그냥 밟고 지나가요.' },
    { id: 'croc', name: '악어', speed: 7.705, accel: 6.0, light: 0.2, agi: 0.4, tr: { water: 1 },
      wx: { rain: 0.06, snow: -0.06, heat: 0.02 },
      skill: { name: '악어의 눈물', desc: '가짜 눈물에 속은 앞 동물이 달래 주려고 멈춰 서요.' },
      passive: '비 오는 날 물웅덩이가 반가워요.' },
    { id: 'frog', name: '개구리', speed: 7.62, accel: 8.0, light: 0.9, agi: 0.9, tr: { water: 1, hurdler: 1 },
      wx: { rain: 0.08, heat: -0.05, snow: -0.05 },
      skill: { name: '혓바닥 낼름', desc: '긴 혀로 앞 동물을 붙잡고 단숨에 따라붙어요.' },
      passive: '비 오는 날을 제일 좋아해요.' },
    { id: 'squirrel', name: '다람쥐', speed: 7.672, accel: 9.0, light: 0.9, agi: 1.0, tr: {},
      wx: { snow: 0.01 },
      skill: { name: '도토리 세례', desc: '앞선 동물들에게 도토리를 던져 주춤하게 해요.' },
      passive: '아주 날렵해서 두더지를 잘 피해요.' },
    { id: 'hamster', name: '햄스터', speed: 7.615, accel: 8.0, light: 0.9, agi: 0.6, tr: { glutton: 1 },
      wx: { heat: -0.02 },
      skill: { name: '쳇바퀴 질주', desc: '쳇바퀴를 타고 데굴데굴, 바닥 방해도 그냥 지나가요.' },
      passive: '간식을 먹으면 힘이 더 오래가요.' },
    { id: 'mouse', name: '생쥐', speed: 7.588, accel: 9.0, light: 1.0, agi: 0.9, tr: { nofog: 1 },
      wx: { fog: 0.02 },
      skill: { name: '쥐구멍 지름길', desc: '땅속으로 쏙 들어가 저 앞에서 튀어나와요.' },
      passive: '안개 속에서도 길을 잘 찾아요.' },
    { id: 'hedgehog', name: '고슴도치', speed: 7.56, accel: 6.5, light: 0.7, agi: 0.5, tr: {},
      wx: {},
      skill: { name: '가시 세우기', desc: '가시를 세운 동안 방해한 동물이 오히려 따끔!' },
      passive: '가시를 세운 동안에는 방해가 안 통해요.' },
    { id: 'raccoon', name: '너구리', speed: 7.626, accel: 7.0, light: 0.7, agi: 0.8, tr: { nofog: 1 },
      wx: { fog: 0.03 },
      skill: { name: '기운 가로채기', desc: '빨라진 동물의 기운을 슬쩍 가져와요.' },
      passive: '안개 속에서도 길을 잘 찾아요.' },
    { id: 'otter', name: '수달', speed: 7.44, accel: 7.0, light: 0.6, agi: 0.7, tr: { water: 1 },
      wx: { rain: 0.07 },
      skill: { name: '물살 타기', desc: '방패를 두르고 미끄러지듯 달려요. 젖은 길이면 더 빨라요.' },
      passive: '비 오는 날 물웅덩이가 반가워요.' },
    { id: 'beaver', name: '비버', speed: 7.705, accel: 6.0, light: 0.4, agi: 0.4, tr: { water: 1 },
      wx: { rain: 0.05 },
      skill: { name: '통나무 댐', desc: '지나간 자리에 통나무를 쌓아 뒤따르는 동물을 막아요.' },
      passive: '비 오는 날 물웅덩이가 반가워요.' },
    { id: 'wolf', name: '늑대', speed: 7.601, accel: 7.5, light: 0.5, agi: 0.8, tr: {},
      wx: { snow: 0.05, heat: -0.03 },
      skill: { name: '무리 사냥 하울링', desc: '주변에 동물이 많을수록 더 빨라져요.' },
      passive: '눈 오는 날에 강해요.' },
    { id: 'polar', name: '북극곰', speed: 7.64, accel: 6.0, light: 0.1, agi: 0.4, tr: { ice: 1 },
      wx: { snow: 0.09, heat: -0.09 },
      skill: { name: '얼음 숨결', desc: '앞 동물을 꽁꽁 얼려요. 눈 오는 날엔 더 오래 얼어요.' },
      passive: '빙판길이 오히려 좋아요.' },
    { id: 'seal', name: '물개', speed: 7.572, accel: 6.0, light: 0.5, agi: 0.5, tr: { water: 1, ice: 1 },
      wx: { rain: 0.05, snow: 0.05, heat: -0.06 },
      skill: { name: '비치볼 튕기기', desc: '공이 맨 앞 두 동물의 머리 위로 통통 튀어요.' },
      passive: '젖은 길도 언 길도 좋아해요.' },
    { id: 'owl', name: '부엉이', speed: 7.651, accel: 6.5, light: 0.9, agi: 0.6, tr: { nofog: 1 },
      wx: { fog: 0.05 },
      skill: { name: '밤이 왔다', desc: '갑자기 캄캄해져서 다른 동물들이 길을 더듬어요.' },
      passive: '안개 속에서도 길을 잘 찾아요.' },
    { id: 'chicken', name: '닭', speed: 7.765, accel: 7.5, light: 0.9, agi: 0.7, tr: {},
      wx: { rain: -0.03 },
      skill: { name: '달걀 폭탄', desc: '뒤따르는 동물 레인에 달걀을 낳아 미끄러지게 해요.' },
      passive: '뒤에 아무도 없으면 파닥파닥 날갯짓으로 추격해요.' },
    { id: 'parrot', name: '앵무새', speed: 7.669, accel: 7.0, light: 1.0, agi: 0.7, tr: {},
      wx: { heat: 0.03, snow: -0.05 },
      skill: { name: '따라 하기', desc: '방금 다른 동물이 쓴 스킬을 그대로 따라 해요.' },
      passive: '아직 아무도 스킬을 안 썼으면 그냥 날아가요.' },
    { id: 'flamingo', name: '플라밍고', speed: 7.578, accel: 6.5, light: 0.8, agi: 0.7, tr: { water: 1 },
      wx: { rain: 0.03, heat: 0.02, snow: -0.05 },
      skill: { name: '성큼성큼', desc: '긴 다리로 성큼성큼, 바닥 방해를 넘어가요.' },
      passive: '비 오는 날 물웅덩이가 반가워요.' },
    { id: 'ostrich', name: '타조', speed: 7.689, accel: 8.5, light: 0.5, agi: 0.7, tr: {},
      wx: { heat: 0.04, snow: -0.05 },
      skill: { name: '뒷발차기', desc: '바로 뒤 동물을 뻥 차서 뒤로 밀어내요.' },
      passive: '더운 날씨에 강해요.' },
    { id: 'camel', name: '낙타', speed: 7.599, accel: 5.5, light: 0.2, agi: 0.3, tr: {},
      wx: { heat: 0.07, snow: -0.04, rain: -0.02 },
      skill: { name: '혹 에너지', desc: '한동안 느려지는 방해가 안 통하고 꾸준히 빨라요.' },
      passive: '폭염에도 끄떡없어요.' },
    { id: 'alpaca', name: '알파카', speed: 7.819, accel: 6.5, light: 0.6, agi: 0.5, tr: {},
      wx: { snow: 0.03, heat: -0.03 },
      skill: { name: '퉤! 침 뱉기', desc: '앞 동물 얼굴에 침을 뱉어 앞이 안 보이게 해요.' },
      passive: '털옷 덕분에 눈 오는 날이 좋아요.' },
    { id: 'bat', name: '박쥐', speed: 7.687, accel: 7.5, light: 1.0, agi: 0.8, tr: { nofog: 1 },
      wx: { fog: 0.05, heat: -0.02 },
      skill: { name: '초음파', desc: '깜짝 놀란 동물들이 들고 있던 아이템을 떨어뜨려요.' },
      passive: '안개 속에서도 길을 잘 찾아요.' },
    { id: 'redpanda', name: '레서판다', speed: 7.561, accel: 7.0, light: 0.7, agi: 0.7, tr: {},
      wx: { snow: 0.03, heat: -0.03 },
      skill: { name: '만세 위협', desc: '두 팔 번쩍! 너무 귀여워서 가까운 동물들이 멈춰 서요.' },
      passive: '눈 오는 날에 조금 더 힘이 나요.' }
  ];

  // ───────────── 새 100종 (해양 · 파충류 · 새 · 공룡 · 포유류) ─────────────
  // [id, 이름, 분류, 크기(S 작음 · M 보통 · L 큼), 특성, 날씨 보정, 스킬 이름, 스킬 설명, 스킬 유형, 매개변수, (중계 문구)]
  var MORE = [
    // 바다 동물
    ['shark', '상어', 'sea', 'M', 'water', { rain: 0.04, heat: -0.02 }, '덥석 물기', '앞 동물 꼬리를 덥석! 깜짝 놀라 넘어져요.', 'hitAhead', { range: 18, kind: 'stun', fx: 'trip', t: 1.0, self: [1.45, 2.3], pop: '으악, 상어다!' }],
    ['whale', '고래', 'sea', 'L', 'water heavy', { rain: 0.05, heat: -0.03 }, '물기둥 분수', '등에서 물기둥을 뿜어 주변 동물을 흠뻑 적셔요.', 'area', { range: 26, kind: 'slow', fx: 'wet', m: 0.66, t: 2.3, self: [1.3, 2.3], ev: 'howl', pop: '푸하!' }],
    ['dolphin', '돌고래', 'sea', 'M', 'water', { rain: 0.05 }, '공중제비 점프', '물 위로 솟구치듯 높이 뛰어 장애물을 넘어요.', 'boost', { m: 1.9, t: 1.3, air: 1, fx: 'jump' }, '하늘 높이 솟구칩니다!'],
    ['orca', '범고래', 'sea', 'L', 'water ice heavy', { rain: 0.04, snow: 0.04, heat: -0.05 }, '큰 파도 일으키기', '큰 파도가 덮쳐 가까운 동물들이 휩쓸려요.', 'area', { range: 22, kind: 'stun', fx: 'spin', t: 0.8, ground: 1, self: [1.18, 1.8], ev: 'roar', pop: '철썩!' }],
    ['octopus', '문어', 'sea', 'M', 'water', { rain: 0.04, heat: -0.03 }, '먹물 뿌리기', '지나간 자리에 먹물을 뿌려 뒤따르는 동물 앞이 캄캄해져요.', 'patch', { ink: 1, self: [1.35, 2.4] }],
    ['squid', '오징어', 'sea', 'M', 'water', { rain: 0.04, heat: -0.03 }, '제트 분사', '물을 내뿜어 로켓처럼 튀어 나가요. 잠깐 숨이 차요.', 'boost', { m: 2.0, t: 1.4, fx: 'rocket', tired: [0.82, 2.2] }, '쐐애액!'],
    ['crab', '게', 'sea', 'S', 'water', { rain: 0.04 }, '집게 꼬집기', '앞 동물을 집게로 콕! 따끔해서 펄쩍 뛰어요.', 'hitAhead', { range: 16, kind: 'stun', fx: 'sting', t: 0.9, self: [1.45, 2.3], pop: '아얏!' }],
    ['lobster', '바닷가재', 'sea', 'M', 'water', { rain: 0.04 }, '집게 붙잡기', '큰 집게로 앞 동물을 꽉 붙잡아 느리게 만들어요.', 'hitAhead', { range: 20, kind: 'slow', fx: 'pulled', m: 0.5, t: 2.2, self: [1.45, 2.5], pop: '놔 줘~' }],
    ['shrimp', '새우', 'sea', 'S', 'water', { rain: 0.04 }, '꼬리 튕기기', '꼬리를 탁 튕겨 순식간에 앞으로 튀어 나가요.', 'boost', { m: 2.3, t: 0.9, air: 1, fx: 'jump' }, '탁! 하고 튀어 나갑니다.'],
    ['jellyfish', '해파리', 'sea', 'S', 'water', { rain: 0.05 }, '찌릿 촉수', '가까이 온 동물들이 촉수에 닿아 찌릿해요.', 'area', { range: 13, kind: 'stun', fx: 'zap', t: 0.9, self: [1.3, 2.2], ev: 'sonar', pop: '찌릿!' }],
    ['starfish', '불가사리', 'sea', 'S', 'water', { rain: 0.04 }, '반짝 별 변신', '잠깐 반짝이는 별이 되어 방해 없이 달려요.', 'guard', { imm: 1, m: 1.35, t: 2.4, fx: 'star' }, '반짝반짝 빛나며 달립니다.'],
    ['seahorse', '해마', 'sea', 'S', 'water', { rain: 0.04 }, '물방울 대포', '맨 앞 동물에게 물방울을 쏘아 느리게 해요.', 'hitLeader', { kind: 'slow', fx: 'wet', m: 0.58, t: 2.3, fog: 1, proj: 'water', self: [1.42, 2.5], pop: '퐁퐁퐁!' }],
    ['clownfish', '흰동가리', 'sea', 'S', 'water', { rain: 0.04 }, '말미잘 숨바꼭질', '말미잘 속에 숨듯 방해를 피하며 달려요.', 'guard', { imm: 1, m: 1.25, t: 2.9, fx: 'illusion' }, '요리조리 숨으며 달려요.'],
    ['puffer', '복어', 'sea', 'S', 'water', { rain: 0.04 }, '빵빵 부풀기', '몸을 가시 공처럼 부풀려요. 건드리면 따끔!', 'guard', { thorns: 1, m: 1.18, t: 3.6 }, '건드리면 따끔합니다!'],
    ['manta', '쥐가오리', 'sea', 'M', 'water', { rain: 0.04 }, '수면 활공', '넓은 지느러미로 트랙 위를 미끄러지듯 날아요.', 'boost', { m: 1.42, t: 3.0, air: 1, fx: 'fly' }, '트랙 위를 스르륵 날아갑니다.'],
    ['walrus', '바다코끼리', 'sea', 'L', 'water ice heavy', { snow: 0.06, rain: 0.03, heat: -0.06 }, '쿵 엉덩방아', '쿵! 하고 주저앉아 땅을 울려 주변 동물이 넘어져요.', 'area', { range: 22, kind: 'stun', fx: 'trip', t: 0.75, ground: 1, self: [1.2, 1.8], ev: 'roar', pop: '쿵! 꽈당' }],
    ['narwhal', '일각고래', 'sea', 'M', 'water ice', { snow: 0.05, rain: 0.03, heat: -0.05 }, '뿔 콕 찌르기', '긴 뿔로 앞 동물 엉덩이를 콕! 깜짝 놀라 멈춰요.', 'hitAhead', { range: 20, kind: 'stun', fx: 'sting', t: 0.95, self: [1.42, 2.3], pop: '앗 따가!' }],
    ['sealion', '바다사자', 'sea', 'M', 'water', { rain: 0.05, heat: -0.03 }, '박수 응원', '짝짝짝! 나와 뒤처진 동물들이 함께 힘을 내요.', 'rally', { n: 2, m: 1.35, sm: 1.55, t: 2.9 }],
    ['manatee', '매너티', 'sea', 'L', 'water steady', { rain: 0.04 }, '느긋한 헤엄', '오래오래 꾸준히 빨라요. 느려지는 방해도 안 통해요.', 'guard', { noslow: 1, cleanse0: 1, m: 1.16, t: 5.5, fx: 'steady' }, '한동안 느려지지 않아요.'],
    ['beluga', '흰고래', 'sea', 'M', 'water ice', { snow: 0.06, rain: 0.03, heat: -0.06 }, '바다의 자장가', '고운 노래에 가까운 동물 둘이 스르르 잠들어요.', 'area', { range: 25, max: 2, kind: 'stun', fx: 'sleep', t: 1.3, self: [1.25, 2.0], ev: 'sonar', pop: '쿨쿨…' }],
    ['swordfish', '황새치', 'sea', 'M', 'water', { rain: 0.05 }, '쾌속 찌르기', '점점 빨라지는 직선 돌진. 막을 수 없어요.', 'boost', { m: 1.15, t: 2.5, imm: 1, ramp: [1.15, 1.5], fx: 'charge' }, '점점 빨라집니다!'],
    ['angler', '아귀', 'sea', 'S', 'water nofog', { fog: 0.05, rain: 0.03 }, '초롱불 유혹', '반짝이는 초롱불에 홀린 앞 동물들이 멈춰 서요.', 'area', { dir: 'ahead', range: 22, max: 2, kind: 'stun', fx: 'charm', t: 0.95, self: [1.3, 2.2], ev: 'charm', pop: '반짝반짝…' }],
    ['seaturtle', '바다거북', 'sea', 'M', 'water steady', { rain: 0.05 }, '해류 타기', '해류를 탄 듯 매끄럽게. 젖은 길이면 훨씬 오래가요.', 'boost', { m: 1.45, t: 2.4, gnd: 1, wetK: 1.5, fx: 'slide' }, '물결을 타고 미끄러집니다.'],
    // 파충류 · 양서류
    ['snake', '뱀', 'rep', 'M', '', { heat: 0.03, snow: -0.06 }, '휘감기', '앞 동물을 스르륵 휘감아 느리게 만들어요.', 'hitAhead', { range: 20, kind: 'slow', fx: 'pulled', m: 0.52, t: 2.2, self: [1.45, 2.4], pop: '꼼짝 못 하겠어!' }],
    ['cobra', '코브라', 'rep', 'M', '', { heat: 0.04, snow: -0.06 }, '후드 펼치기', '후드를 쫙 펼쳐 앞선 동물들을 겁줘요.', 'area', { dir: 'ahead', range: 40, kind: 'slow', fx: 'scared', m: 0.7, t: 2.2, self: [1.38, 2.4], ev: 'roar', pop: '히익!' }],
    ['lizard', '도마뱀', 'rep', 'S', '', { heat: 0.04, snow: -0.05 }, '꼬리 떼고 줄행랑', '꼬리를 떼어 주고 달아나요. 느려진 것도 싹 풀려요.', 'guard', { cleanse: 1, shield: 6, m: 1.4, t: 2.4 }, '꼬리를 떼어 주고 달아납니다.'],
    ['chameleon', '카멜레온', 'rep', 'S', 'nofog', { heat: 0.03, snow: -0.05, fog: 0.03 }, '색깔 흉내', '맨 앞 동물의 스킬을 그대로 흉내 내요.', 'mimic', { who: 'leader' }],
    ['iguana', '이구아나', 'rep', 'M', '', { heat: 0.06, snow: -0.07 }, '일광욕 충전', '잠깐 햇볕을 쬐고 힘차게 달려요. 더운 날엔 더 오래가요.', 'feast', { wait: 0.9, m: 1.56, t: 2.7, heatK: 1.4 }],
    ['gecko', '도마뱀붙이', 'rep', 'S', '', { heat: 0.03, snow: -0.05 }, '찰싹 발바닥', '어디든 붙는 발로 미끄러운 길도 장애물도 그냥 지나가요.', 'boost', { m: 1.45, t: 3.0, gnd: 1, noslow: 1 }, '찰싹찰싹 달라붙어 달립니다.'],
    ['komodo', '코모도왕도마뱀', 'rep', 'L', 'heavy', { heat: 0.04, snow: -0.07 }, '끈적 침 공격', '앞 동물에게 침을 묻혀 오래도록 느리게 만들어요.', 'hitAhead', { range: 24, kind: 'slow', fx: 'pie', m: 0.7, t: 4.0, fog: 1, proj: 'spit', self: [1.42, 2.5], pop: '끈적끈적~' }],
    ['tortoise', '땅거북', 'rep', 'L', 'steady heavy', { heat: 0.03 }, '단단한 등딱지', '등딱지 속에 쏙! 한참 동안 어떤 방해도 안 통해요.', 'guard', { imm: 1, m: 1.22, t: 3.4, fx: 'shell' }, '등딱지 속에서 끄떡없이 갑니다.'],
    ['axolotl', '우파루파', 'rep', 'S', 'water', { rain: 0.06, heat: -0.05 }, '말랑 재생', '느려진 것을 싹 낫게 하고 방패까지 둘러요.', 'guard', { cleanse: 1, shield: 8, m: 1.28, t: 2.3 }, '말끔히 낫고 방패를 둘렀어요.'],
    ['salamander', '도롱뇽', 'rep', 'S', 'water', { rain: 0.06, heat: -0.04 }, '미끌 점액', '지나간 자리에 점액을 남겨 뒤따르는 동물이 미끄러져요.', 'patch', { self: [1.35, 2.4] }],
    ['toad', '두꺼비', 'rep', 'S', 'water hurdler', { rain: 0.07, heat: -0.04 }, '혓바닥 낚아채기', '긴 혀로 다른 동물의 아이템을 날름 가져와요.', 'steal', { self: [1.2, 1.5] }],
    // 새
    ['eagle', '독수리', 'bird', 'M', '', { rain: -0.03 }, '급강하 낚아채기', '하늘에서 내려와 맨 앞 동물을 번쩍 들어 올려요.', 'hitLeader', { kind: 'stun', fx: 'lift', t: 1.2, self: [1.42, 2.3], pop: '어어어~?' }],
    ['falcon', '매', 'bird', 'S', '', { rain: -0.03 }, '쏜살 급강하', '세상에서 가장 빠른 급강하. 금방 숨이 차요.', 'boost', { m: 2.0, t: 1.4, air: 1, fx: 'fly', tired: [0.88, 1.6] }, '쏜살같이 내리꽂힙니다!'],
    ['crow', '까마귀', 'bird', 'S', 'nofog', { fog: 0.03 }, '반짝이 슬쩍', '반짝이는 건 못 참아요. 다른 동물의 아이템을 가져와요.', 'steal', { self: [1.25, 1.6] }],
    ['swan', '백조', 'bird', 'M', 'water', { rain: 0.04 }, '우아한 날갯짓', '우아하게 날개를 펴면 방해가 스쳐 지나가요.', 'guard', { imm: 1, m: 1.28, t: 2.8, fx: 'illusion' }, '우아하게 미끄러져 갑니다.'],
    ['goose', '거위', 'bird', 'M', 'water', { rain: 0.04 }, '꽥꽥 소동', '꽥꽥! 시끄러운 소리에 주변 동물들이 깜짝 놀라요.', 'area', { range: 26, kind: 'slow', fx: 'scared', m: 0.66, t: 2.2, self: [1.3, 2.2], ev: 'roar', pop: '깜짝이야!' }],
    ['peacock', '공작', 'bird', 'M', '', { rain: -0.03 }, '꼬리 부채 펼치기', '화려한 꼬리에 가까운 동물들이 넋을 잃어요.', 'area', { range: 20, kind: 'stun', fx: 'charm', t: 0.9, self: [1.3, 2.2], ev: 'charm', pop: '우와, 예쁘다…' }],
    ['toucan', '큰부리새', 'bird', 'S', '', { heat: 0.03, snow: -0.05 }, '큰 부리 콕', '커다란 부리로 앞 동물 머리를 콕! 어질어질해요.', 'hitAhead', { range: 22, kind: 'stun', fx: 'bonk2', t: 1.0, self: [1.42, 2.3], pop: '콩! 아야' }],
    ['pelican', '펠리컨', 'bird', 'M', 'water', { rain: 0.04 }, '부리 주머니', '부리 주머니에서 쓸 만한 아이템을 꺼내요.', 'item', { list: ['rocket', 'shield', 'banana', 'pie', 'carrot', 'magnet'] }],
    ['woodpecker', '딱따구리', 'bird', 'S', '', {}, '따다다닥 쪼기', '앞 동물을 따다다닥! 정신없어서 주춤해요.', 'hitAhead', { range: 22, kind: 'slow', fx: 'bonk', m: 0.6, t: 2.6, self: [1.45, 2.5], pop: '따다다닥!' }],
    ['pigeon', '비둘기', 'bird', 'S', '', {}, '편지 배달', '나와 맨 뒤 동물들에게 응원 편지를 배달해요.', 'rally', { n: 2, m: 1.35, sm: 1.55, t: 2.9 }],
    ['seagull', '갈매기', 'bird', 'S', 'water', { rain: 0.03 }, '간식 낚아채기', '빨라진 동물의 기운을 간식처럼 낚아채요.', 'leech', {}],
    ['sparrow', '참새', 'bird', 'S', '', {}, '짹짹 떼 지어 날기', '주변에 동물이 많을수록 신나서 빨라져요.', 'scale', { by: 'near', range: 20, base: 1.2, step: 0.07, max: 1.6, t: 2.4 }, '짹짹! 신나게 날아갑니다.'],
    ['hummingbird', '벌새', 'bird', 'S', '', { rain: -0.03, heat: 0.02 }, '초고속 날갯짓', '눈에 안 보일 만큼 빠른 날갯짓으로 붕 떠서 가요.', 'boost', { m: 1.7, t: 1.9, air: 1, fx: 'fly' }, '붕~ 하고 날아갑니다.'],
    ['kiwi', '키위새', 'bird', 'S', 'nofog', { fog: 0.04 }, '지렁이 간식', '잠깐 멈춰 지렁이를 먹고 힘차게 달려요.', 'feast', { wait: 0.9, m: 1.58, t: 2.7 }],
    ['turkey', '칠면조', 'bird', 'M', '', {}, '깃털 부풀리기', '깃털을 잔뜩 부풀려 방해를 튕겨 내요.', 'guard', { imm: 1, m: 1.3, t: 3.0, fx: 'giant' }, '몸이 두 배로 커 보여요!'],
    ['crane', '두루미', 'bird', 'M', 'water', { rain: 0.03, snow: 0.03 }, '학다리 성큼', '긴 다리로 성큼성큼, 바닥 방해를 넘어가요.', 'boost', { m: 1.34, t: 2.6, gnd: 1 }, '성큼성큼 넘어갑니다.'],
    ['stork', '황새', 'bird', 'M', 'water', { rain: 0.03 }, '행운 배달', '뒤에 있는 친구에게 행운을 배달해 함께 빨라져요.', 'buddy', { m: 1.5, m2: 1.3, t: 2.8 }],
    ['puffin', '퍼핀', 'bird', 'S', 'water ice', { rain: 0.04, snow: 0.04, heat: -0.05 }, '파도 타기', '파도를 타듯 미끄러져요. 젖은 길이면 더 멀리!', 'boost', { m: 1.36, t: 2.0, gnd: 1, wetK: 1.4, fx: 'slide' }, '쭈욱 미끄러집니다.'],
    ['robin', '울새', 'bird', 'S', '', { snow: 0.02 }, '아침 노래', '맑은 노래로 나와 뒤처진 동물들이 기운을 차려요.', 'rally', { n: 3, m: 1.3, sm: 1.55, t: 2.9 }],
    ['canary', '카나리아', 'bird', 'S', '', { snow: -0.03 }, '고운 노래 자장가', '노래를 들은 가까운 동물 둘이 꾸벅꾸벅 졸아요.', 'area', { range: 25, max: 2, kind: 'stun', fx: 'sleep', t: 1.3, self: [1.42, 2.4], ev: 'sonar', pop: '쿨쿨…' }],
    ['cockatoo', '왕관앵무', 'bird', 'S', '', { heat: 0.03, snow: -0.04 }, '흉내 내기', '바로 앞 동물의 스킬을 그대로 흉내 내요.', 'mimic', { who: 'ahead' }],
    ['vulture', '대머리수리', 'bird', 'M', '', { heat: 0.04 }, '기다렸다 덮치기', '뒤에서 기다릴수록 더 세게 치고 나가요.', 'scale', { by: 'rank', base: 1.3, step: 0.07, max: 1.8, t: 2.4 }, '때를 기다렸다 치고 나갑니다!'],
    ['dodo', '도도새', 'bird', 'M', '', {}, '될 대로 돼라', '얼마나 빨라질지는 도도새도 몰라요.', 'boost', { rand: [1.15, 2.1], t: 2.4 }, '에라 모르겠다, 달려!'],
    // 공룡 · 옛 동물
    ['trex', '티라노사우루스', 'dino', 'L', 'heavy', { heat: 0.02 }, '쩌렁쩌렁 대포효', '무시무시한 포효에 멀리 있는 동물까지 겁을 먹어요.', 'area', { range: 36, kind: 'slow', fx: 'scared', m: 0.66, t: 2.2, self: [1.25, 2.2], ev: 'roar', pop: '으아악!' }],
    ['triceratops', '트리케라톱스', 'dino', 'L', 'heavy', {}, '세 뿔 돌진', '뿔을 앞세워 돌진! 스쳐 지나간 동물은 휘청거려요.', 'boost', { m: 1.5, t: 2.4, imm: 1, bump: 1, fx: 'charge' }, '뿔을 앞세워 돌진합니다!'],
    ['stego', '스테고사우루스', 'dino', 'L', 'heavy', {}, '꼬리 가시 휘두르기', '꼬리를 휘둘러 뒤따르는 동물들을 넘어뜨려요.', 'area', { dir: 'behind', range: 16, kind: 'stun', fx: 'trip', t: 0.9, self: [1.45, 2.4], pop: '퍽! 꽈당' }],
    ['brachio', '브라키오사우루스', 'dino', 'L', 'heavy reach', {}, '쿵쿵 발 구르기', '큰 발로 쿵쿵! 땅이 울려 주변 동물이 넘어져요.', 'area', { range: 24, kind: 'stun', fx: 'trip', t: 0.75, ground: 1, self: [1.25, 2.0], ev: 'roar', pop: '쿵! 꽈당' }],
    ['raptor', '벨로키랍토르', 'dino', 'M', 'quick', {}, '발톱 걸기', '날쌔게 달려들어 앞 동물 발을 걸어요.', 'hitAhead', { range: 24, kind: 'stun', fx: 'trip', t: 0.95, leap: 1, fog: 1, pop: '어이쿠!' }],
    ['ptero', '프테라노돈', 'dino', 'M', '', { rain: -0.03 }, '하늘 활공', '큰 날개를 펴고 트랙 위를 길게 날아가요.', 'boost', { m: 1.4, t: 3.2, air: 1, fx: 'fly' }, '큰 날개로 길게 날아갑니다.'],
    ['ankylo', '안킬로사우루스', 'dino', 'L', 'heavy', {}, '꼬리 곤봉', '꼬리 곤봉으로 바로 뒤 동물을 뻥! 뒤로 밀어내요.', 'kick', { range: 12, push: 6, self: [1.52, 2.4] }],
    ['parasaur', '파라사우롤로푸스', 'dino', 'M', '', {}, '뿔나팔 불기', '뿌우우~ 나팔 소리에 모두가 귀를 막고 느려져요.', 'global', { kind: 'slow', fx: 'slowmo', m: 0.6, t: 2.2, self: [1.35, 2.4], ev: 'slowmo', pop: '귀 따가워~' }],
    ['spino', '스피노사우루스', 'dino', 'L', 'water heavy', { rain: 0.05 }, '물살 가르기', '물살을 가르듯 돌진해요. 젖은 길이면 더 오래가요.', 'boost', { m: 1.4, t: 2.1, gnd: 1, wetK: 1.5, fx: 'slide' }, '물살을 가르며 나갑니다.'],
    ['diplodocus', '디플로도쿠스', 'dino', 'L', 'heavy reach', {}, '긴 꼬리 채찍', '긴 꼬리를 휘둘러 뒤따르는 동물들을 빙글 돌려요.', 'area', { dir: 'behind', range: 20, kind: 'stun', fx: 'spin', t: 0.85, self: [1.45, 2.4], pop: '찰싹!' }],
    ['pachy', '파키케팔로사우루스', 'dino', 'M', '', {}, '돌머리 박치기', '단단한 머리로 앞 동물을 쾅! 넘어뜨려요.', 'hitAhead', { range: 16, kind: 'stun', fx: 'trip', t: 1.05, self: [1.45, 2.3], pop: '쾅!' }],
    ['dilopho', '딜로포사우루스', 'dino', 'M', '', {}, '독 침 뱉기', '앞 동물 얼굴에 침을 뱉어 앞이 안 보이게 해요.', 'hitAhead', { range: 30, kind: 'slow', fx: 'pie', m: 0.58, t: 2.3, fog: 1, proj: 'spit', back: 20, self: [1.45, 2.5], pop: '으악, 침이다!' }],
    ['compy', '콤프소그나투스', 'dino', 'S', 'quick', {}, '우르르 몰려가기', '주변에 동물이 많을수록 더 신나게 달려요.', 'scale', { by: 'near', range: 20, base: 1.2, step: 0.07, max: 1.6, t: 2.4 }, '우르르 몰려갑니다!'],
    ['plesio', '플레시오사우루스', 'dino', 'M', 'water reach', { rain: 0.06 }, '물속 질주', '물속처럼 매끄럽게. 젖은 길이면 훨씬 오래가요.', 'boost', { m: 1.32, t: 2.2, gnd: 1, wetK: 1.5, fx: 'slide' }, '매끄럽게 미끄러져 갑니다.'],
    ['mammoth', '매머드', 'dino', 'L', 'heavy ice', { snow: 0.07, heat: -0.08 }, '눈보라 콧김', '코로 눈보라를 뿜어 앞 동물을 꽁꽁 얼려요.', 'hitAhead', { range: 28, kind: 'stun', fx: 'ice', t: 1.15, fog: 1, proj: 'frost', self: [1.3, 2.0], pop: '꽁꽁!' }],
    ['sabertooth', '검치호', 'dino', 'M', '', { snow: 0.04, heat: -0.03 }, '송곳니 덮치기', '훌쩍 뛰어 앞 동물을 덮쳐 넘어뜨려요.', 'hitAhead', { range: 25, kind: 'stun', fx: 'trip', t: 0.9, leap: 1, fog: 1, pop: '으악!' }],
    ['dimetrodon', '디메트로돈', 'dino', 'M', '', { heat: 0.05, snow: -0.06 }, '돛 충전', '등의 돛으로 햇볕을 모아 힘차게 달려요. 더운 날엔 더 오래가요.', 'feast', { wait: 0.9, m: 1.56, t: 2.7, heatK: 1.4 }],
    ['archaeo', '시조새', 'dino', 'S', '', {}, '서툰 첫 비행', '파닥파닥! 얼마나 날지는 그때그때 달라요.', 'boost', { rand: [1.25, 2.0], t: 2.2, air: 1, fx: 'fly' }, '파닥파닥 날아오릅니다!'],
    // 포유류
    ['capybara', '카피바라', 'mam', 'M', 'water steady', { rain: 0.04 }, '다 같이 친구', '누구와도 친해요. 나와 뒤에 있는 친구가 함께 빨라져요.', 'buddy', { m: 1.5, m2: 1.35, t: 2.8 }],
    ['fennec', '사막여우', 'mam', 'S', 'nofog', { heat: 0.06, snow: -0.04 }, '큰 귀 레이더', '큰 귀로 방해를 미리 알아채고 요리조리 피해요.', 'guard', { imm: 1, m: 1.3, t: 3.0, fx: 'illusion' }, '요리조리 피하며 달려요.'],
    ['meerkat', '미어캣', 'mam', 'S', '', { heat: 0.04 }, '보초 서기', '벌떡 서서 살핀 뒤 방패를 두르고 달려요.', 'guard', { shield: 8, m: 1.32, t: 2.2 }, '방패를 두르고 달립니다.'],
    ['badger', '오소리', 'mam', 'M', 'nofog', { fog: 0.03 }, '땅굴 파기', '땅속으로 쏙 들어가 저 앞에서 튀어나와요.', 'burrow', {}],
    ['ferret', '족제비', 'mam', 'S', 'nimble', {}, '쏙쏙 빠져나가기', '느려진 것을 싹 떨치고 날쌔게 빠져나가요.', 'guard', { cleanse: 1, gnd: 1, m: 1.42, t: 2.2 }, '날쌔게 빠져나갑니다.'],
    ['chipmunk', '줄무늬다람쥐', 'mam', 'S', 'glutton', {}, '볼주머니 간식', '볼에 넣어 둔 도토리를 먹고 힘을 내요.', 'feast', { wait: 0.9, m: 1.55, t: 2.7 }],
    ['leopard', '표범', 'mam', 'M', '', { heat: 0.02 }, '나무 위 덮치기', '훌쩍 뛰어 앞 동물을 덮쳐 넘어뜨려요.', 'hitAhead', { range: 25, kind: 'stun', fx: 'trip', t: 0.9, leap: 1, fog: 1, pop: '으악!' }],
    ['panther', '흑표범', 'mam', 'M', 'nofog nimble', { fog: 0.05 }, '그림자 숨기', '어둠에 숨듯 방해를 피하며 달려요.', 'guard', { imm: 1, m: 1.24, t: 2.9, fx: 'illusion' }, '그림자처럼 스며들어 달려요.'],
    ['hyena', '하이에나', 'mam', 'M', '', { heat: 0.03 }, '낄낄 가로채기', '빨라진 동물의 기운을 낄낄 웃으며 가로채요.', 'leech', {}],
    ['lynx', '스라소니', 'mam', 'M', 'nimble', { snow: 0.05 }, '날쌘 앞발', '앞 동물을 툭 쳐서 빙글 돌게 해요.', 'hitAhead', { range: 22, kind: 'stun', fx: 'spin', t: 1.15, fog: 1, proj: 'paw', self: [1.42, 2.2], pop: '빙글빙글~' }],
    ['bison', '들소', 'mam', 'L', 'heavy', { snow: 0.03 }, '대평원 돌진', '점점 빨라지는 돌진. 어떤 방해도 안 통해요.', 'boost', { m: 1.15, t: 2.8, imm: 1, ramp: [1.15, 1.6], fx: 'charge' }, '점점 빨라집니다!'],
    ['moose', '무스', 'mam', 'L', 'heavy', { snow: 0.05, heat: -0.04 }, '큰 뿔 반사', '다음 방해를 큰 뿔로 받아쳐 되돌려줘요.', 'guard', { shield: 6, reflect: 1, m: 1.25, t: 2.2 }, '다음 방해는 그대로 되돌아갑니다.'],
    ['reindeer', '순록', 'mam', 'M', 'hurdler', { snow: 0.07, heat: -0.05 }, '썰매 끄는 비행', '빨간 코를 밝히고 하늘로! 눈 오는 날엔 더 오래 날아요.', 'boost', { m: 1.45, t: 2.6, air: 1, snowK: 1.5, fx: 'fly' }, '하늘로 날아오릅니다!'],
    ['llama', '라마', 'mam', 'M', '', { snow: 0.02 }, '퉤퉤 침 세례', '앞선 동물들에게 침을 뱉어 주춤하게 해요.', 'area', { dir: 'ahead', range: 40, max: 3, kind: 'slow', fx: 'bonk', m: 0.72, t: 1.9, self: [1.45, 2.4], pop: '으, 침!' }],
    ['donkey', '당나귀', 'mam', 'M', '', {}, '고집 뒷발차기', '바로 뒤 동물을 뒷발로 뻥! 뒤로 밀어내요.', 'kick', { range: 10, push: 6, self: [1.52, 2.4] }],
    ['boar', '멧돼지', 'mam', 'M', 'heavy mud', {}, '저돌 맹진', '앞만 보고 돌진! 스쳐 지나간 동물은 휘청거려요.', 'boost', { m: 1.45, t: 2.2, imm: 1, bump: 1, fx: 'charge' }, '앞만 보고 돌진합니다!'],
    ['anteater', '개미핥기', 'mam', 'M', '', {}, '긴 혀 낼름', '긴 혀로 앞 동물을 붙잡고 단숨에 따라붙어요.', 'grapple', { range: 22 }],
    ['armadillo', '아르마딜로', 'mam', 'S', '', {}, '공처럼 말기', '몸을 공처럼 말고 데굴데굴, 방해도 튕겨 내요.', 'boost', { m: 1.45, t: 2.6, imm: 1, fx: 'roll' }, '데굴데굴 굴러갑니다.'],
    ['pangolin', '천산갑', 'mam', 'S', '', {}, '비늘 갑옷', '비늘을 세운 동안 방해한 동물이 오히려 따끔!', 'guard', { thorns: 1, m: 1.18, t: 3.6 }, '건드리면 따끔합니다!'],
    ['platypus', '오리너구리', 'mam', 'S', 'water', { rain: 0.05 }, '독 발톱', '숨겨 둔 독 발톱으로 앞 동물을 콕 찔러요.', 'hitAhead', { range: 18, kind: 'stun', fx: 'sting', t: 1.0, self: [1.42, 2.3], pop: '앗 따가!' }],
    ['wombat', '웜뱃', 'mam', 'M', '', {}, '네모 블록 쌓기', '지나간 자리에 블록을 쌓아 뒤따르는 동물을 막아요.', 'wall', { self: [1.5, 2.6] }],
    ['quokka', '쿼카', 'mam', 'S', '', {}, '행복 미소', '방긋 웃으면 가까운 동물들이 따라 웃다 멈춰요.', 'area', { range: 18, kind: 'stun', fx: 'charm', t: 0.9, self: [1.3, 2.2], ev: 'charm', pop: '헤헤, 귀여워…' }],
    ['lemur', '여우원숭이', 'mam', 'S', '', { heat: 0.03 }, '나무 타기 점프', '나무 사이를 건너뛰듯 높이 뛰어 장애물을 넘어요.', 'boost', { m: 1.9, t: 1.3, air: 1, fx: 'jump' }, '훌쩍 뛰어오릅니다!'],
    ['orangutan', '오랑우탄', 'mam', 'L', '', { heat: 0.02 }, '긴 팔 쭉 뻗기', '긴 팔로 앞 동물을 붙잡고 단숨에 따라붙어요.', 'grapple', { range: 24 }],
    ['chimp', '침팬지', 'mam', 'M', '', {}, '도구 쓰기', '똑똑하게 도구를 골라 써요. 쓸 만한 아이템을 바로 얻어요.', 'item', { list: ['rocket', 'shield', 'magnet', 'mush', 'bolt'] }]
  ];
  var MORE_SPEED = {
    shark: 7.607, whale: 7.545, dolphin: 7.542, orca: 7.423, octopus: 7.631, squid: 7.636, crab: 7.55, lobster: 7.572,
    shrimp: 7.507, jellyfish: 7.449, starfish: 7.487, seahorse: 7.529, clownfish: 7.508, puffer: 7.494, manta: 7.515, walrus: 7.443,
    narwhal: 7.442, sealion: 7.536, manatee: 7.597, beluga: 7.496, swordfish: 7.518, angler: 7.567, seaturtle: 7.437, snake: 7.707,
    cobra: 7.669, lizard: 7.521, chameleon: 7.555, iguana: 7.832, gecko: 7.483, komodo: 7.699, tortoise: 7.56, axolotl: 7.477,
    salamander: 7.566, toad: 7.528, eagle: 7.734, falcon: 7.647, crow: 7.636, swan: 7.535, goose: 7.555, peacock: 7.632,
    toucan: 7.671, pelican: 7.595, woodpecker: 7.614, pigeon: 7.592, seagull: 7.558, sparrow: 7.584, hummingbird: 7.593, kiwi: 7.744,
    turkey: 7.599, crane: 7.63, stork: 7.567, puffin: 7.429, robin: 7.603, canary: 7.599, cockatoo: 7.628, vulture: 7.59,
    dodo: 7.595, trex: 7.685, triceratops: 7.483, stego: 7.632, brachio: 7.598, raptor: 7.614, ptero: 7.678, ankylo: 7.654,
    parasaur: 7.566, spino: 7.579, diplodocus: 7.566, pachy: 7.676, dilopho: 7.674, compy: 7.596, plesio: 7.53, mammoth: 7.617,
    sabertooth: 7.609, dimetrodon: 7.845, archaeo: 7.541, capybara: 7.532, fennec: 7.496, meerkat: 7.544, badger: 7.648, ferret: 7.471,
    chipmunk: 7.801, leopard: 7.606, panther: 7.454, hyena: 7.641, lynx: 7.466, bison: 7.518, moose: 7.656, reindeer: 7.562,
    llama: 7.659, donkey: 7.645, boar: 7.488, anteater: 7.687, armadillo: 7.493, pangolin: 7.596, platypus: 7.516, wombat: 7.639,
    quokka: 7.529, lemur: 7.589, orangutan: 7.75, chimp: 7.614
  };
  var SIZE_DEF = { S: [8.4, 0.9, 0.8], M: [7.0, 0.5, 0.65], L: [5.6, 0.1, 0.35] };
  MORE.forEach(function (m) {
    var d = SIZE_DEF[m[3]], tr = {};
    m[4].split(' ').forEach(function (k) { if (k) tr[k] = 1; });
    ANIMALS.push({ id: m[0], name: m[1], cat: m[2], speed: MORE_SPEED[m[0]] || 7.6, accel: d[0], light: d[1], agi: d[2], tr: tr, wx: m[5],
      skill: { name: m[6], desc: m[7], type: m[8], p: m[9], say: m[10] } });
  });

  // 분류 (도감에서 묶어 보여 줌)
  var CATS = [['mam', '포유류'], ['bird', '새'], ['rep', '파충류 · 양서류'], ['sea', '바다 동물'], ['dino', '공룡 · 옛 동물']];
  var CAT_OF = { penguin: 'bird', duck: 'bird', owl: 'bird', chicken: 'bird', parrot: 'bird', flamingo: 'bird', ostrich: 'bird', turtle: 'rep', croc: 'rep', frog: 'rep', seal: 'sea' };
  // 특성 · 날씨로 '한마디'를 자동으로 붙인다 (직접 적은 것이 없을 때)
  function autoPassive(a) {
    var t = a.tr, w = a.wx, best = null, k;
    if (t.reach) return '결승선에서는 긴 목이 먼저 닿아요.';
    if (t.heavy) return '두더지와 허들쯤은 그냥 밟고 지나가요.';
    if (t.ice) return '빙판길이 오히려 좋아요.';
    if (t.hurdler) return '허들도 가볍게 넘어요.';
    if (t.water) return '비 오는 날 물웅덩이가 반가워요.';
    if (t.nofog) return '안개 속에서도 길을 잘 찾아요.';
    if (t.glutton) return '간식을 먹으면 힘이 더 오래가요.';
    if (t.steady) return '꾸준해서 날씨가 나빠도 덜 느려져요.';
    if (t.quick) return '출발이 아주 빨라요.';
    if (t.nimble) return '넘어져도 금방 일어나요.';
    for (k in w) if (w[k] > 0 && (!best || w[k] > w[best])) best = k;
    if (best === 'snow') return '눈 오는 날에 강해요.';
    if (best === 'heat') return '더운 날씨에 강해요.';
    if (best === 'rain') return '비 오는 날에 강해요.';
    if (best === 'fog') return '안개 낀 날에 강해요.';
    if (a.light >= 0.85) return '가벼워서 뒷바람을 잘 타요.';
    if (a.light <= 0.15) return '묵직해서 바람에 잘 안 밀려요.';
    return '어떤 날씨에도 한결같이 달려요.';
  }
  ANIMALS.forEach(function (a) {
    if (!a.cat) a.cat = CAT_OF[a.id] || 'mam';
    if (!a.passive) a.passive = autoPassive(a);
  });
  // 결과 문장에 쓰는 말
  var FXWORD = { spin: '빙글 돌아요.', trip: '넘어졌어요.', zap: '찌릿해서 멈췄어요.', sleep: '스르르 잠들었어요.', lift: '하늘로 붕 떠올랐어요.', sting: '따끔해서 펄쩍 뛰었어요.',
    ice: '꽁꽁 얼었어요.', pity: '멈춰 섰어요.', charm: '넋을 잃고 멈춰 섰어요.', bonk2: '머리가 어질어질해요.', pie: '앞이 안 보여요.', wet: '흠뻑 젖었어요.',
    scared: '깜짝 놀라 주춤해요.', lost: '길을 헤매요.', stink: '코를 막고 주춤해요.', bonk: '아파서 주춤해요.', slowmo: '느릿느릿해졌어요.', pulled: '붙잡혀 버둥거려요.' };

  var ANIMAL_BY_ID = {};
  ANIMALS.forEach(function (a) { ANIMAL_BY_ID[a.id] = a; });

  // ───────────── 아이템 12종 ─────────────
  var ITEMS = {
    carrot:  { name: '에너지 당근', desc: '잠깐 동안 빨라져요.' },
    rocket:  { name: '로켓 부스터', desc: '아주 빠르게 쏜살같이 나가요.' },
    banana:  { name: '바나나 껍질', desc: '상대 레인에 던져 미끄러지게 해요.' },
    pie:     { name: '크림 파이', desc: '상대 얼굴에 맞혀 앞이 안 보이게 해요.' },
    shield:  { name: '비눗방울 방패', desc: '방해를 한 번 막아 줘요.' },
    bolt:    { name: '번개 구름', desc: '선두에게 번개가 떨어져요.' },
    magnet:  { name: '자석', desc: '앞선 동물에게 끌려가며 빨라져요.' },
    swap:    { name: '자리 바꾸기 포탈', desc: '바로 앞 동물과 자리를 맞바꿔요.' },
    mega:    { name: '응원 확성기', desc: '나와 꼴찌 동물들이 함께 힘을 내요.' },
    mush:    { name: '거대 버섯', desc: '몸이 커져서 빨라지고 방해도 안 통해요.' },
    lullaby: { name: '자장가 오르골', desc: '앞선 동물들이 꾸벅꾸벅 졸아요.' },
    tornado: { name: '회오리', desc: '앞쪽 세 마리를 빙글빙글 돌려요.' }
  };

  // ───────────── 날씨 7종 ─────────────
  var WEATHERS = {
    sunny: { id: 'sunny', name: '맑음', base: 0, desc: '달리기 딱 좋은 날씨예요.' },
    rain:  { id: 'rain', name: '비', base: -0.03, desc: '웅덩이를 조심하세요. 물을 좋아하는 동물은 신나요.' },
    snow:  { id: 'snow', name: '눈', base: -0.05, desc: '길이 미끄러워요. 추위에 강한 동물이 유리해요.' },
    wind:  { id: 'wind', name: '강풍', base: 0, desc: '가벼운 동물일수록 바람에 휘청거려요.' },
    heat:  { id: 'heat', name: '폭염', base: -0.02, desc: '더위에 약한 동물은 금방 지쳐요.' },
    fog:   { id: 'fog', name: '안개', base: 0, desc: '던지는 아이템이 잘 빗나가요.' },
    storm: { id: 'storm', name: '천둥번개', base: -0.03, desc: '번개가 언제 누구에게 떨어질지 몰라요.' }
  };
  var WEATHER_WEIGHTS = [['sunny', 26], ['rain', 16], ['snow', 12], ['wind', 14], ['heat', 12], ['fog', 10], ['storm', 10]];

  // ───────────── 경주 만들기 ─────────────
  // opts : { names:[...], seed, animals:[id...] (없으면 랜덤), weather:id (없으면 랜덤), tune:{id:속력보정} }
  function createRace(opts) {
    var seed = (opts.seed === undefined || opts.seed === null) ? ((Math.random() * 4294967296) >>> 0) : (opts.seed >>> 0);
    var rng = makeRng(seed);
    var n = opts.names.length;
    var picked = opts.animals ? opts.animals.map(function (id) { return ANIMAL_BY_ID[id]; })
                              : rng.shuffle(ANIMALS.slice()).slice(0, n);
    var wid = opts.weather || rng.weighted(WEATHER_WEIGHTS);

    var race = {
      len: LEN, seed: seed, t: 0, rng: rng,
      racers: [], objects: [], ev: [],
      weather: null, wxChangeAt: null,
      over: false, finished: 0, leadX: 0,
      nextEvent: rng.range(7, 10.5), lastEvent: null, eventCount: 0, lastSkill: null,
      cdMul: n <= 8 ? 1 : 1 + (n - 8) * 0.03,          // 스킬 쉬는 시간 배율
      order: []
    };

    function setWeather(id) {
      var w = WEATHERS[id];
      race.weather = { id: w.id, name: w.name, desc: w.desc, base: w.base, gust: 0, timer: rng.range(2.5, 4.5) };
    }
    setWeather(wid);
    if (!opts.noWeatherChange && rng.chance(0.4)) race.wxChangeAt = rng.range(20, 38);

    var i;
    for (i = 0; i < n; i++) {
      var a = picked[i];
      var form = [];
      for (var k = 0; k < 5; k++) form.push(1 + clamp(rng.gauss() * 0.024, -0.06, 0.06));
      var nm = (opts.names[i] || '').trim();
      race.racers.push({
        i: i, lane: i + 1, name: nm || a.name, named: !!nm, a: a,
        x: 0, prevX: 0, v: 0,
        cond: 1 + clamp(rng.gauss() * 0.012, -0.03, 0.03),
        form: form, noise: 0, draft: false,
        tune: (opts.tune && opts.tune[a.id]) || 0,
        startDelay: rng.range(0.02, 0.28) * (a.tr.quick ? 0.3 : 1),
        fx: [],
        item: null, itemT: 0, itemWait: 0,
        skillT: rng.range(6, 13) * (n <= 8 ? 1 : 1 + (n - 8) * 0.03), skillWait: 0,
        finished: false, finT: null, place: 0, rank: i + 1,
        napped: false, napMarks: [150, 250, 350], bumped: null,
        stats: { skills: 0, items: 0, gave: 0, took: 0, helps: 0, top: 0, leadTime: 0, blocked: 0 }
      });
    }

    // 아이템 상자 : 5줄, 레인마다 65% 확률 (참가가 많으면 조금씩 줄임)
    var boxP = n <= 8 ? 0.65 : Math.max(0.38, 0.65 - (n - 8) * 0.02);
    [70, 160, 250, 340, 430].forEach(function (bx) {
      for (var li = 0; li < n; li++) {
        if (rng.chance(boxP)) race.objects.push({ type: 'box', lane: li + 1, x: bx + rng.range(-6, 6), taken: false, id: race.objects.length });
      }
    });

    // ── 화면으로 보내는 알림 ──
    // 이름 나열 (많으면 '아무개, 아무개 등 7마리' 로 줄인다)
    function shortNames(nm) { return nm.length > 3 ? nm.slice(0, 2).join(', ') + ' 등 ' + nm.length + '마리' : nm.join(', '); }
    function log(cls, r, msg) { race.ev.push({ k: 'log', cls: cls, r: r ? r.i : -1, msg: msg, t: race.t }); }
    function pop(r, text, cls) { race.ev.push({ k: 'pop', r: r.i, text: text, cls: cls || '' }); }
    function banner(id, title, sub) { race.ev.push({ k: 'banner', id: id, title: title, sub: sub || '' }); }
    function sfx(id) { race.ev.push({ k: 'sfx', id: id }); }
    function proj(kind, from, to) { race.ev.push({ k: 'proj', kind: kind, from: from ? from.i : -1, to: to.i }); }

    // ── 상태 효과 ──
    // kind : boost(빨라짐) · slow(느려짐) · stun(멈춤) · shield(한 번 막기) · buff(속력 변화 없음)
    // 깃발 : imm(방해 안 통함) · air(공중 — 바닥 방해 안 통함) · gnd(바닥 방해 안 통함)
    function addFx(r, e) {
      e.dur = e.t;
      for (var j = 0; j < r.fx.length; j++) {
        if (r.fx[j].fx === e.fx) {
          if (e.t >= r.fx[j].t) { r.fx[j] = e; }
          return;
        }
      }
      r.fx.push(e);
    }
    function hasKind(r, kind) { for (var j = 0; j < r.fx.length; j++) if (r.fx[j].kind === kind) return true; return false; }
    function hasFlag(r, flag) { for (var j = 0; j < r.fx.length; j++) if (r.fx[j][flag]) return true; return false; }
    function stunned(r) { return hasKind(r, 'stun'); }
    function boosted(r) { return hasKind(r, 'boost'); }
    function foggy() { return race.weather.id === 'fog'; }
    function wet() { var w = race.weather.id; return w === 'rain' || w === 'snow' || w === 'storm'; }

    // 방해 걸기 → 'hit' · 'miss' · 'blocked' · 'dodged' · 'shield' · 'none'
    function applyNeg(src, tgt, spec) {
      if (tgt.finished) return 'none';
      if (spec.fogMiss && foggy() && rng.chance(0.35)) { pop(tgt, '빗나감!', 'good'); return 'miss'; }
      if (hasFlag(tgt, 'imm')) {
        pop(tgt, '튕겨 냄!', 'good'); tgt.stats.blocked++;
        // 가시를 세운 동물을 건드리면 오히려 따끔
        if (hasFlag(tgt, 'thorns') && src && src !== tgt && !src.finished && !spec.noReflect) {
          if (applyNeg(tgt, src, { kind: 'stun', fx: 'sting', t: 0.8, noReflect: true }) === 'hit') pop(src, '앗, 따가워!', 'bad');
        }
        return 'blocked';
      }
      if (spec.kind === 'slow' && hasFlag(tgt, 'noslow')) { pop(tgt, '끄떡없음!', 'good'); tgt.stats.blocked++; return 'blocked'; }
      if (spec.ground && (hasFlag(tgt, 'air') || hasFlag(tgt, 'gnd'))) { pop(tgt, '휙~ 피함', 'good'); tgt.stats.blocked++; return 'dodged'; }
      for (var j = 0; j < tgt.fx.length; j++) {
        if (tgt.fx[j].kind === 'shield') {
          var sh = tgt.fx[j];
          tgt.fx.splice(j, 1);
          sfx('block'); tgt.stats.blocked++;
          if (sh.reflect && src && src !== tgt && !src.finished && !spec.noReflect) {
            // 뿔 반사 : 같은 방해를 건 동물에게 되돌린다
            pop(tgt, '뿔로 받아침!', 'good');
            var back = { kind: spec.kind, fx: spec.fx, t: spec.t, m: spec.m, noReflect: true };
            if (applyNeg(tgt, src, back) === 'hit') pop(src, '되돌아왔다!', 'bad');
            return 'reflect';
          }
          pop(tgt, '방패로 막음!', 'good');
          return 'shield';
        }
      }
      var dur = spec.t;
      if (tgt.a.tr.nimble && spec.kind === 'stun') dur *= 0.6;   // 금방 일어나는 동물
      addFx(tgt, { kind: spec.kind, fx: spec.fx, t: dur, m: spec.m === undefined ? 0 : spec.m });
      if (spec.kind === 'stun') {
        // 멈추면 공중·돌진 같은 동작은 끝난다
        tgt.fx = tgt.fx.filter(function (e) { return !(e.air || e.cancelOnStun); });
      }
      if (!spec.minor) { tgt.stats.took++; if (src && src !== tgt) src.stats.gave++; }
      return 'hit';
    }

    // ── 대상 찾기 ──
    function active() { return race.racers.filter(function (r) { return !r.finished; }); }
    function aheadOf(r, maxD) {
      var best = null;
      race.racers.forEach(function (o) {
        if (o === r || o.finished) return;
        var d = o.x - r.x;
        if (d > 0 && d <= maxD && (!best || d < best.x - r.x)) best = o;
      });
      return best;
    }
    function behindOf(r, maxD) {
      var best = null;
      race.racers.forEach(function (o) {
        if (o === r || o.finished) return;
        var d = r.x - o.x;
        if (d >= 0 && d <= maxD && (!best || d < r.x - best.x)) best = o;
      });
      return best;
    }
    function leaderOf() {
      var best = null;
      race.racers.forEach(function (o) { if (!o.finished && (!best || o.x > best.x)) best = o; });
      return best;
    }
    function sortedActive() { return active().sort(function (p, q) { return q.x - p.x; }); }

    function computeRanks() {
      var arr = race.racers.slice().sort(function (p, q) {
        if (p.finished && q.finished) return p.finT - q.finT;
        if (p.finished) return -1;
        if (q.finished) return 1;
        return q.x - p.x;
      });
      var lead = 0;
      for (var j = 0; j < arr.length; j++) {
        arr[j].rank = j + 1;
        if (!arr[j].finished && arr[j].x > lead) lead = arr[j].x;
      }
      race.order = arr;
      race.leadX = race.finished > 0 ? Math.max(lead, LEN) : lead;
      // 바람막이 : 바로 앞에 누가 있으면 조금 편하게 달린다
      race.racers.forEach(function (r) {
        r.draft = false;
        if (r.finished) return;
        for (var q = 0; q < race.racers.length; q++) {
          var o = race.racers[q];
          if (o === r || o.finished) continue;
          var d = o.x - r.x;
          if (d > 0.8 && d < 5) { r.draft = true; break; }
        }
      });
    }

    // ───────────── 날씨 ─────────────
    function weatherMult(r) {
      var w = race.weather, a = r.a;
      var key = w.id === 'storm' ? 'rain' : w.id;
      var m = w.base + (a.wx[key] || 0);
      if (a.tr.steady && m < 0) m *= 0.5;                // 꾸준함
      var out = 1 + m;
      if (w.id === 'wind' && w.gust) out += w.gust * (0.25 + 0.95 * a.light);
      return out;
    }

    function randomActive(filter) {
      var arr = active().filter(function (r) { return r.x > 8 && r.x < LEN - 6 && (!filter || filter(r)); });
      return arr.length ? rng.pick(arr) : null;
    }

    function updateWeather(dt) {
      var w = race.weather;
      if (race.wxChangeAt !== null && race.t >= race.wxChangeAt && race.leadX < 430) {
        race.wxChangeAt = null;
        var ids = WEATHER_WEIGHTS.filter(function (p) { return p[0] !== w.id; });
        var prev = w.name;
        setWeather(rng.weighted(ids));
        w = race.weather;
        banner('wx_' + w.id, '날씨가 바뀝니다!', prev + ' → ' + w.name);
        log('weather', null, '날씨가 ' + prev + '에서 ' + josa(w.name, '으로', '로') + ' 바뀌었어요. ' + w.desc);
        sfx('weather');
        return;
      }
      w.timer -= dt;
      if (w.timer > 0) return;
      var r, res;
      switch (w.id) {
        case 'wind':
          if (w.gust) { w.gust = 0; w.timer = rng.range(3.5, 6); }
          else {
            w.gust = (rng.chance(0.5) ? 1 : -1) * rng.range(0.07, 0.12);
            w.timer = rng.range(2.5, 3.5);
            log('weather', null, w.gust > 0 ? '뒷바람이 붑니다! 가벼운 동물들이 쌩쌩 나가요.' : '맞바람이 붑니다! 가벼운 동물들이 휘청거려요.');
            race.ev.push({ k: 'gust', dir: w.gust > 0 ? 1 : -1 });
            sfx('wind');
          }
          break;
        case 'rain':
        case 'storm':
          w.timer = rng.range(2.6, 4.6);
          r = randomActive();
          if (r) {
            if (r.a.tr.water) {
              addFx(r, { kind: 'boost', fx: 'splash', t: 1.3, m: 1.15 });
              pop(r, '첨벙첨벙 신나요!', 'good');
            } else if (rng.chance(0.55)) {
              res = applyNeg(null, r, { kind: 'slow', fx: 'puddle', t: 1.3, m: 0.7, ground: true, minor: true });
              if (res === 'hit') pop(r, '웅덩이에 미끄덩', 'bad');
            }
          }
          if (w.id === 'storm') {
            w.bolt = (w.bolt || rng.range(4, 7)) - 3.6;
            if (w.bolt <= 0) {
              w.bolt = rng.range(5, 8);
              r = randomActive();
              if (r) {
                race.ev.push({ k: 'lightning', r: r.i });
                sfx('thunder');
                res = applyNeg(null, r, { kind: 'stun', fx: 'zap', t: 1.0 });
                if (res === 'hit') { pop(r, '찌릿찌릿!', 'bad'); log('weather', r, josa(r.name, '이', '가') + ' 번개에 맞아 깜짝 놀랐어요!'); }
                else log('weather', r, josa(r.name, '에게', '에게') + ' 번개가 떨어졌지만 무사해요!');
              }
            }
          }
          break;
        case 'snow':
          w.timer = rng.range(2.8, 4.8);
          r = randomActive();
          if (r) {
            if (r.a.tr.ice) {
              addFx(r, { kind: 'boost', fx: 'splash', t: 1.3, m: 1.15 });
              pop(r, '눈길이 최고야!', 'good');
            } else if (rng.chance(0.55)) {
              res = applyNeg(null, r, { kind: 'slow', fx: 'puddle', t: 1.4, m: 0.66, ground: true, minor: true });
              if (res === 'hit') pop(r, '빙판에 미끌', 'bad');
            }
          }
          break;
        case 'heat':
          w.timer = rng.range(3.6, 5.6);
          r = randomActive(function (q) { return (q.a.wx.heat || 0) <= 0; });
          if (r && rng.chance(0.7)) {
            res = applyNeg(null, r, { kind: 'slow', fx: 'hot', t: 2.0, m: 0.8, minor: true });
            if (res === 'hit') pop(r, '더워서 헥헥', 'bad');
          }
          break;
        case 'fog':
          w.timer = rng.range(4.5, 7);
          r = randomActive(function (q) { return !q.a.tr.nofog; });
          if (r && rng.chance(0.7)) {
            res = applyNeg(null, r, { kind: 'slow', fx: 'lost', t: 1.6, m: 0.74, minor: true });
            if (res === 'hit') pop(r, '어디가 앞이지?', 'bad');
          }
          break;
        default:
          w.timer = 5;
      }
    }

    // ───────────── 돌발 상황 9종 ─────────────
    var EVENT_WEIGHTS = [['bees', 10], ['moles', 12], ['snack', 11], ['crowd', 12], ['ufo', 9], ['hurdles', 12], ['slick', 11], ['star', 10], ['lace', 8]];

    function updateEvents() {
      if (race.t < race.nextEvent) return;
      if (race.leadX < 30) { race.nextEvent = race.t + 1; return; }
      if (race.leadX > 452 || race.finished > 0) { race.nextEvent = Infinity; return; }
      var pool = EVENT_WEIGHTS.filter(function (p) { return p[0] !== race.lastEvent; });
      var id = rng.weighted(pool);
      var act = active().filter(function (r) { return r.x < LEN - 8; });
      if (act.length === 0) { race.nextEvent = Infinity; return; }
      var ordered = act.slice().sort(function (p, q) { return q.x - p.x; });
      var lead = ordered[0];
      if ((id === 'hurdles' || id === 'slick') && lead.x > 440) id = 'crowd';
      if (id === 'bees' && act.length < 2) id = 'snack';
      race.lastEvent = id; race.eventCount++;
      race.nextEvent = race.t + rng.range(6.5, 10);
      var k, list, r, res;
      switch (id) {
        case 'bees':
          banner('bees', '벌떼 출현!', '쫓기는 동물은 전력 질주, 쏘이면 따끔');
          list = rng.shuffle(act.slice()).slice(0, Math.min(act.length, Math.max(2, Math.round(act.length / 5))));
          list.forEach(function (q) {
            if (rng.chance(0.6)) {
              addFx(q, { kind: 'boost', fx: 'bees', t: 3.0, m: 1.25 });
              pop(q, '으아악 벌이다!', 'good');
              log('event', q, josa(q.name, '이', '가') + ' 벌떼에 쫓겨 엄청난 속도로 달아나요!');
            } else {
              res = applyNeg(null, q, { kind: 'stun', fx: 'sting', t: 0.9 });
              if (res === 'hit') { pop(q, '따끔!', 'bad'); log('event', q, josa(q.name, '이', '가') + ' 벌에 쏘여 펄쩍 뛰었어요.'); }
            }
          });
          sfx('bees');
          break;
        case 'moles':
          banner('moles', '두더지 출현!', '갑자기 땅에서 불쑥 — 걸리면 꽈당');
          k = Math.max(1, Math.min(3, Math.ceil(act.length / 2.5)));
          list = rng.shuffle(act.slice()).slice(0, k);
          list.forEach(function (q) {
            race.objects.push({ type: 'mole', lane: q.lane, x: q.x + rng.range(9, 13), born: race.t, done: false, id: race.objects.length });
          });
          log('event', null, '두더지가 레인 ' + list.map(function (q) { return q.lane; }).sort().join('·') + '번에 불쑥 나타났어요!');
          sfx('pop');
          break;
        case 'snack':
          banner('snack', '하늘에서 간식이!', '받아 먹은 동물은 힘이 불끈');
          k = Math.max(1, Math.ceil(act.length / 2));
          list = rng.shuffle(act.slice()).slice(0, k);
          list.forEach(function (q) {
            var d = q.a.tr.glutton ? 3.3 : 2.2;
            addFx(q, { kind: 'boost', fx: 'snack', t: d, m: 1.28 });
            pop(q, '냠냠! 힘이 난다', 'good');
          });
          log('event', null, '간식이 쏟아집니다! ' + josa(shortNames(list.map(function (q) { return q.name; })), '이', '가') + ' 냠냠 먹고 힘을 내요.');
          sfx('item');
          break;
        case 'crowd':
          banner('crowd', '관중석의 응원!', '뒤처진 동물들에게 응원이 쏟아져요');
          list = ordered.slice(-Math.min(Math.max(2, Math.round(ordered.length / 5)), Math.max(1, ordered.length - 1)));
          list.forEach(function (q) {
            addFx(q, { kind: 'boost', fx: 'cheer', t: 3.0, m: 1.38 });
            pop(q, '힘내라 힘!', 'good');
          });
          log('event', null, '관중들이 ' + josa(shortNames(list.map(function (q) { return q.name; })), '을', '를') + ' 응원합니다! 추격이 시작돼요.');
          sfx('cheer');
          break;
        case 'ufo':
          banner('ufo', 'UFO 출현!', '1등을 잠깐 데려갑니다');
          r = lead;
          race.ev.push({ k: 'ufo', r: r.i });
          res = applyNeg(null, r, { kind: 'stun', fx: 'lift', t: 1.7 });
          if (res === 'hit') { pop(r, '어어어~?', 'bad'); log('event', r, 'UFO가 선두 ' + josa(r.name, '을', '를') + ' 번쩍 들어 올렸어요!'); }
          else log('event', r, 'UFO가 ' + josa(r.name, '을', '를') + ' 노렸지만 실패했어요!');
          sfx('ufo');
          break;
        case 'hurdles':
          banner('hurdles', '허들 구간!', '잘 넘으면 통과, 걸리면 꽈당');
          race.objects.push({ type: 'hurdles', x: lead.x + 28, done: {}, broken: {}, id: race.objects.length });
          log('event', null, '앞쪽에 허들이 세워졌어요!');
          sfx('pop');
          break;
        case 'slick':
          banner('slick', '미끌미끌 구간!', '조심조심… 펭귄만 신났어요');
          race.objects.push({ type: 'slick', x: lead.x + 26, x1: lead.x + 38, done: {}, id: race.objects.length });
          log('event', null, '앞쪽 트랙이 미끌미끌해졌어요!');
          sfx('pop');
          break;
        case 'star':
          banner('star', '별똥별이 떨어집니다!', '별을 잡은 동물은 무적 질주');
          list = ordered.slice(Math.floor(ordered.length / 2));
          r = rng.pick(list);
          addFx(r, { kind: 'boost', fx: 'star', t: 3.0, m: 1.45, imm: true });
          pop(r, '무적 질주!', 'good');
          log('event', r, josa(r.name, '이', '가') + ' 별똥별을 잡았어요! 반짝반짝 무적 질주!');
          sfx('star');
          break;
        case 'lace':
          banner('lace', '앗, 신발 끈!', '잘 달리다가 그만…');
          list = ordered.slice(0, Math.min(3, ordered.length));
          r = rng.pick(list);
          res = applyNeg(null, r, { kind: 'stun', fx: 'trip', t: 0.9, ground: true });
          if (res === 'hit') { pop(r, '꽈당!', 'bad'); log('event', r, josa(r.name, '이', '가') + ' 신발 끈을 밟고 넘어졌어요!'); sfx('trip'); }
          else log('event', r, josa(r.name, '이', '가') + ' 신발 끈이 풀렸지만 무사히 넘겼어요.');
          break;
      }
    }

    // ───────────── 아이템 ─────────────
    function giveItem(r) {
      var act = active();
      var f = act.length > 1 ? (rankAmongActive(r) - 1) / (act.length - 1) : 0.5;
      var w = [
        ['carrot', 3.0],
        ['rocket', 0.3 + 2.4 * f],
        ['banana', 2.0],
        ['pie', 2.0],
        ['shield', 2.2 - 1.2 * f],
        ['bolt', f > 0.4 ? 1.8 * f : 0],
        ['magnet', f > 0 ? 0.3 + 1.4 * f : 0],
        ['swap', f > 0.3 ? 1.1 * f : 0],
        ['mega', 1.0],
        ['mush', 0.6 + 1.0 * f],
        ['lullaby', f > 0 ? 1.0 : 0.3],
        ['tornado', f > 0.2 ? 0.4 + 1.2 * f : 0]
      ];
      r.item = rng.weighted(w);
      r.itemT = rng.range(0.9, 2.4);
      r.itemWait = 0;
      sfx('item');
    }
    function rankAmongActive(r) {
      var c = 1;
      race.racers.forEach(function (o) { if (!o.finished && o !== r && o.x > r.x) c++; });
      return c;
    }

    function tryUseItem(r, dt) {
      var id = r.item, tgt, list, res;
      function done(msg, cls) {
        r.item = null; r.stats.items++;
        if (msg) log(cls || 'item', r, msg);
      }
      function waitOr(fallback) {
        r.itemWait += dt;
        if (r.itemWait > 5) { fallback(); }
      }
      switch (id) {
        case 'carrot':
          addFx(r, { kind: 'boost', fx: 'carrot', t: r.a.tr.glutton ? 3.7 : 2.5, m: 1.35 });
          pop(r, '에너지 당근!', 'item'); sfx('boost');
          done(josa(r.name, '이', '가') + ' 에너지 당근을 먹고 힘을 냅니다.');
          break;
        case 'rocket':
          addFx(r, { kind: 'boost', fx: 'rocket', t: 2.0, m: 1.8 });
          pop(r, '로켓 부스터!', 'item'); sfx('rocket');
          done(josa(r.name, '이', '가') + ' 로켓 부스터로 쏜살같이 나갑니다!');
          break;
        case 'banana':
          tgt = aheadOf(r, 45) || behindOf(r, 30);
          if (!tgt) {
            waitOr(function () {
              addFx(r, { kind: 'boost', fx: 'carrot', t: 1.5, m: 1.15 });
              pop(r, '그냥 먹자, 냠', 'item');
              done(josa(r.name, '은', '는') + ' 던질 상대가 없어 바나나를 그냥 먹었어요.');
            });
            return;
          }
          race.objects.push({ type: 'banana', lane: tgt.lane, x: tgt.x + 4 + tgt.v * 0.55, src: r, done: false, id: race.objects.length });
          proj('banana', r, tgt); sfx('throw');
          pop(r, '바나나 던지기!', 'item');
          done(josa(r.name, '이', '가') + ' ' + tgt.name + ' 앞에 바나나 껍질을 던졌어요!');
          break;
        case 'pie':
          tgt = aheadOf(r, 50) || behindOf(r, 30);
          if (!tgt) {
            waitOr(function () {
              addFx(r, { kind: 'boost', fx: 'carrot', t: 1.5, m: 1.15 });
              pop(r, '달콤해~', 'item');
              done(josa(r.name, '은', '는') + ' 던질 상대가 없어 파이를 맛있게 먹었어요.');
            });
            return;
          }
          proj('pie', r, tgt); sfx('throw');
          pop(r, '크림 파이!', 'item');
          res = applyNeg(r, tgt, { kind: 'slow', fx: 'pie', t: 2.4, m: 0.55, fogMiss: true });
          if (res === 'hit') { pop(tgt, '앞이 안 보여!', 'bad'); done(josa(r.name, '이', '가') + ' 던진 크림 파이가 ' + tgt.name + ' 얼굴에 철퍼덕!'); }
          else done(josa(r.name, '이', '가') + ' ' + tgt.name + '에게 파이를 던졌지만 ' + (res === 'miss' ? '빗나갔어요.' : '막혔어요.'));
          break;
        case 'shield':
          addFx(r, { kind: 'shield', fx: 'shield', t: 9 });
          pop(r, '비눗방울 방패!', 'item'); sfx('shield');
          done(josa(r.name, '이', '가') + ' 비눗방울 방패를 둘렀어요.');
          break;
        case 'bolt':
          tgt = leaderOf();
          if (tgt === r) tgt = behindOf(r, 60);
          if (!tgt) { waitOr(function () { r.item = 'carrot'; r.itemT = 0; r.itemWait = 0; }); return; }
          race.ev.push({ k: 'lightning', r: tgt.i });
          sfx('thunder'); pop(r, '번개 구름!', 'item');
          res = applyNeg(r, tgt, { kind: 'stun', fx: 'zap', t: 1.2 });
          if (res === 'hit') {
            addFx(tgt, { kind: 'slow', fx: 'tiny', t: 3.2, m: 0.8 });
            pop(tgt, '찌릿찌릿!', 'bad');
            done(josa(r.name, '이', '가') + ' 부른 번개가 ' + tgt.name + '에게 떨어졌어요!');
          } else done(josa(r.name, '이', '가') + ' 번개를 불렀지만 ' + josa(tgt.name, '은', '는') + ' 무사해요.');
          break;
        case 'magnet':
          tgt = aheadOf(r, 60);
          if (!tgt) {
            waitOr(function () {
              addFx(r, { kind: 'boost', fx: 'magnet', t: 2.0, m: 1.25 });
              pop(r, '자석!', 'item');
              done(josa(r.name, '이', '가') + ' 자석의 힘으로 조금 빨라졌어요.');
            });
            return;
          }
          addFx(r, { kind: 'boost', fx: 'magnet', t: 2.6, m: 1.35 });
          proj('magnet', r, tgt); sfx('magnet');
          pop(r, '자석!', 'item');
          res = applyNeg(r, tgt, { kind: 'slow', fx: 'pulled', t: 2.6, m: 0.86, minor: true });
          done(josa(r.name, '이', '가') + ' 자석으로 ' + tgt.name + '에게 쭈욱 끌려갑니다!');
          break;
        case 'swap':
          tgt = aheadOf(r, 45);
          if (!tgt) { waitOr(function () { r.item = 'carrot'; r.itemT = 0; r.itemWait = 0; }); return; }
          pop(r, '자리 바꾸기!', 'item'); sfx('swap');
          res = applyNeg(r, tgt, { kind: 'buff', fx: 'swapped', t: 0.8, m: 1 });
          if (res === 'hit') {
            var tx = tgt.x, tv = tgt.v;
            tgt.x = r.x; tgt.prevX = r.x; r.x = tx; r.prevX = tx;
            tgt.v = r.v; r.v = tv;
            addFx(r, { kind: 'buff', fx: 'swapped', t: 0.8, m: 1 });
            race.ev.push({ k: 'swap', a: r.i, b: tgt.i });
            pop(tgt, '어? 여긴 어디?', 'bad');
            done(josa(r.name, '이', '가') + ' 포탈로 ' + josa(tgt.name, '과', '와') + ' 자리를 맞바꿨어요!');
          } else done(josa(r.name, '이', '가') + ' 자리를 바꾸려 했지만 ' + josa(tgt.name, '이', '가') + ' 막아 냈어요.');
          break;
        case 'mega':
          addFx(r, { kind: 'boost', fx: 'cheer', t: 2.6, m: 1.25 });
          list = sortedActive().filter(function (o) { return o !== r; }).slice(-2);
          list.forEach(function (o) {
            addFx(o, { kind: 'boost', fx: 'cheer', t: 2.6, m: 1.35 });
            pop(o, '응원 받았다!', 'good');
            r.stats.helps++;
          });
          pop(r, '다 같이 힘내자!', 'item'); sfx('cheer');
          done(josa(r.name, '이', '가') + ' 확성기로 응원합니다! ' + (list.length ? shortNames(list.map(function (o) { return o.name; })) + '도 함께 힘을 내요.' : ''));
          break;
        case 'mush':
          addFx(r, { kind: 'boost', fx: 'giant', t: 3.2, m: 1.3, imm: true });
          pop(r, '거대해졌다!', 'item'); sfx('grow');
          done(josa(r.name, '이', '가') + ' 거대 버섯을 먹고 쿵쿵 커졌어요! 방해가 안 통해요.');
          break;
        case 'lullaby':
          list = [];
          race.racers.forEach(function (o) { if (o !== r && !o.finished && o.x > r.x && o.x - r.x <= 50) list.push(o); });
          list.sort(function (p, q) { return p.x - q.x; });
          list = list.slice(0, 2);
          if (!list.length) { tgt = behindOf(r, 30); if (tgt) list = [tgt]; }
          if (!list.length) { waitOr(function () { r.item = 'carrot'; r.itemT = 0; r.itemWait = 0; }); return; }
          pop(r, '자장자장~', 'item'); sfx('lullaby');
          var slept = [];
          list.forEach(function (o) {
            res = applyNeg(r, o, { kind: 'stun', fx: 'sleep', t: 1.4 });
            if (res === 'hit') { slept.push(o.name); pop(o, '쿨쿨…', 'bad'); }
          });
          done(josa(r.name, '이', '가') + ' 자장가를 틀었어요. ' + (slept.length ? shortNames(slept) + ' 꾸벅꾸벅!' : '하지만 아무도 잠들지 않았어요.'));
          break;
        case 'tornado':
          list = sortedActive().filter(function (o) { return o !== r; }).slice(0, 3);
          if (!list.length) { r.item = 'carrot'; r.itemT = 0; return; }
          pop(r, '회오리 발사!', 'item'); sfx('wind');
          race.ev.push({ k: 'tornado', from: r.i, to: list.map(function (o) { return o.i; }) });
          var spun = [];
          list.forEach(function (o) {
            res = applyNeg(r, o, { kind: 'stun', fx: 'spin', t: 1.0 });
            if (res === 'hit') { spun.push(o.name); pop(o, '빙글빙글~', 'bad'); }
          });
          done(josa(r.name, '이', '가') + ' 회오리를 보냈어요! ' + (spun.length ? shortNames(spun) + ' 빙글빙글!' : '하지만 모두 피했어요.'));
          break;
      }
    }

    // ───────────── 스킬 ─────────────
    function tryUseSkill(r, dt) { return castSkill(r, dt, r.a.id, false); }

    // id : 쓸 스킬의 주인 동물 (앵무새가 따라 할 때는 다른 동물의 id) · copied : 따라 하는 중인지
    function castSkill(r, dt, id, copied) {
      var tgt, list, res, used = false, names;
      function fin(msg) {
        used = true;
        r.stats.skills++;
        r.skillT = rng.range(16, 23) * race.cdMul;
        r.skillWait = 0;
        var nm = ANIMAL_BY_ID[id].skill.name;
        race.ev.push({ k: 'skill', r: r.i, name: nm, id: id });
        pop(r, (copied ? '따라 하기 → ' : '') + nm + '!', 'skill');
        sfx('skill');
        log('skill', r, (copied ? '(따라 하기) ' : '') + msg);
        if (!copied) race.lastSkill = id;
      }
      function selfBoost(fx, m, t, extra) {
        var e = { kind: 'boost', fx: fx, t: t, m: m };
        if (extra) for (var k in extra) e[k] = extra[k];
        addFx(r, e);
      }
      function othersWithin(d) { return race.racers.filter(function (o) { return o !== r && !o.finished && Math.abs(o.x - r.x) <= d; }); }
      function aheadList(d) {
        return race.racers.filter(function (o) { return o !== r && !o.finished && o.x > r.x && o.x - r.x <= d; })
          .sort(function (p, q) { return p.x - q.x; });
      }
      function behindList(d) {
        return race.racers.filter(function (o) { return o !== r && !o.finished && o.x <= r.x && r.x - o.x <= d; })
          .sort(function (p, q) { return q.x - p.x; });
      }
      // 이름 나열 (많으면 '아무개, 아무개 등 7마리' 로 줄인다)
      function nameList(arr) { return shortNames(arr.map(function (o) { return o.name; })); }
      switch (id) {
        case 'rabbit':
          if (boosted(r)) break;
          addFx(r, { kind: 'boost', fx: 'hop', t: 2.2, m: 1.6 });
          fin(josa(r.name, '이', '가') + ' 깡충깡충 대시로 뛰어나갑니다!');
          break;
        case 'turtle':
          if (boosted(r)) break;
          addFx(r, { kind: 'boost', fx: 'shell', t: 2.8, m: 1.45, imm: true });
          fin(josa(r.name, '이', '가') + ' 등껍질 속에 들어가 팽이처럼 돌진합니다!');
          break;
        case 'cheetah':
          if (boosted(r)) break;
          addFx(r, { kind: 'boost', fx: 'sprint', t: 1.5, m: 1.95, cancelOnStun: true,
            onEnd: function () { if (!r.finished) { addFx(r, { kind: 'slow', fx: 'tired', t: 2.5, m: 0.8 }); pop(r, '헥헥…', 'bad'); } } });
          fin(josa(r.name, '이', '가') + ' 번개 스프린트! 눈 깜짝할 새 치고 나갑니다!');
          break;
        case 'fox':
          if (r.item) break;
          list = race.racers.filter(function (o) { return o !== r && !o.finished && o.item; });
          if (list.length) {
            list.sort(function (p, q) { return Math.abs(p.x - r.x) - Math.abs(q.x - r.x); });
            tgt = list[0];
            if (hasFlag(tgt, 'imm')) { tgt = null; }
          }
          if (tgt) {
            r.item = tgt.item; tgt.item = null;
            r.itemT = rng.range(0.5, 1.2); r.itemWait = 0;
            r.stats.gave++; tgt.stats.took++;
            pop(tgt, '내 아이템 어디 갔지?', 'bad');
            proj('steal', tgt, r);
            addFx(r, { kind: 'boost', fx: 'dash', t: 1.8, m: 1.3 });
            fin(josa(r.name, '이', '가') + ' ' + tgt.name + '의 ' + josa(ITEMS[r.item].name, '을', '를') + ' 슬쩍 가져갔어요!');
          } else {
            r.skillWait += dt;
            if (r.skillWait > 3) {
              giveItem(r);
              r.itemT = rng.range(0.5, 1.2);
              addFx(r, { kind: 'boost', fx: 'dash', t: 1.8, m: 1.3 });
              fin(josa(r.name, '이', '가') + ' 꾀주머니에서 ' + josa(ITEMS[r.item].name, '을', '를') + ' 꺼냈어요.');
            }
          }
          break;
        case 'bear':
          list = race.racers.filter(function (o) { return o !== r && !o.finished && Math.abs(o.x - r.x) <= 28; });
          if (!list.length) {
            r.skillWait += dt;
            if (r.skillWait < 6) break;
          }
          var scared = [];
          list.forEach(function (o) {
            res = applyNeg(r, o, { kind: 'slow', fx: 'scared', t: 2.2, m: 0.62 });
            if (res === 'hit') { scared.push(o.name); pop(o, '깜짝이야!', 'bad'); }
          });
          addFx(r, { kind: 'boost', fx: 'roar', t: 2.2, m: 1.3 });
          race.ev.push({ k: 'roar', r: r.i });
          fin(josa(r.name, '이', '가') + ' 쩌렁쩌렁 포효합니다! ' + (scared.length ? shortNames(scared) + ' 깜짝 놀라 주춤!' : '기합을 넣고 속도를 올려요.'));
          break;
        case 'penguin':
          if (boosted(r)) break;
          addFx(r, { kind: 'boost', fx: 'slide', t: 2.2 * (wet() ? 1.4 : 1), m: 1.5, gnd: true, cancelOnStun: true });
          fin(josa(r.name, '이', '가') + ' 배치기 슬라이딩!' + (wet() ? ' 젖은 트랙이라 훨씬 멀리 미끄러집니다!' : ' 쭈욱 미끄러집니다!'));
          break;
        case 'elephant':
          tgt = leaderOf();
          if (tgt === r) tgt = behindOf(r, 60);
          if (tgt && Math.abs(tgt.x - r.x) > 80) tgt = null;
          if (!tgt) {
            r.skillWait += dt;
            if (r.skillWait < 5) break;
            addFx(r, { kind: 'boost', fx: 'shower', t: 2.2, m: 1.22 });
            fin(josa(r.name, '이', '가') + ' 코로 시원하게 샤워하고 힘을 냅니다.');
            break;
          }
          proj('water', r, tgt);
          addFx(r, { kind: 'boost', fx: 'shower', t: 2.3, m: 1.25 });
          res = applyNeg(r, tgt, { kind: 'slow', fx: 'wet', t: 2.3, m: 0.55, fogMiss: true });
          if (res === 'hit') pop(tgt, '푸하! 물벼락', 'bad');
          fin(josa(r.name, '이', '가') + ' 코 물대포 발사! ' + (res === 'hit' ? josa(tgt.name, '이', '가') + ' 물벼락을 맞았어요.' : josa(tgt.name, '은', '는') + (res === 'miss' ? ' 아슬아슬하게 피했어요.' : ' 막아 냈어요.')));
          break;
        case 'kangaroo':
          if (boosted(r)) break;
          addFx(r, { kind: 'boost', fx: 'jump', t: 1.25, m: 2.0, air: true });
          fin(josa(r.name, '이', '가') + ' 슈퍼 점프! 하늘 높이 뛰어오릅니다!');
          break;
        case 'skunk':
          list = race.racers.filter(function (o) { return o !== r && !o.finished && r.x - o.x >= 0 && r.x - o.x <= 30; });
          if (list.length) {
            var stunk = [];
            list.forEach(function (o) {
              res = applyNeg(r, o, { kind: 'slow', fx: 'stink', t: 2.6, m: 0.68 });
              if (res === 'hit') { stunk.push(o.name); pop(o, '으악 냄새!', 'bad'); }
            });
            addFx(r, { kind: 'boost', fx: 'fart', t: 2.0, m: 1.4 });
            race.ev.push({ k: 'stink', r: r.i });
            fin(josa(r.name, '이', '가') + ' 뿡뿡 구름을 뿜었어요! ' + (stunk.length ? shortNames(stunk) + ' 코를 막고 주춤!' : ''));
          } else {
            r.skillWait += dt;
            if (r.skillWait > 2.5 && !boosted(r)) {
              addFx(r, { kind: 'boost', fx: 'fart', t: 1.9, m: 1.55 });
              race.ev.push({ k: 'stink', r: r.i });
              fin(josa(r.name, '이', '가') + ' 방귀 로켓으로 추격합니다! 뿌우웅~');
            }
          }
          break;
        case 'pig':
          if (boosted(r)) break;
          r.bumped = {};
          addFx(r, { kind: 'boost', fx: 'roll', t: 2.2, m: 1.45, imm: true, onEnd: function () { r.bumped = null; } });
          fin(josa(r.name, '이', '가') + ' 꿀꿀 돌진! 데굴데굴 굴러갑니다!');
          break;
        case 'dog':
          if (boosted(r)) break;
          tgt = behindOf(r, 45);
          if (tgt) {
            addFx(r, { kind: 'boost', fx: 'buddy', t: 2.6, m: 1.4 });
            addFx(tgt, { kind: 'boost', fx: 'buddy', t: 2.6, m: 1.3 });
            r.stats.helps++;
            pop(tgt, '고마워 친구!', 'good');
            race.ev.push({ k: 'buddy', a: r.i, b: tgt.i });
            fin(josa(r.name, '이', '가') + ' "같이 가자!" ' + josa(tgt.name, '과', '와') + ' 함께 속도를 올립니다.');
          } else {
            addFx(r, { kind: 'boost', fx: 'buddy', t: 2.6, m: 1.5 });
            fin(josa(r.name, '이', '가') + ' 친구들을 따라잡으려고 꼬리를 프로펠러처럼 돌립니다!');
          }
          break;
        case 'cat':
          tgt = aheadOf(r, 22);
          if (tgt) {
            proj('paw', r, tgt);
            res = applyNeg(r, tgt, { kind: 'stun', fx: 'spin', t: 1.2, fogMiss: true });
            if (res === 'hit') pop(tgt, '빙글빙글~', 'bad');
            addFx(r, { kind: 'boost', fx: 'pounce', t: 1.8, m: 1.35 });
            fin(josa(r.name, '이', '가') + ' 냥냥 펀치! ' + (res === 'hit' ? josa(tgt.name, '이', '가') + ' 빙글 돌아요.' : josa(tgt.name, '은', '는') + (res === 'miss' ? ' 살짝 피했어요.' : ' 막아 냈어요.')));
          } else {
            r.skillWait += dt;
            if (r.skillWait > 3 && !boosted(r)) {
              addFx(r, { kind: 'boost', fx: 'sneak', t: 3.0, m: 1.2, imm: true });
              fin(josa(r.name, '이', '가') + ' 살금살금 모드! 방해를 요리조리 피하며 달려요.');
            }
          }
          break;
        case 'panda':
          if (boosted(r)) break;
          addFx(r, { kind: 'stun', fx: 'eat', t: 0.8, m: 0,
            onEnd: function () { if (!r.finished) { addFx(r, { kind: 'boost', fx: 'power', t: 3.6, m: 1.9 }); pop(r, '힘이 솟는다!', 'good'); sfx('boost'); } } });
          fin(josa(r.name, '이', '가') + ' 대나무 간식 타임~ 냠냠, 잠시 후 폭풍 질주가 시작돼요.');
          break;
        case 'duck':
          if (boosted(r)) break;
          addFx(r, { kind: 'boost', fx: 'fly', t: 3.0, m: 1.4, air: true });
          fin(josa(r.name, '이', '가') + ' 파닥파닥 활공! 트랙 위를 낮게 날아갑니다.');
          break;

        // ───── 새 동물 36종 ─────
        case 'lion':
          list = aheadList(45);
          if (!list.length) { r.skillWait += dt; if (r.skillWait < 4) break; }
          names = [];
          list.forEach(function (o) {
            res = applyNeg(r, o, { kind: 'slow', fx: 'scared', t: 2.2, m: 0.7 });
            if (res === 'hit') { names.push(o); pop(o, '움찔!', 'bad'); }
          });
          selfBoost('roar', 1.38, 2.4);
          race.ev.push({ k: 'roar', r: r.i });
          fin(josa(r.name, '이', '가') + ' 왕의 포효! ' + (names.length ? '앞서가던 ' + nameList(names) + ' 움찔합니다.' : '기세 좋게 속도를 올려요.'));
          break;
        case 'tiger':
          tgt = aheadOf(r, 25);
          if (tgt) {
            selfBoost('jump', 2.1, 0.85, { air: true });
            res = applyNeg(r, tgt, { kind: 'stun', fx: 'trip', t: 0.9, fogMiss: true });
            if (res === 'hit') pop(tgt, '으악, 호랑이다!', 'bad');
            fin(josa(r.name, '이', '가') + ' 훌쩍 덮칩니다! ' + (res === 'hit' ? josa(tgt.name, '이', '가') + ' 놀라 넘어졌어요.' : josa(tgt.name, '은', '는') + ' 용케 피했어요.'));
          } else {
            r.skillWait += dt;
            if (r.skillWait > 3 && !boosted(r)) { selfBoost('dash', 1.45, 2.0); fin(josa(r.name, '이', '가') + ' 덮칠 상대가 없어 힘차게 내달립니다.'); }
          }
          break;
        case 'zebra':
          list = othersWithin(22);
          if (!list.length) { r.skillWait += dt; if (r.skillWait < 5) break; }
          names = [];
          list.forEach(function (o) {
            res = applyNeg(r, o, { kind: 'slow', fx: 'lost', t: 2.2, m: 0.72 });
            if (res === 'hit') { names.push(o); pop(o, '어질어질~', 'bad'); }
          });
          selfBoost('illusion', 1.15, 2.5, { imm: true });
          fin(josa(r.name, '이', '가') + ' 줄무늬 착시! ' + (names.length ? nameList(names) + ' 눈이 빙글빙글 돌아요.' : '줄무늬 사이로 방해를 흘려보내요.'));
          break;
        case 'giraffe':
          if (r.item) break;
          r.item = rng.pick(['rocket', 'mush', 'shield', 'mega', 'carrot']);
          r.itemT = rng.range(0.4, 1.0); r.itemWait = 0;
          selfBoost('dash', 1.2, 2.0);
          fin(josa(r.name, '이', '가') + ' 높은 나무에서 ' + josa(ITEMS[r.item].name, '을', '를') + ' 따 왔어요.');
          break;
        case 'horse':
          if (boosted(r)) break;
          selfBoost('gallop', 1.28, 4.5);
          fin(josa(r.name, '이', '가') + ' 전력 질주! 다그닥다그닥 오래도록 달립니다.');
          break;
        case 'cow':
          if (!hasKind(r, 'slow')) { r.skillWait += dt; if (r.skillWait < 6) break; }
          r.fx = r.fx.filter(function (e) { return e.kind !== 'slow'; });
          addFx(r, { kind: 'shield', fx: 'shield', t: 9 });
          selfBoost('milk', 1.35, 2.5);
          fin(josa(r.name, '이', '가') + ' 신선한 우유 한 잔! 나쁜 기운을 씻고 방패를 둘렀어요.');
          break;
        case 'sheep':
          list = othersWithin(25).sort(function (p, q) { return Math.abs(p.x - r.x) - Math.abs(q.x - r.x); }).slice(0, 2);
          if (!list.length) {
            r.skillWait += dt;
            if (r.skillWait > 5 && !boosted(r)) { selfBoost('dash', 1.3, 2.0); fin(josa(r.name, '은', '는') + ' 재울 동물이 없어 폴짝폴짝 속도를 올려요.'); }
            break;
          }
          names = [];
          list.forEach(function (o) {
            res = applyNeg(r, o, { kind: 'stun', fx: 'sleep', t: 1.3 });
            if (res === 'hit') { names.push(o); pop(o, '양 한 마리… 쿨', 'bad'); }
          });
          selfBoost('dash', 1.35, 2.2);
          sfx('lullaby');
          fin(josa(r.name, '이', '가') + ' 양 세기 자장가를 불러요. ' + (names.length ? nameList(names) + ' 스르르 잠들었어요.' : '하지만 아무도 잠들지 않았어요.'));
          break;
        case 'goat':
          if (boosted(r)) break;
          selfBoost('ram', Math.min(1.8, 1.3 + 0.07 * (rankAmongActive(r) - 1)), 2.4, { gnd: true });
          fin(josa(r.name, '이', '가') + ' 오기 박치기! ' + (rankAmongActive(r) > 3 ? '뒤처진 만큼 더 세게 치고 나갑니다!' : '머리를 숙이고 돌진합니다.'));
          break;
        case 'deer':
          if (hasFlag(r, 'reflect')) break;
          addFx(r, { kind: 'shield', fx: 'reflect', t: 6, reflect: true });
          selfBoost('dash', 1.2, 2.0);
          fin(josa(r.name, '이', '가') + ' 뿔을 번쩍 세웠어요. 다음 방해는 그대로 되돌아갑니다.');
          break;
        case 'koala':
          tgt = aheadOf(r, 18);
          if (tgt) {
            addFx(r, { kind: 'buff', fx: 'cling', t: 2.5, m: 1, target: tgt, cancelOnStun: true,
              onEnd: function () { if (!r.finished && !stunned(r)) { addFx(r, { kind: 'boost', fx: 'hop', t: 2.0, m: 1.75 }); pop(r, '폴짝! 고마워~', 'good'); } } });
            applyNeg(r, tgt, { kind: 'slow', fx: 'carry', t: 2.5, m: 0.94, minor: true });
            pop(tgt, '어? 등이 무겁네', 'bad');
            fin(josa(r.name, '이', '가') + ' ' + tgt.name + ' 등에 찰싹! 어부바로 편하게 갑니다.');
          } else {
            r.skillWait += dt;
            if (r.skillWait > 3 && !boosted(r)) { selfBoost('snack', 1.3, 2.5); fin(josa(r.name, '은', '는') + ' 업힐 등이 없어 유칼립투스 잎을 먹고 힘을 내요.'); }
          }
          break;
        case 'sloth':
          list = race.racers.filter(function (o) { return o !== r && !o.finished; });
          names = [];
          list.forEach(function (o) {
            res = applyNeg(r, o, { kind: 'slow', fx: 'slowmo', t: 2.4, m: 0.55 });
            if (res === 'hit') { names.push(o); pop(o, '느~릿~느~릿', 'bad'); }
          });
          selfBoost('dash', 1.15, 2.4);
          race.ev.push({ k: 'slowmo', r: r.i });
          fin(josa(r.name, '이', '가') + ' 느긋함을 퍼뜨립니다~ ' + (names.length ? '모두가 느릿느릿해졌어요.' : '하지만 아무도 넘어가지 않았어요.'));
          break;
        case 'monkey':
          list = aheadList(50).slice(0, 2);
          if (!list.length) { tgt = behindOf(r, 30); if (tgt) list = [tgt]; }
          if (!list.length) {
            r.skillWait += dt;
            if (r.skillWait > 5 && !boosted(r)) { selfBoost('carrot', 1.3, 2.0); fin(josa(r.name, '은', '는') + ' 던질 곳이 없어 바나나를 냠냠 먹었어요.'); }
            break;
          }
          list.forEach(function (o) {
            race.objects.push({ type: 'banana', lane: o.lane, x: o.x + 4 + o.v * 0.55, src: r, done: false, id: race.objects.length });
            proj('banana', r, o);
          });
          selfBoost('dash', 1.3, 2.0);
          sfx('throw');
          fin(josa(r.name, '이', '가') + ' 바나나 세례! ' + nameList(list) + ' 앞에 껍질이 떨어졌어요.');
          break;
        case 'gorilla':
          list = othersWithin(26);
          if (!list.length) { r.skillWait += dt; if (r.skillWait < 6) break; }
          names = [];
          list.forEach(function (o) {
            res = applyNeg(r, o, { kind: 'stun', fx: 'trip', t: 0.75, ground: true });
            if (res === 'hit') { names.push(o); pop(o, '쿵! 꽈당', 'bad'); }
          });
          selfBoost('roar', 1.3, 2.0);
          race.ev.push({ k: 'roar', r: r.i });
          sfx('crash');
          fin(josa(r.name, '이', '가') + ' 쿵쿵 가슴을 두드립니다! ' + (names.length ? nameList(names) + ' 중심을 잃고 넘어졌어요.' : '땅이 울려요.'));
          break;
        case 'hippo':
          if (!behindOf(r, 40)) {
            r.skillWait += dt;
            if (r.skillWait > 4 && !boosted(r)) { selfBoost('dash', 1.3, 2.0); fin(josa(r.name, '은', '는') + ' 뒤에 아무도 없어 그냥 힘차게 달려요.'); }
            break;
          }
          tgt = { type: 'slick', mud: true, src: r, x: r.x - 2, x1: r.x + 10, done: {}, id: race.objects.length };
          tgt.done[r.i] = true;
          race.objects.push(tgt);
          selfBoost('dash', 1.35, 2.4);
          fin(josa(r.name, '이', '가') + ' 철퍼덕! 지나간 자리에 진흙탕을 만들었어요.');
          break;
        case 'rhino':
          if (boosted(r)) break;
          selfBoost('charge', 1.15, 2.8, { imm: true, ramp: [1.15, 1.6] });
          fin(josa(r.name, '이', '가') + ' 돌진을 시작합니다! 점점 빨라져요. 아무도 못 막아요!');
          break;
        case 'croc':
          tgt = aheadOf(r, 30);
          if (tgt) {
            res = applyNeg(r, tgt, { kind: 'stun', fx: 'pity', t: 1.2 });
            if (res === 'hit') pop(tgt, '어머, 왜 울어?', 'bad');
            selfBoost('dash', 1.35, 2.0);
            race.ev.push({ k: 'tears', r: r.i });
            fin(josa(r.name, '이', '가') + ' 악어의 눈물을 뚝뚝… ' + (res === 'hit' ? josa(tgt.name, '이', '가') + ' 달래 주려고 멈춰 섰어요.' : josa(tgt.name, '은', '는') + ' 속지 않았어요.'));
          } else {
            r.skillWait += dt;
            if (r.skillWait > 3 && !boosted(r)) { selfBoost('dash', 1.4, 2.0); fin(josa(r.name, '이', '가') + ' 속일 상대가 없어 꼬리를 흔들며 속도를 올려요.'); }
          }
          break;
        case 'frog':
          tgt = aheadOf(r, 22);
          if (tgt && tgt.x - r.x > 2.5) {
            res = applyNeg(r, tgt, { kind: 'slow', fx: 'pulled', t: 1.2, m: 0.8, minor: true });
            race.ev.push({ k: 'tongue', a: r.i, b: tgt.i });
            if (res === 'hit') {
              r.x = tgt.x - 1.0; r.prevX = r.x; r.hop = race.t;
              fin(josa(r.name, '이', '가') + ' 혓바닥 낼름! ' + tgt.name + ' 바로 뒤까지 단숨에 따라붙었어요.');
            } else fin(josa(r.name, '이', '가') + ' 혀를 뻗었지만 ' + josa(tgt.name, '이', '가') + ' 미끄러져 빠져나갔어요.');
          } else {
            r.skillWait += dt;
            if (r.skillWait > 3 && !boosted(r)) { selfBoost('jump', 1.9, 1.0, { air: true }); fin(josa(r.name, '이', '가') + ' 폴짝! 크게 뛰어오릅니다.'); }
          }
          break;
        case 'squirrel':
          list = aheadList(50).slice(0, 3);
          if (!list.length) list = behindList(30).slice(0, 2);
          if (!list.length) {
            r.skillWait += dt;
            if (r.skillWait > 4 && !boosted(r)) { selfBoost('dash', 1.4, 1.8); fin(josa(r.name, '은', '는') + ' 도토리를 아껴 두고 쪼르르 달려요.'); }
            break;
          }
          names = [];
          list.forEach(function (o) {
            proj('acorn', r, o);
            res = applyNeg(r, o, { kind: 'slow', fx: 'bonk', t: 1.8, m: 0.72, fogMiss: true });
            if (res === 'hit') { names.push(o); pop(o, '딱! 아야', 'bad'); }
          });
          selfBoost('dash', 1.35, 2.2);
          sfx('throw');
          fin(josa(r.name, '이', '가') + ' 도토리 세례! ' + (names.length ? nameList(names) + ' 머리를 감싸 쥐어요.' : '하지만 모두 빗나갔어요.'));
          break;
        case 'hamster':
          if (boosted(r)) break;
          selfBoost('wheel', 1.5, 2.2, { gnd: true });
          fin(josa(r.name, '이', '가') + ' 쳇바퀴 질주! 데굴데굴 굴러갑니다.');
          break;
        case 'mouse':
          if (boosted(r)) break;
          selfBoost('burrow', 2.0, 1.0, { imm: true, air: true });
          fin(josa(r.name, '이', '가') + ' 쥐구멍으로 쏙! 땅속 지름길로 갑니다.');
          break;
        case 'hedgehog':
          if (hasFlag(r, 'thorns')) break;
          selfBoost('thorns', 1.22, 4.0, { imm: true, thorns: true });
          fin(josa(r.name, '이', '가') + ' 가시를 바짝 세웠어요. 건드리면 따끔합니다!');
          break;
        case 'raccoon':
          list = race.racers.filter(function (o) {
            if (o === r || o.finished || hasFlag(o, 'imm')) return false;
            for (var k = 0; k < o.fx.length; k++) if (o.fx[k].kind === 'boost') return true;
            return false;
          }).sort(function (p, q) { return Math.abs(p.x - r.x) - Math.abs(q.x - r.x); });
          if (list.length) {
            tgt = list[0];
            tgt.fx = tgt.fx.filter(function (e) { return e.kind !== 'boost'; });
            r.stats.gave++; tgt.stats.took++;
            pop(tgt, '어? 힘이 빠지네', 'bad');
            proj('steal', tgt, r);
            selfBoost('stolen', 1.5, 2.3);
            fin(josa(r.name, '이', '가') + ' ' + tgt.name + '의 기운을 슬쩍 가로챘어요!');
          } else {
            r.skillWait += dt;
            if (r.skillWait > 4 && !boosted(r)) {
              r.fx = r.fx.filter(function (e) { return e.kind !== 'slow'; });
              selfBoost('dash', 1.25, 2.0);
              fin(josa(r.name, '은', '는') + ' 가로챌 기운이 없어 세수를 하고 정신을 차려요.');
            }
          }
          break;
        case 'otter':
          if (boosted(r)) break;
          addFx(r, { kind: 'shield', fx: 'shield', t: 5 });
          selfBoost('surf', wet() ? 1.45 : 1.3, 2.2, wet() ? { gnd: true } : null);
          fin(josa(r.name, '이', '가') + ' 물살 타기!' + (wet() ? ' 젖은 트랙 위를 미끄러지듯 달립니다.' : ' 방패를 두르고 매끄럽게 달려요.'));
          break;
        case 'beaver':
          if (!behindOf(r, 45)) {
            r.skillWait += dt;
            if (r.skillWait > 4 && !boosted(r)) { selfBoost('dash', 1.3, 2.0); fin(josa(r.name, '은', '는') + ' 뒤에 아무도 없어 꼬리로 땅을 치며 달려요.'); }
            break;
          }
          tgt = { type: 'hurdles', log: true, x: r.x - 1.5, done: {}, broken: {}, id: race.objects.length };
          tgt.done[r.i] = true;
          race.objects.push(tgt);
          selfBoost('dash', 1.35, 2.4);
          sfx('pop');
          fin(josa(r.name, '이', '가') + ' 뚝딱뚝딱 통나무 댐을 쌓았어요. 뒤따르는 동물은 넘어가야 해요!');
          break;
        case 'wolf':
          if (boosted(r)) break;
          list = othersWithin(20);
          selfBoost('howl', Math.min(1.6, 1.18 + 0.07 * list.length), 2.4);
          race.ev.push({ k: 'howl', r: r.i });
          fin(josa(r.name, '이', '가') + ' 아우우~ 하울링! ' + (list.length >= 3 ? '주변에 동물이 많아 아주 빨라졌어요!' : '기운을 내 달립니다.'));
          break;
        case 'polar':
          tgt = aheadOf(r, 28);
          if (tgt) {
            proj('frost', r, tgt);
            res = applyNeg(r, tgt, { kind: 'stun', fx: 'ice', t: race.weather.id === 'snow' ? 1.5 : 1.1, fogMiss: true });
            if (res === 'hit') pop(tgt, '꽁꽁!', 'bad');
            selfBoost('dash', 1.3, 2.0);
            fin(josa(r.name, '이', '가') + ' 얼음 숨결을 후~ ' + (res === 'hit' ? josa(tgt.name, '이', '가') + ' 꽁꽁 얼었어요.' : josa(tgt.name, '은', '는') + (res === 'miss' ? ' 살짝 비켜났어요.' : ' 막아 냈어요.')));
          } else {
            r.skillWait += dt;
            if (r.skillWait > 3 && !boosted(r)) { selfBoost('dash', 1.4, 2.0); fin(josa(r.name, '은', '는') + ' 얼릴 상대가 없어 성큼성큼 속도를 올려요.'); }
          }
          break;
        case 'seal':
          list = sortedActive().filter(function (o) { return o !== r; }).slice(0, 2);
          if (!list.length) break;
          race.ev.push({ k: 'ball', from: r.i, to: list.map(function (o) { return o.i; }) });
          names = [];
          list.forEach(function (o, k) {
            res = applyNeg(r, o, { kind: 'stun', fx: 'bonk2', t: k === 0 ? 0.7 : 0.5 });
            if (res === 'hit') { names.push(o); pop(o, '통! 아얏', 'bad'); }
          });
          selfBoost('dash', 1.2, 2.0);
          fin(josa(r.name, '이', '가') + ' 비치볼을 통통! ' + (names.length ? nameList(names) + ' 머리에 맞았어요.' : '하지만 모두 피했어요.'));
          break;
        case 'owl':
          list = othersWithin(40).filter(function (o) { return !o.a.tr.nofog; });
          names = [];
          list.forEach(function (o) {
            res = applyNeg(r, o, { kind: 'slow', fx: 'lost', t: 2.4, m: 0.76 });
            if (res === 'hit') { names.push(o); pop(o, '캄캄해!', 'bad'); }
          });
          selfBoost('dash', 1.3, 2.4);
          race.ev.push({ k: 'night', r: r.i });
          fin(josa(r.name, '이', '가') + ' "밤이 왔다!" ' + (names.length ? '갑자기 캄캄해져 ' + nameList(names) + ' 길을 더듬어요.' : '어둠 속을 유유히 달려요.'));
          break;
        case 'chicken':
          list = behindList(40).slice(0, 2);
          if (list.length) {
            list.forEach(function (o) {
              race.objects.push({ type: 'banana', egg: true, lane: o.lane, x: o.x + 5 + o.v * 0.5, src: r, done: false, id: race.objects.length });
              proj('egg', r, o);
            });
            selfBoost('dash', 1.35, 2.2);
            fin(josa(r.name, '이', '가') + ' 꼬꼬댁! ' + nameList(list) + ' 앞에 달걀을 낳았어요.');
          } else {
            r.skillWait += dt;
            if (r.skillWait > 2.5 && !boosted(r)) { selfBoost('fly', 1.5, 2.0, { air: true }); fin(josa(r.name, '이', '가') + ' 파닥파닥 날갯짓으로 추격합니다!'); }
          }
          break;
        case 'parrot':
          if (race.lastSkill) return castSkill(r, dt, race.lastSkill, true);
          r.skillWait += dt;
          if (r.skillWait > 3 && !boosted(r)) { selfBoost('fly', 1.4, 2.2, { air: true }); fin(josa(r.name, '은', '는') + ' 따라 할 스킬이 없어 그냥 훨훨 날아가요.'); }
          break;
        case 'flamingo':
          if (boosted(r)) break;
          selfBoost('stride', 1.42, 3.0, { gnd: true });
          fin(josa(r.name, '이', '가') + ' 긴 다리로 성큼성큼! 바닥 방해쯤은 넘어갑니다.');
          break;
        case 'ostrich':
          tgt = behindOf(r, 10);
          if (tgt) {
            res = applyNeg(r, tgt, { kind: 'stun', fx: 'trip', t: 0.6 });
            if (res === 'hit') { tgt.x = Math.max(0, tgt.x - 6); tgt.prevX = tgt.x; pop(tgt, '뻥! 으아아', 'bad'); }
            race.ev.push({ k: 'kick', a: r.i, b: tgt.i });
            selfBoost('dash', 1.4, 2.0);
            sfx('trip');
            fin(josa(r.name, '이', '가') + ' 뒷발차기 뻥! ' + (res === 'hit' ? josa(tgt.name, '이', '가') + ' 뒤로 데굴데굴 밀려났어요.' : josa(tgt.name, '은', '는') + ' 막아 냈어요.'));
          } else {
            r.skillWait += dt;
            if (r.skillWait > 2.5 && !boosted(r)) { selfBoost('sprint', 1.55, 2.0); fin(josa(r.name, '은', '는') + ' 찰 상대가 없어 긴 다리로 내달립니다.'); }
          }
          break;
        case 'camel':
          if (hasFlag(r, 'noslow')) break;
          r.fx = r.fx.filter(function (e) { return e.kind !== 'slow'; });
          selfBoost('steady', 1.2, 6.0, { noslow: true });
          fin(josa(r.name, '이', '가') + ' 혹에 모아 둔 에너지를 꺼냈어요. 한동안 느려지지 않아요.');
          break;
        case 'alpaca':
          tgt = aheadOf(r, 30) || behindOf(r, 20);
          if (!tgt) {
            r.skillWait += dt;
            if (r.skillWait > 4 && !boosted(r)) { selfBoost('dash', 1.3, 2.0); fin(josa(r.name, '은', '는') + ' 침 뱉을 상대가 없어 폴짝폴짝 달려요.'); }
            break;
          }
          proj('spit', r, tgt);
          res = applyNeg(r, tgt, { kind: 'slow', fx: 'pie', t: 2.3, m: 0.58, fogMiss: true });
          if (res === 'hit') pop(tgt, '으악, 침이다!', 'bad');
          selfBoost('dash', 1.35, 2.2);
          fin(josa(r.name, '이', '가') + ' 퉤! ' + (res === 'hit' ? tgt.name + ' 얼굴에 명중했어요.' : josa(tgt.name, '은', '는') + (res === 'miss' ? ' 고개를 숙여 피했어요.' : ' 막아 냈어요.')));
          break;
        case 'bat':
          list = race.racers.filter(function (o) { return o !== r && !o.finished && o.item && !hasFlag(o, 'imm'); });
          if (!list.length) { r.skillWait += dt; if (r.skillWait < 4) break; }
          list.forEach(function (o) {
            o.item = null; r.stats.gave++; o.stats.took++;
            pop(o, '앗, 아이템이!', 'bad');
          });
          selfBoost('dash', 1.4, 2.2);
          race.ev.push({ k: 'sonar', r: r.i });
          fin(josa(r.name, '이', '가') + ' 초음파를 삐이익! ' + (list.length ? nameList(list) + ' 놀라서 아이템을 떨어뜨렸어요.' : '소리를 타고 속도를 올려요.'));
          break;
        case 'redpanda':
          list = othersWithin(18);
          if (!list.length) { r.skillWait += dt; if (r.skillWait < 5) break; }
          names = [];
          list.forEach(function (o) {
            res = applyNeg(r, o, { kind: 'stun', fx: 'charm', t: 0.9 });
            if (res === 'hit') { names.push(o); pop(o, '귀, 귀여워…!', 'bad'); }
          });
          selfBoost('dash', 1.3, 2.2);
          race.ev.push({ k: 'charm', r: r.i });
          fin(josa(r.name, '이', '가') + ' 두 팔 번쩍 만세 위협! ' + (names.length ? nameList(names) + ' 귀여워서 그만 멈춰 섰어요.' : '아무도 없지만 귀여워요.'));
          break;
        default:
          castTyped(ANIMAL_BY_ID[id].skill);
          break;
      }
      return used;

      // ───── 표로 정의한 스킬 (새 100종) ─────
      function castTyped(sk) {
        var P = sk.p || {}, tg, li, hit = [], res2, ex, cnt, me = josa(r.name, '이', '가') + ' ' + sk.name + '! ';
        function self(arr, fx, extra) { if (arr) selfBoost(fx || 'dash', arr[0], arr[1], extra); }
        function neg(o) { return applyNeg(r, o, { kind: P.kind || 'slow', fx: P.fx, t: P.t, m: P.m, fogMiss: !!P.fog, ground: !!P.ground }); }
        function waitAlt() {    // 쓸 상대가 없으면 조금 기다렸다가 혼자 속도만 올린다
          r.skillWait += dt;
          if (r.skillWait > (P.wait || 3.5) && !boosted(r)) { self(P.alt || [1.4, 2.0]); fin(josa(r.name, '은', '는') + ' ' + josa(sk.name, '을', '를') + ' 쓸 상대가 없어 혼자 속도를 올려요.'); }
        }
        function flags() { var e = {}; if (P.gnd) e.gnd = true; if (P.air) e.air = true; if (P.imm) e.imm = true; if (P.noslow) e.noslow = true; if (P.thorns) { e.imm = true; e.thorns = true; } return e; }
        switch (sk.type) {
          case 'boost':
            if (boosted(r)) return;
            ex = flags();
            if (P.ramp) ex.ramp = P.ramp;
            if (P.tired) { ex.cancelOnStun = true; ex.onEnd = function () { if (!r.finished) { addFx(r, { kind: 'slow', fx: 'tired', t: P.tired[1], m: P.tired[0] }); pop(r, '헥헥…', 'bad'); } }; }
            if (P.bump) { r.bumped = {}; ex.onEnd = function () { r.bumped = null; }; }
            selfBoost(P.fx || 'dash', P.rand ? rng.range(P.rand[0], P.rand[1]) : P.m,
              P.t * (P.wetK && wet() ? P.wetK : 1) * (P.snowK && race.weather.id === 'snow' ? P.snowK : 1), ex);
            fin(me + (sk.say || '힘차게 치고 나갑니다.'));
            return;
          case 'scale':
            if (boosted(r)) return;
            cnt = P.by === 'near' ? othersWithin(P.range || 20).length : rankAmongActive(r) - 1;
            selfBoost(P.fx || 'dash', Math.min(P.max || 1.75, P.base + P.step * cnt), P.t, flags());
            if (P.by === 'near') race.ev.push({ k: 'howl', r: r.i });
            fin(me + (sk.say || '속도를 올립니다.'));
            return;
          case 'hitAhead':
          case 'hitLeader':
            tg = sk.type === 'hitLeader' ? leaderOf() : aheadOf(r, P.range || 25);
            if (sk.type === 'hitLeader' && tg === r) tg = behindOf(r, 60);
            if (!tg && P.back) tg = behindOf(r, P.back);
            if (!tg) return waitAlt();
            if (P.proj) proj(P.proj, r, tg);
            if (P.leap) selfBoost('jump', 2.3, 1.0, { air: true });
            res2 = neg(tg);
            if (res2 === 'hit') pop(tg, P.pop || '으악!', 'bad');
            self(P.self);
            fin(me + (res2 === 'hit' ? josa(tg.name, '이', '가') + ' ' + (FXWORD[P.fx] || '당했어요.') : josa(tg.name, '은', '는') + (res2 === 'miss' ? ' 아슬아슬하게 피했어요.' : ' 막아 냈어요.')));
            return;
          case 'area':
          case 'global':
            li = sk.type === 'global' ? race.racers.filter(function (o) { return o !== r && !o.finished; })
              : (P.dir === 'ahead' ? aheadList(P.range) : (P.dir === 'behind' ? behindList(P.range) : othersWithin(P.range || 24)));
            if (P.max) li = li.sort(function (p, q) { return Math.abs(p.x - r.x) - Math.abs(q.x - r.x); }).slice(0, P.max);
            if (!li.length) { r.skillWait += dt; if (r.skillWait < (P.wait || 5)) return; }
            li.forEach(function (o) { res2 = neg(o); if (res2 === 'hit') { hit.push(o); pop(o, P.pop || '으악!', 'bad'); } });
            self(P.self);
            if (P.ev) race.ev.push({ k: P.ev, r: r.i });
            if (P.fx === 'sleep') sfx('lullaby');
            fin(me + (hit.length ? josa(nameList(hit), '이', '가') + ' ' + (FXWORD[P.fx] || '당했어요.') : (li.length ? '하지만 모두 버텨 냈어요.' : '기세를 올려 달려요.')));
            return;
          case 'patch':
            if (!behindOf(r, 40)) return waitAlt();
            tg = { type: 'slick', mud: false, ink: !!P.ink, src: r, x: r.x - 2, x1: r.x + 10, done: {}, id: race.objects.length };
            tg.done[r.i] = true;
            race.objects.push(tg);
            self(P.self);
            fin(me + (P.ink ? '지나간 자리가 먹물로 캄캄해졌어요.' : '지나간 자리가 미끌미끌해졌어요.'));
            return;
          case 'wall':
            if (!behindOf(r, 45)) return waitAlt();
            tg = { type: 'hurdles', log: true, x: r.x - 1.5, done: {}, broken: {}, id: race.objects.length };
            tg.done[r.i] = true;
            race.objects.push(tg);
            self(P.self); sfx('pop');
            fin(me + '뒤따르는 동물은 넘어가야 해요.');
            return;
          case 'guard':
            if (P.reflect ? hasFlag(r, 'reflect') : boosted(r)) return;
            if (P.cleanse && !hasKind(r, 'slow')) { r.skillWait += dt; if (r.skillWait < 6) return; }
            if (P.cleanse || P.cleanse0) r.fx = r.fx.filter(function (e) { return e.kind !== 'slow'; });
            if (P.shield) addFx(r, { kind: 'shield', fx: P.reflect ? 'reflect' : 'shield', t: P.shield, reflect: !!P.reflect });
            selfBoost(P.fx || (P.thorns ? 'thorns' : 'dash'), P.m || 1.25, P.t || 2.5, flags());
            fin(me + (sk.say || '든든하게 달려요.'));
            return;
          case 'item':
            if (r.item) return;
            r.item = rng.pick(P.list); r.itemT = rng.range(0.4, 1.0); r.itemWait = 0;
            self(P.self || [1.2, 2.0]);
            fin(me + josa(ITEMS[r.item].name, '을', '를') + ' 꺼냈어요.');
            return;
          case 'steal':
            if (r.item) return;
            li = race.racers.filter(function (o) { return o !== r && !o.finished && o.item && !hasFlag(o, 'imm'); })
              .sort(function (p, q) { return Math.abs(p.x - r.x) - Math.abs(q.x - r.x); });
            if (li.length) {
              tg = li[0]; r.item = tg.item; tg.item = null; r.itemT = rng.range(0.5, 1.2); r.itemWait = 0;
              r.stats.gave++; tg.stats.took++;
              pop(tg, '내 아이템 어디 갔지?', 'bad'); proj('steal', tg, r); self(P.self);
              fin(me + tg.name + '의 ' + josa(ITEMS[r.item].name, '을', '를') + ' 가져갔어요!');
            } else {
              r.skillWait += dt;
              if (r.skillWait > 3) { giveItem(r); r.itemT = rng.range(0.5, 1.2); self(P.self); fin(me + '어디선가 ' + josa(ITEMS[r.item].name, '을', '를') + ' 구해 왔어요.'); }
            }
            return;
          case 'leech':
            li = race.racers.filter(function (o) {
              if (o === r || o.finished || hasFlag(o, 'imm')) return false;
              for (var k = 0; k < o.fx.length; k++) if (o.fx[k].kind === 'boost') return true;
              return false;
            }).sort(function (p, q) { return Math.abs(p.x - r.x) - Math.abs(q.x - r.x); });
            if (li.length) {
              tg = li[0]; tg.fx = tg.fx.filter(function (e) { return e.kind !== 'boost'; });
              r.stats.gave++; tg.stats.took++;
              pop(tg, '어? 힘이 빠지네', 'bad'); proj('steal', tg, r);
              selfBoost('stolen', 1.5, 2.3);
              fin(me + tg.name + '의 기운을 가로챘어요!');
            } else {
              r.skillWait += dt;
              if (r.skillWait > 4 && !boosted(r)) { selfBoost('dash', 1.35, 2.0); fin(josa(r.name, '은', '는') + ' 가로챌 기운이 없어 혼자 속도를 올려요.'); }
            }
            return;
          case 'buddy':
            if (boosted(r)) return;
            tg = behindOf(r, P.range || 45);
            if (tg) {
              selfBoost('buddy', P.m, P.t); addFx(tg, { kind: 'boost', fx: 'buddy', t: P.t, m: P.m2 });
              r.stats.helps++; pop(tg, '고마워 친구!', 'good');
              race.ev.push({ k: 'buddy', a: r.i, b: tg.i });
              fin(me + josa(tg.name, '과', '와') + ' 함께 속도를 올립니다.');
            } else { selfBoost('buddy', P.m + 0.1, P.t); fin(me + '친구들을 따라잡으러 힘껏 달려요.'); }
            return;
          case 'rally':
            li = sortedActive().filter(function (o) { return o !== r; }).slice(-(P.n || 2));
            li.forEach(function (o) { addFx(o, { kind: 'boost', fx: 'cheer', t: P.t, m: P.m }); pop(o, '응원 받았다!', 'good'); r.stats.helps++; });
            selfBoost('cheer', P.sm || P.m, P.t);
            sfx('cheer');
            fin(me + (li.length ? nameList(li) + '도 함께 힘을 내요.' : '혼자서도 힘을 내요.'));
            return;
          case 'grapple':
            tg = aheadOf(r, P.range || 22);
            if (!tg || tg.x - r.x <= 2.5) return waitAlt();
            res2 = applyNeg(r, tg, { kind: 'slow', fx: 'pulled', t: 1.2, m: 0.8, minor: true });
            race.ev.push({ k: 'tongue', a: r.i, b: tg.i });
            if (res2 === 'hit') { r.x = tg.x - 1.0; r.prevX = r.x; r.hop = race.t; selfBoost('dash', 1.4, 1.8); fin(me + tg.name + ' 바로 뒤까지 단숨에 따라붙었어요.'); }
            else fin(me + '하지만 ' + josa(tg.name, '이', '가') + ' 빠져나갔어요.');
            return;
          case 'kick':
            tg = behindOf(r, P.range || 10);
            if (!tg) return waitAlt();
            res2 = applyNeg(r, tg, { kind: 'stun', fx: 'trip', t: 0.6 });
            if (res2 === 'hit') { tg.x = Math.max(0, tg.x - (P.push || 6)); tg.prevX = tg.x; pop(tg, '뻥! 으아아', 'bad'); }
            race.ev.push({ k: 'kick', a: r.i, b: tg.i });
            self(P.self); sfx('trip');
            fin(me + (res2 === 'hit' ? josa(tg.name, '이', '가') + ' 뒤로 밀려났어요.' : josa(tg.name, '은', '는') + ' 막아 냈어요.'));
            return;
          case 'burrow':
            if (boosted(r)) return;
            selfBoost('burrow', P.m || 2.0, P.t || 1.0, { imm: true, air: true });
            fin(me + '땅속 지름길로 갑니다.');
            return;
          case 'feast':
            if (boosted(r)) return;
            addFx(r, { kind: 'stun', fx: 'eat', t: P.wait || 0.8, m: 0,
              onEnd: function () { if (!r.finished) { addFx(r, { kind: 'boost', fx: 'power', t: P.t * (P.heatK && race.weather.id === 'heat' ? P.heatK : 1), m: P.m }); pop(r, '힘이 솟는다!', 'good'); sfx('boost'); } } });
            fin(me + '잠시 뒤 폭풍 질주가 시작돼요.');
            return;
          case 'mimic':
            tg = P.who === 'ahead' ? aheadOf(r, 80) : leaderOf();
            if (tg === r) tg = behindOf(r, 80);
            if (!tg || tg.a.id === 'parrot' || tg.a.skill.type === 'mimic') return waitAlt();
            castSkill(r, dt, tg.a.id, true);
            return;
        }
      }
    }


    // ───────────── 트랙 위 물건과 부딪힘 ─────────────
    function checkObjects(r) {
      var objs = race.objects, res;
      for (var j = 0; j < objs.length; j++) {
        var o = objs[j];
        if (o.gone) continue;
        switch (o.type) {
          case 'box':
            if (o.lane === r.lane && !o.taken && r.prevX < o.x && r.x >= o.x) {
              if (!r.item) { o.taken = true; o.takenAt = race.t; giveItem(r); }
            }
            break;
          case 'banana':
            if (o.lane === r.lane && !o.done && r.prevX < o.x && r.x >= o.x) {
              o.done = true;
              res = applyNeg(o.src, r, { kind: 'stun', fx: 'spin', t: 1.3, ground: true });
              if (res === 'hit') { o.gone = true; pop(r, '미끄덩~!', 'bad'); sfx('slip'); log('hit', r, josa(r.name, '이', '가') + (o.egg ? ' 달걀을 밟고 빙그르르!' : ' 바나나 껍질을 밟고 빙그르르!')); }
              else if (res === 'shield' || res === 'blocked') o.gone = true;
            }
            break;
          case 'mole':
            if (o.lane === r.lane && !o.done && r.prevX < o.x && r.x >= o.x) {
              o.done = true;
              if (r.a.tr.heavy) { o.squash = race.t; pop(r, '쿵! 밟고 지나감', 'good'); log('event', r, josa(r.name, '은', '는') + ' 두더지를 못 보고 그냥 밟고 지나갔어요.'); break; }
              if (rng.chance(r.a.agi * 0.55)) { pop(r, '폴짝! 피함', 'good'); break; }
              res = applyNeg(null, r, { kind: 'stun', fx: 'trip', t: 1.1, ground: true });
              if (res === 'hit') { pop(r, '꽈당!', 'bad'); sfx('trip'); log('hit', r, josa(r.name, '이', '가') + ' 두더지에 걸려 넘어졌어요!'); }
            }
            break;
          case 'hurdles':
            if (!o.done[r.i] && r.prevX < o.x && r.x >= o.x) {
              o.done[r.i] = true;
              if (hasFlag(r, 'air')) { pop(r, '훨훨 넘어감', 'good'); break; }
              if (r.a.tr.heavy || hasFlag(r, 'imm') || hasFlag(r, 'gnd')) { o.broken[r.lane] = race.t; pop(r, '와장창!', 'good'); sfx('crash'); break; }
              var p = r.a.tr.hurdler ? 1 : 0.42 + 0.5 * r.a.agi;
              if (rng.chance(p)) { r.hop = race.t; pop(r, '폴짝!', 'good'); sfx('hop'); break; }
              o.broken[r.lane] = race.t;
              res = applyNeg(null, r, { kind: 'stun', fx: 'trip', t: 1.0, ground: true });
              if (res === 'hit') { pop(r, '꽈당!', 'bad'); sfx('trip'); log('hit', r, josa(r.name, '이', '가') + (o.log ? ' 통나무에 걸려 넘어졌어요!' : ' 허들에 걸려 넘어졌어요!')); }
            }
            break;
          case 'slick':
            if (!o.done[r.i] && r.prevX < o.x && r.x >= o.x) {
              o.done[r.i] = true;
              if (o.ink) {
                res = applyNeg(o.src || null, r, { kind: 'slow', fx: 'ink', t: 2.0, m: 0.6, ground: true });
                if (res === 'hit') { pop(r, '앞이 캄캄해!', 'bad'); log('hit', r, josa(r.name, '이', '가') + ' 먹물을 뒤집어썼어요!'); }
                break;
              }
              if (o.mud ? r.a.tr.mud : r.a.tr.ice) {
                addFx(r, { kind: 'boost', fx: 'splash', t: 2.0, m: 1.4 });
                pop(r, o.mud ? '진흙이다, 야호!' : '야호! 미끄럼틀', 'good');
                log('event', r, josa(r.name, '은', '는') + (o.mud ? ' 진흙탕에서 오히려 신이 났어요!' : ' 미끌미끌 구간에서 오히려 신이 났어요!'));
                break;
              }
              if (rng.chance(o.mud ? 0.6 : 0.55)) {
                res = applyNeg(o.src || null, r, { kind: 'stun', fx: 'spin', t: 1.1, ground: true });
                if (res === 'hit') { pop(r, '미끄덩~!', 'bad'); sfx('slip'); log('hit', r, josa(r.name, '이', '가') + (o.mud ? ' 진흙탕에서 빙그르르!' : ' 미끌미끌 구간에서 빙그르르!')); }
              } else pop(r, '아슬아슬 통과', 'good');
            }
            break;
        }
      }
    }

    // ───────────── 한 틱 ─────────────
    function tickFx(r, dt) {
      var ended = null;
      for (var j = r.fx.length - 1; j >= 0; j--) {
        var e = r.fx[j];
        e.t -= dt;
        if (e.t <= 0) { r.fx.splice(j, 1); if (e.onEnd) (ended || (ended = [])).push(e); }
      }
      if (ended) ended.forEach(function (e) { e.onEnd(); });
    }

    function move(r, dt) {
      var a = r.a;
      if (race.t < r.startDelay) { r.v = 0; return; }
      // 어부바 : 매달린 동물과 같은 속도로 딱 붙어 간다
      for (var q = 0; q < r.fx.length; q++) {
        if (r.fx[q].fx !== 'cling') continue;
        var tg = r.fx[q].target;
        if (tg.finished || tg.x < r.x - 1.5) { r.fx[q].t = 0; break; }
        var want = tg.x - 1.6;
        if (want > r.x) r.x += Math.min(want - r.x, 17 * dt);
        r.v = tg.v;
        if (r.v > r.stats.top) r.stats.top = r.v;
        return;
      }
      var tau = 2.5, sig = a.tr.steady ? 0.012 : 0.034;
      r.noise += (-r.noise / tau) * dt + sig * Math.sqrt(2 * dt / tau) * rng.gauss();
      var seg = Math.min(4, Math.floor(r.x / 100));
      var base = (a.speed + r.tune) * r.cond * r.form[seg] * (1 + r.noise);
      var gap = race.leadX - r.x;
      if (gap > 0) base *= 1 + Math.min(gap, 40) / 40 * RUBBER;
      if (r.draft) base *= 1.025;
      base *= weatherMult(r);
      var b = 1, s = 1, stun = false;
      for (var j = 0; j < r.fx.length; j++) {
        var e = r.fx[j];
        if (e.kind === 'stun') stun = true;
        else if (e.kind === 'boost') {
          if (e.ramp) e.m = e.ramp[0] + (e.ramp[1] - e.ramp[0]) * (1 - Math.max(0, e.t) / e.dur);
          b *= e.m;
        }
        else if (e.kind === 'slow') s *= e.m;
      }
      if (b > 2.4) b = 2.4;
      if (s < 0.4) s = 0.4;
      var target = stun ? 0 : base * b * s;
      var dv = target - r.v;
      var up = a.accel * (b > 1 ? 2.6 : 1) * dt, down = 18 * dt;
      if (dv > up) dv = up; else if (dv < -down) dv = -down;
      r.v += dv;
      if (r.v < 0) r.v = 0;
      r.x += r.v * dt;
      if (r.v > r.stats.top) r.stats.top = r.v;
    }

    // 토끼의 방심 낮잠
    function rabbitNap(r) {
      if (r.a.id !== 'rabbit' || r.napped || !r.napMarks.length) return;
      if (r.x < r.napMarks[0]) return;
      r.napMarks.shift();
      if (r.rank !== 1 || stunned(r)) return;
      var second = behindOf(r, 999);
      if (!second || r.x - second.x < 8) return;
      if (!rng.chance(0.5)) return;
      r.napped = true;
      r.fx = r.fx.filter(function (e) { return e.kind !== 'boost'; });
      addFx(r, { kind: 'stun', fx: 'sleep', t: 2.0, m: 0 });
      pop(r, '여유롭군… 쿨쿨', 'bad');
      log('hit', r, josa(r.name, '이', '가') + ' 너무 앞서서 방심했어요. 트랙 위에서 낮잠을…!');
      sfx('lullaby');
    }

    // 돼지 돌진에 스친 동물
    function pigBumps(r) {
      if (!r.bumped) return;
      race.racers.forEach(function (o) {
        if (o === r || o.finished || r.bumped[o.i]) return;
        if (Math.abs(o.x - r.x) < 1.3 && r.v > o.v + 0.5) {
          r.bumped[o.i] = true;
          var res = applyNeg(r, o, { kind: 'stun', fx: 'spin', t: 0.7 });
          if (res === 'hit') { pop(o, '어이쿠!', 'bad'); log('hit', o, josa(o.name, '이', '가') + ' 돌진하는 ' + r.name + '에게 스쳐 휘청!'); }
        }
      });
    }

    race.step = function (dt) {
      if (race.over) return;
      race.t += dt;
      computeRanks();
      updateWeather(dt);
      updateEvents();
      var rs = race.racers, j, r, newly = null;
      for (j = 0; j < rs.length; j++) {
        r = rs[j];
        r.prevX = r.x;
        if (r.finished) {
          // 골인한 뒤에는 천천히 멈춘다
          if (r.v > 0) { r.v = Math.max(0, r.v - 5.5 * dt); r.x += r.v * dt; }
          continue;
        }
        tickFx(r, dt);
        if (!stunned(r) && r.x < LEN - 3 && race.t > 2.5) {
          if (r.item) { r.itemT -= dt; if (r.itemT <= 0) tryUseItem(r, dt); }
          r.skillT -= dt;
          if (r.skillT <= 0) tryUseSkill(r, dt);
        }
        move(r, dt);
        checkObjects(r);
        rabbitNap(r);
        pigBumps(r);
        if (r.rank === 1) r.stats.leadTime += dt;
        var goal = LEN - (r.a.tr.reach ? 1.2 : 0);
        if (r.x >= goal) {
          r.finished = true;
          r.finT = race.t - (r.x - goal) / Math.max(r.v, 0.5);
          r.fx = []; r.item = null; r.bumped = null;
          (newly || (newly = [])).push(r);
        }
      }
      if (newly) {
        newly.sort(function (p, q) { return p.finT - q.finT; });
        newly.forEach(function (q) {
          race.finished++;
          q.place = race.finished;
          race.ev.push({ k: 'finish', r: q.i, place: q.place, t: q.finT });
          if (q.place === 1) { log('finish', q, josa(q.name, '이', '가') + ' 1등으로 골인! 우승입니다!'); sfx('win'); }
          else { log('finish', q, josa(q.name, '이', '가') + ' ' + q.place + '등으로 들어왔어요.'); sfx('goal'); }
        });
        computeRanks();
      }
      if (race.finished === rs.length) {
        var moving = false;
        for (j = 0; j < rs.length; j++) if (rs[j].v > 0.05) moving = true;
        race.allIn = true;
        if (!moving) race.over = true;
      }
      if (race.t > 240) { race.over = true; }
    };

    // 화면이 읽는 도우미
    race.hasKind = hasKind;
    race.hasFlag = hasFlag;
    race.drain = function () { var e = race.ev; race.ev = []; return e; };

    computeRanks();
    return race;
  }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  var api = {
    LEN: LEN,
    ANIMALS: ANIMALS,
    ANIMAL_BY_ID: ANIMAL_BY_ID,
    ITEMS: ITEMS,
    WEATHERS: WEATHERS,
    CATS: CATS,
    createRace: createRace,
    josa: josa
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RaceSim = api;
})(typeof window !== 'undefined' ? window : globalThis);
