/* 동물 달리기 1km — 경주 규칙
   화면과 따로 떨어져 있어서 브라우저에서도, node 에서도(밸런스 시험) 그대로 돈다. */
(function (root) {
  'use strict';

  var LEN = 1000;          // 경주 거리 (m)
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

  // ───────────── 동물 200종 (앞의 50종은 능력치를 하나하나 적었고, 뒤의 150종은 표로 정의) ─────────────
  // speed : 기본 속력(m/s) · accel : 가속 · light : 가벼움(바람 영향) · agi : 날렵함(장애물 피하기)
  // wx : 날씨별 속력 보정 (storm 은 rain 값을 같이 씀)
  // tr : 특성 — water 물웅덩이 좋아함 · ice 빙판 좋아함 · nofog 안개에 안 헤맴 · heavy 장애물을 밟고 지나감 · hurdler 허들 잘 넘음
  //      glutton 간식 효과 오래감 · steady 날씨 영향 덜 받음 · quick 출발 빠름 · nimble 금방 일어남 · mud 진흙 좋아함 · reach 결승선에서 목이 먼저 닿음
  var ANIMALS = [
    { id: 'rabbit', name: '토끼', speed: 7.701, accel: 8.0, light: 1.0, agi: 1.0, tr: { hurdler: 1 },
      wx: { rain: -0.02, snow: 0.03, heat: -0.01 },
      passive: '너무 앞서면 방심해서 낮잠을 자기도 해요.' },
    { id: 'turtle', name: '거북이', speed: 7.407, accel: 5.5, light: 0.2, agi: 0.2, tr: { steady: 1, water: 1 },
      wx: { rain: 0.04, heat: 0.02, snow: -0.02 },
      passive: '꾸준해서 날씨가 나빠도 덜 느려져요.' },
    { id: 'cheetah', name: '치타', speed: 7.435, accel: 10.0, light: 0.6, agi: 0.8, tr: { quick: 1 },
      wx: { heat: 0.03, snow: -0.05, rain: -0.03 },
      passive: '출발이 가장 빨라요.' },
    { id: 'fox', name: '여우', speed: 7.387, accel: 7.0, light: 0.7, agi: 0.8, tr: { nofog: 1 },
      wx: { fog: 0.04, snow: 0.01 },
      passive: '안개 속에서도 길을 잘 찾아요.' },
    { id: 'bear', name: '곰', speed: 7.705, accel: 6.0, light: 0.1, agi: 0.4, tr: {},
      wx: { snow: 0.04, heat: -0.05 },
      passive: '무거워서 바람에 끄떡없어요.' },
    { id: 'penguin', name: '펭귄', speed: 7.273, accel: 6.0, light: 0.6, agi: 0.5, tr: { water: 1, ice: 1 },
      wx: { snow: 0.07, rain: 0.03, heat: -0.08 },
      passive: '미끄러운 길이 오히려 좋아요.' },
    { id: 'elephant', name: '코끼리', speed: 7.898, accel: 5.5, light: 0.0, agi: 0.2, tr: { heavy: 1 },
      wx: { rain: 0.02, snow: -0.02 },
      passive: '두더지와 허들쯤은 그냥 밟고 지나가요.' },
    { id: 'kangaroo', name: '캥거루', speed: 7.639, accel: 7.0, light: 0.6, agi: 1.0, tr: { hurdler: 1 },
      wx: { heat: 0.03, snow: -0.04 },
      passive: '허들은 식은 죽 먹기예요.' },
    { id: 'skunk', name: '스컹크', speed: 7.967, accel: 6.5, light: 0.8, agi: 0.6, tr: {},
      wx: { fog: 0.02 },
      passive: '뒤에 아무도 없으면 방귀 로켓으로 추격해요.' },
    { id: 'pig', name: '돼지', speed: 7.621, accel: 6.0, light: 0.2, agi: 0.4, tr: { glutton: 1, mud: 1 },
      wx: { rain: 0.02, heat: -0.02 },
      passive: '간식을 먹으면 힘이 더 오래가요.' },
    { id: 'dog', name: '강아지', speed: 7.696, accel: 7.5, light: 0.6, agi: 0.7, tr: {},
      wx: { heat: -0.02, snow: 0.02 },
      passive: '의리파라서 친구를 도와줘요.' },
    { id: 'cat', name: '고양이', speed: 7.637, accel: 8.0, light: 0.9, agi: 0.9, tr: { nimble: 1, nofog: 1 },
      wx: { rain: -0.05, fog: 0.04 },
      passive: '넘어져도 금방 일어나요.' },
    { id: 'panda', name: '판다', speed: 7.942, accel: 5.8, light: 0.2, agi: 0.4, tr: { glutton: 1 },
      wx: { snow: 0.03, heat: -0.05 },
      passive: '간식을 먹으면 힘이 더 오래가요.' },
    { id: 'duck', name: '오리', speed: 7.296, accel: 6.5, light: 1.0, agi: 0.6, tr: { water: 1 },
      wx: { rain: 0.08, snow: -0.02, heat: -0.01 },
      passive: '비 오는 날을 제일 좋아해요.' }
    ,
    // ── 여기부터 새로 들어온 36종 ──
    { id: 'lion', name: '사자', speed: 7.809, accel: 7.0, light: 0.3, agi: 0.6, tr: {},
      wx: { heat: 0.02, rain: -0.02 },
      passive: '더운 날씨에 조금 더 힘이 나요.' },
    { id: 'tiger', name: '호랑이', speed: 7.822, accel: 8.0, light: 0.4, agi: 0.8, tr: {},
      wx: { fog: 0.02, heat: -0.01 },
      passive: '안개 낀 날 살금살금 잘 달려요.' },
    { id: 'zebra', name: '얼룩말', speed: 7.627, accel: 7.5, light: 0.5, agi: 0.7, tr: {},
      wx: { heat: 0.02, snow: -0.03 },
      passive: '착시를 쓰는 동안에는 방해가 안 통해요.' },
    { id: 'giraffe', name: '기린', speed: 7.771, accel: 5.5, light: 0.5, agi: 0.4, tr: { reach: 1 },
      wx: { heat: 0.02, snow: -0.03 },
      passive: '결승선에서는 긴 목이 먼저 닿아요.' },
    { id: 'horse', name: '말', speed: 7.597, accel: 8.0, light: 0.4, agi: 0.8, tr: { hurdler: 1 },
      wx: {},
      passive: '허들도 가볍게 넘어요.' },
    { id: 'cow', name: '젖소', speed: 7.924, accel: 5.5, light: 0.1, agi: 0.3, tr: {},
      wx: { rain: 0.01, heat: -0.02 },
      passive: '묵직해서 바람에 잘 안 밀려요.' },
    { id: 'sheep', name: '양', speed: 7.9, accel: 6.0, light: 0.7, agi: 0.5, tr: {},
      wx: { snow: 0.03, heat: -0.05, rain: -0.02 },
      passive: '털옷 덕분에 눈 오는 날이 좋아요.' },
    { id: 'goat', name: '염소', speed: 7.638, accel: 7.0, light: 0.5, agi: 0.8, tr: { hurdler: 1 },
      wx: { snow: 0.02 },
      passive: '허들쯤은 훌쩍 넘어요.' },
    { id: 'deer', name: '사슴', speed: 7.566, accel: 8.0, light: 0.6, agi: 0.9, tr: { hurdler: 1 },
      wx: { fog: 0.02, snow: 0.02 },
      passive: '허들도 사뿐히 넘어요.' },
    { id: 'koala', name: '코알라', speed: 7.962, accel: 6.0, light: 0.6, agi: 0.4, tr: { glutton: 1 },
      wx: { rain: -0.02 },
      passive: '간식을 먹으면 힘이 더 오래가요.' },
    { id: 'sloth', name: '나무늘보', speed: 7.878, accel: 5.0, light: 0.5, agi: 0.2, tr: { steady: 1 },
      wx: { rain: 0.02 },
      passive: '느긋해서 날씨가 나빠도 덜 느려져요.' },
    { id: 'monkey', name: '원숭이', speed: 7.654, accel: 8.0, light: 0.7, agi: 0.9, tr: {},
      wx: { heat: 0.01, snow: -0.04 },
      passive: '날렵해서 두더지를 잘 피해요.' },
    { id: 'gorilla', name: '고릴라', speed: 7.965, accel: 6.0, light: 0.05, agi: 0.4, tr: { heavy: 1 },
      wx: { snow: -0.02, fog: 0.01 },
      passive: '두더지와 허들쯤은 그냥 밟고 지나가요.' },
    { id: 'hippo', name: '하마', speed: 7.354, accel: 5.5, light: 0.0, agi: 0.2, tr: { heavy: 1, water: 1, mud: 1 },
      wx: { rain: 0.05, heat: -0.03 },
      passive: '비 오는 날 물웅덩이가 반가워요.' },
    { id: 'rhino', name: '코뿔소', speed: 7.844, accel: 5.0, light: 0.0, agi: 0.3, tr: { heavy: 1 },
      wx: { heat: 0.02 },
      passive: '두더지와 허들쯤은 그냥 밟고 지나가요.' },
    { id: 'croc', name: '악어', speed: 7.434, accel: 6.0, light: 0.2, agi: 0.4, tr: { water: 1 },
      wx: { rain: 0.06, snow: -0.06, heat: 0.02 },
      passive: '비 오는 날 물웅덩이가 반가워요.' },
    { id: 'frog', name: '개구리', speed: 7.198, accel: 8.0, light: 0.9, agi: 0.9, tr: { water: 1, hurdler: 1 },
      wx: { rain: 0.08, heat: -0.05, snow: -0.05 },
      passive: '비 오는 날을 제일 좋아해요.' },
    { id: 'squirrel', name: '다람쥐', speed: 7.695, accel: 9.0, light: 0.9, agi: 1.0, tr: {},
      wx: { snow: 0.01 },
      passive: '아주 날렵해서 두더지를 잘 피해요.' },
    { id: 'hamster', name: '햄스터', speed: 7.732, accel: 8.0, light: 0.9, agi: 0.6, tr: { glutton: 1 },
      wx: { heat: -0.02 },
      passive: '간식을 먹으면 힘이 더 오래가요.' },
    { id: 'mouse', name: '생쥐', speed: 7.671, accel: 9.0, light: 1.0, agi: 0.9, tr: { nofog: 1 },
      wx: { fog: 0.02 },
      passive: '안개 속에서도 길을 잘 찾아요.' },
    { id: 'hedgehog', name: '고슴도치', speed: 7.945, accel: 6.5, light: 0.7, agi: 0.5, tr: {},
      wx: {},
      passive: '가시를 세운 동안에는 방해가 안 통해요.' },
    { id: 'raccoon', name: '너구리', speed: 7.745, accel: 7.0, light: 0.7, agi: 0.8, tr: { nofog: 1 },
      wx: { fog: 0.03 },
      passive: '안개 속에서도 길을 잘 찾아요.' },
    { id: 'otter', name: '수달', speed: 7.29, accel: 7.0, light: 0.6, agi: 0.7, tr: { water: 1 },
      wx: { rain: 0.07 },
      passive: '비 오는 날 물웅덩이가 반가워요.' },
    { id: 'beaver', name: '비버', speed: 7.38, accel: 6.0, light: 0.4, agi: 0.4, tr: { water: 1 },
      wx: { rain: 0.05 },
      passive: '비 오는 날 물웅덩이가 반가워요.' },
    { id: 'wolf', name: '늑대', speed: 7.594, accel: 7.5, light: 0.5, agi: 0.8, tr: {},
      wx: { snow: 0.05, heat: -0.03 },
      passive: '눈 오는 날에 강해요.' },
    { id: 'polar', name: '북극곰', speed: 7.754, accel: 6.0, light: 0.1, agi: 0.4, tr: { ice: 1 },
      wx: { snow: 0.09, heat: -0.09 },
      passive: '빙판길이 오히려 좋아요.' },
    { id: 'seal', name: '물개', speed: 7.302, accel: 6.0, light: 0.5, agi: 0.5, tr: { water: 1, ice: 1 },
      wx: { rain: 0.05, snow: 0.05, heat: -0.06 },
      passive: '젖은 길도 언 길도 좋아해요.' },
    { id: 'owl', name: '부엉이', speed: 7.542, accel: 6.5, light: 0.9, agi: 0.6, tr: { nofog: 1 },
      wx: { fog: 0.05 },
      passive: '안개 속에서도 길을 잘 찾아요.' },
    { id: 'chicken', name: '닭', speed: 7.939, accel: 7.5, light: 0.9, agi: 0.7, tr: {},
      wx: { rain: -0.03 },
      passive: '뒤에 아무도 없으면 파닥파닥 날갯짓으로 추격해요.' },
    { id: 'parrot', name: '앵무새', speed: 7.683, accel: 7.0, light: 1.0, agi: 0.7, tr: {},
      wx: { heat: 0.03, snow: -0.05 },
      passive: '아직 아무도 스킬을 안 썼으면 그냥 날아가요.' },
    { id: 'flamingo', name: '플라밍고', speed: 7.476, accel: 6.5, light: 0.8, agi: 0.7, tr: { water: 1 },
      wx: { rain: 0.03, heat: 0.02, snow: -0.05 },
      passive: '비 오는 날 물웅덩이가 반가워요.' },
    { id: 'ostrich', name: '타조', speed: 7.718, accel: 8.5, light: 0.5, agi: 0.7, tr: {},
      wx: { heat: 0.04, snow: -0.05 },
      passive: '더운 날씨에 강해요.' },
    { id: 'camel', name: '낙타', speed: 7.78, accel: 5.5, light: 0.2, agi: 0.3, tr: {},
      wx: { heat: 0.07, snow: -0.04, rain: -0.02 },
      passive: '폭염에도 끄떡없어요.' },
    { id: 'alpaca', name: '알파카', speed: 7.936, accel: 6.5, light: 0.6, agi: 0.5, tr: {},
      wx: { snow: 0.03, heat: -0.03 },
      passive: '털옷 덕분에 눈 오는 날이 좋아요.' },
    { id: 'bat', name: '박쥐', speed: 7.395, accel: 7.5, light: 1.0, agi: 0.8, tr: { nofog: 1 },
      wx: { fog: 0.05, heat: -0.02 },
      passive: '안개 속에서도 길을 잘 찾아요.' },
    { id: 'redpanda', name: '레서판다', speed: 7.862, accel: 7.0, light: 0.7, agi: 0.7, tr: {},
      wx: { snow: 0.03, heat: -0.03 },
      passive: '눈 오는 날에 조금 더 힘이 나요.' }
  ];

  // ───────────── 나머지 150종 (해양 · 파충류 · 새 · 공룡 · 포유류) ─────────────
  // [id, 이름, 분류, 크기(S 작음 · M 보통 · L 큼), 특성, 날씨 보정]   — 스킬과 필살기는 아래 ABIL 표에
  var MORE = [
    // 바다 동물
    ['shark', '상어', 'sea', 'M', 'water', { rain: 0.04, heat: -0.02 }],
    ['whale', '고래', 'sea', 'L', 'water heavy', { rain: 0.05, heat: -0.03 }],
    ['dolphin', '돌고래', 'sea', 'M', 'water', { rain: 0.05 }],
    ['orca', '범고래', 'sea', 'L', 'water ice heavy', { rain: 0.04, snow: 0.04, heat: -0.05 }],
    ['octopus', '문어', 'sea', 'M', 'water', { rain: 0.04, heat: -0.03 }],
    ['squid', '오징어', 'sea', 'M', 'water', { rain: 0.04, heat: -0.03 }],
    ['crab', '게', 'sea', 'S', 'water', { rain: 0.04 }],
    ['lobster', '바닷가재', 'sea', 'M', 'water', { rain: 0.04 }],
    ['shrimp', '새우', 'sea', 'S', 'water', { rain: 0.04 }],
    ['jellyfish', '해파리', 'sea', 'S', 'water', { rain: 0.05 }],
    ['starfish', '불가사리', 'sea', 'S', 'water', { rain: 0.04 }],
    ['seahorse', '해마', 'sea', 'S', 'water', { rain: 0.04 }],
    ['clownfish', '흰동가리', 'sea', 'S', 'water', { rain: 0.04 }],
    ['puffer', '복어', 'sea', 'S', 'water', { rain: 0.04 }],
    ['manta', '쥐가오리', 'sea', 'M', 'water', { rain: 0.04 }],
    ['walrus', '바다코끼리', 'sea', 'L', 'water ice heavy', { snow: 0.06, rain: 0.03, heat: -0.06 }],
    ['narwhal', '일각고래', 'sea', 'M', 'water ice', { snow: 0.05, rain: 0.03, heat: -0.05 }],
    ['sealion', '바다사자', 'sea', 'M', 'water', { rain: 0.05, heat: -0.03 }],
    ['manatee', '매너티', 'sea', 'L', 'water steady', { rain: 0.04 }],
    ['beluga', '흰고래', 'sea', 'M', 'water ice', { snow: 0.06, rain: 0.03, heat: -0.06 }],
    ['swordfish', '황새치', 'sea', 'M', 'water', { rain: 0.05 }],
    ['angler', '아귀', 'sea', 'S', 'water nofog', { fog: 0.05, rain: 0.03 }],
    ['seaturtle', '바다거북', 'sea', 'M', 'water steady', { rain: 0.05 }],
    // 파충류 · 양서류
    ['snake', '뱀', 'rep', 'M', '', { heat: 0.03, snow: -0.06 }],
    ['cobra', '코브라', 'rep', 'M', '', { heat: 0.04, snow: -0.06 }],
    ['lizard', '도마뱀', 'rep', 'S', '', { heat: 0.04, snow: -0.05 }],
    ['chameleon', '카멜레온', 'rep', 'S', 'nofog', { heat: 0.03, snow: -0.05, fog: 0.03 }],
    ['iguana', '이구아나', 'rep', 'M', '', { heat: 0.06, snow: -0.07 }],
    ['gecko', '도마뱀붙이', 'rep', 'S', '', { heat: 0.03, snow: -0.05 }],
    ['komodo', '코모도왕도마뱀', 'rep', 'L', 'heavy', { heat: 0.04, snow: -0.07 }],
    ['tortoise', '땅거북', 'rep', 'L', 'steady heavy', { heat: 0.03 }],
    ['axolotl', '우파루파', 'rep', 'S', 'water', { rain: 0.06, heat: -0.05 }],
    ['salamander', '도롱뇽', 'rep', 'S', 'water', { rain: 0.06, heat: -0.04 }],
    ['toad', '두꺼비', 'rep', 'S', 'water hurdler', { rain: 0.07, heat: -0.04 }],
    // 새
    ['eagle', '독수리', 'bird', 'M', '', { rain: -0.03 }],
    ['falcon', '매', 'bird', 'S', '', { rain: -0.03 }],
    ['crow', '까마귀', 'bird', 'S', 'nofog', { fog: 0.03 }],
    ['swan', '백조', 'bird', 'M', 'water', { rain: 0.04 }],
    ['goose', '거위', 'bird', 'M', 'water', { rain: 0.04 }],
    ['peacock', '공작', 'bird', 'M', '', { rain: -0.03 }],
    ['toucan', '큰부리새', 'bird', 'S', '', { heat: 0.03, snow: -0.05 }],
    ['pelican', '펠리컨', 'bird', 'M', 'water', { rain: 0.04 }],
    ['woodpecker', '딱따구리', 'bird', 'S', '', {}],
    ['pigeon', '비둘기', 'bird', 'S', '', {}],
    ['seagull', '갈매기', 'bird', 'S', 'water', { rain: 0.03 }],
    ['sparrow', '참새', 'bird', 'S', '', {}],
    ['hummingbird', '벌새', 'bird', 'S', '', { rain: -0.03, heat: 0.02 }],
    ['kiwi', '키위새', 'bird', 'S', 'nofog', { fog: 0.04 }],
    ['turkey', '칠면조', 'bird', 'M', '', {}],
    ['crane', '두루미', 'bird', 'M', 'water', { rain: 0.03, snow: 0.03 }],
    ['stork', '황새', 'bird', 'M', 'water', { rain: 0.03 }],
    ['puffin', '퍼핀', 'bird', 'S', 'water ice', { rain: 0.04, snow: 0.04, heat: -0.05 }],
    ['robin', '울새', 'bird', 'S', '', { snow: 0.02 }],
    ['canary', '카나리아', 'bird', 'S', '', { snow: -0.03 }],
    ['cockatoo', '왕관앵무', 'bird', 'S', '', { heat: 0.03, snow: -0.04 }],
    ['vulture', '대머리수리', 'bird', 'M', '', { heat: 0.04 }],
    ['dodo', '도도새', 'bird', 'M', '', {}],
    // 공룡 · 옛 동물
    ['trex', '티라노사우루스', 'dino', 'L', 'heavy', { heat: 0.02 }],
    ['triceratops', '트리케라톱스', 'dino', 'L', 'heavy', {}],
    ['stego', '스테고사우루스', 'dino', 'L', 'heavy', {}],
    ['brachio', '브라키오사우루스', 'dino', 'L', 'heavy reach', {}],
    ['raptor', '벨로키랍토르', 'dino', 'M', 'quick', {}],
    ['ptero', '프테라노돈', 'dino', 'M', '', { rain: -0.03 }],
    ['ankylo', '안킬로사우루스', 'dino', 'L', 'heavy', {}],
    ['parasaur', '파라사우롤로푸스', 'dino', 'M', '', {}],
    ['spino', '스피노사우루스', 'dino', 'L', 'water heavy', { rain: 0.05 }],
    ['diplodocus', '디플로도쿠스', 'dino', 'L', 'heavy reach', {}],
    ['pachy', '파키케팔로사우루스', 'dino', 'M', '', {}],
    ['dilopho', '딜로포사우루스', 'dino', 'M', '', {}],
    ['compy', '콤프소그나투스', 'dino', 'S', 'quick', {}],
    ['plesio', '플레시오사우루스', 'dino', 'M', 'water reach', { rain: 0.06 }],
    ['mammoth', '매머드', 'dino', 'L', 'heavy ice', { snow: 0.07, heat: -0.08 }],
    ['sabertooth', '검치호', 'dino', 'M', '', { snow: 0.04, heat: -0.03 }],
    ['dimetrodon', '디메트로돈', 'dino', 'M', '', { heat: 0.05, snow: -0.06 }],
    ['archaeo', '시조새', 'dino', 'S', '', {}],
    // 포유류
    ['capybara', '카피바라', 'mam', 'M', 'water steady', { rain: 0.04 }],
    ['fennec', '사막여우', 'mam', 'S', 'nofog', { heat: 0.06, snow: -0.04 }],
    ['meerkat', '미어캣', 'mam', 'S', '', { heat: 0.04 }],
    ['badger', '오소리', 'mam', 'M', 'nofog', { fog: 0.03 }],
    ['ferret', '족제비', 'mam', 'S', 'nimble', {}],
    ['chipmunk', '줄무늬다람쥐', 'mam', 'S', 'glutton', {}],
    ['leopard', '표범', 'mam', 'M', '', { heat: 0.02 }],
    ['panther', '흑표범', 'mam', 'M', 'nofog nimble', { fog: 0.05 }],
    ['hyena', '하이에나', 'mam', 'M', '', { heat: 0.03 }],
    ['lynx', '스라소니', 'mam', 'M', 'nimble', { snow: 0.05 }],
    ['bison', '들소', 'mam', 'L', 'heavy', { snow: 0.03 }],
    ['moose', '무스', 'mam', 'L', 'heavy', { snow: 0.05, heat: -0.04 }],
    ['reindeer', '순록', 'mam', 'M', 'hurdler', { snow: 0.07, heat: -0.05 }],
    ['llama', '라마', 'mam', 'M', '', { snow: 0.02 }],
    ['donkey', '당나귀', 'mam', 'M', '', {}],
    ['boar', '멧돼지', 'mam', 'M', 'heavy mud', {}],
    ['anteater', '개미핥기', 'mam', 'M', '', {}],
    ['armadillo', '아르마딜로', 'mam', 'S', '', {}],
    ['pangolin', '천산갑', 'mam', 'S', '', {}],
    ['platypus', '오리너구리', 'mam', 'S', 'water', { rain: 0.05 }],
    ['wombat', '웜뱃', 'mam', 'M', '', {}],
    ['quokka', '쿼카', 'mam', 'S', '', {}],
    ['lemur', '여우원숭이', 'mam', 'S', '', { heat: 0.03 }],
    ['orangutan', '오랑우탄', 'mam', 'L', '', { heat: 0.02 }],
    ['chimp', '침팬지', 'mam', 'M', '', {}],
    // 2026-11 에 더한 50종
    ['jaguar', '재규어', 'mam', 'M', 'water', { rain: 0.03 }],
    ['snowleopard', '눈표범', 'mam', 'M', 'ice nimble', { snow: 0.05, heat: -0.03 }],
    ['gazelle', '가젤', 'mam', 'S', 'hurdler quick', { heat: 0.02 }],
    ['gnu', '누', 'mam', 'M', 'steady', { heat: 0.02 }],
    ['buffalo', '물소', 'mam', 'L', 'water mud heavy', { rain: 0.04 }],
    ['yak', '야크', 'mam', 'L', 'ice heavy steady', { snow: 0.05, heat: -0.04 }],
    ['tapir', '맥', 'mam', 'M', 'water mud', { rain: 0.04 }],
    ['okapi', '오카피', 'mam', 'M', 'nimble', { rain: 0.02 }],
    ['mole', '두더지', 'mam', 'S', 'mud', { rain: 0.02, heat: -0.02 }],
    ['prairiedog', '프레리도그', 'mam', 'S', 'quick', { heat: 0.02 }],
    ['flyingsquirrel', '날다람쥐', 'mam', 'S', 'hurdler nimble', { wind: 0.03 }],
    ['tasdevil', '태즈메이니아데빌', 'mam', 'S', 'nimble', { fog: 0.03 }],
    ['echidna', '바늘두더지', 'mam', 'S', 'steady', { heat: 0.02 }],
    ['mandrill', '맨드릴', 'mam', 'M', 'hurdler', { heat: 0.02, snow: -0.03 }],
    ['magpie', '까치', 'bird', 'S', 'quick', { wind: 0.02 }],
    ['swallow', '제비', 'bird', 'S', 'quick', { rain: 0.03, wind: 0.03 }],
    ['kingfisher', '물총새', 'bird', 'S', 'water', { rain: 0.04 }],
    ['albatross', '알바트로스', 'bird', 'M', 'water steady', { wind: 0.05 }],
    ['emu', '에뮤', 'bird', 'M', 'hurdler', { heat: 0.03 }],
    ['cassowary', '화식조', 'bird', 'M', '', { rain: 0.03 }],
    ['roadrunner', '로드러너', 'bird', 'S', 'quick', { heat: 0.05, snow: -0.04 }],
    ['heron', '왜가리', 'bird', 'M', 'water', { rain: 0.03, fog: 0.02 }],
    ['pheasant', '꿩', 'bird', 'S', 'hurdler', { snow: 0.02 }],
    ['mandarin', '원앙', 'bird', 'S', 'water', { rain: 0.04 }],
    ['shoebill', '넓적부리황새', 'bird', 'M', 'water steady', { rain: 0.03 }],
    ['secretary', '뱀잡이수리', 'bird', 'M', 'hurdler', { heat: 0.03 }],
    ['rattlesnake', '방울뱀', 'rep', 'S', '', { heat: 0.05, snow: -0.05 }],
    ['anaconda', '아나콘다', 'rep', 'L', 'water mud', { rain: 0.05 }],
    ['frilled', '목도리도마뱀', 'rep', 'S', 'quick', { heat: 0.04 }],
    ['basilisk', '바실리스크', 'rep', 'S', 'water quick', { rain: 0.04 }],
    ['dartfrog', '독화살개구리', 'rep', 'S', 'water', { rain: 0.05, heat: -0.02 }],
    ['softshell', '자라', 'rep', 'M', 'water mud steady', { rain: 0.04 }],
    ['whaleshark', '고래상어', 'sea', 'L', 'water heavy steady', { rain: 0.04 }],
    ['hammerhead', '귀상어', 'sea', 'M', 'water', { rain: 0.04 }],
    ['sunfish', '개복치', 'sea', 'L', 'water', { heat: 0.03 }],
    ['flyingfish', '날치', 'sea', 'S', 'water hurdler', { rain: 0.03, wind: 0.03 }],
    ['moray', '곰치', 'sea', 'M', 'water', { rain: 0.03, fog: 0.03 }],
    ['seaotter', '해달', 'sea', 'S', 'water ice', { rain: 0.04, snow: 0.02 }],
    ['hermit', '소라게', 'sea', 'S', 'water steady', { rain: 0.03 }],
    ['cuttlefish', '갑오징어', 'sea', 'S', 'water', { rain: 0.04, fog: 0.02 }],
    ['eel', '전기뱀장어', 'sea', 'M', 'water mud', { rain: 0.05 }],
    ['salmon', '연어', 'sea', 'M', 'water hurdler', { rain: 0.05 }],
    ['allosaurus', '알로사우루스', 'dino', 'L', 'heavy', { heat: 0.02 }],
    ['carno', '카르노타우루스', 'dino', 'L', 'quick', { heat: 0.03 }],
    ['therizino', '테리지노사우루스', 'dino', 'L', '', { rain: 0.02 }],
    ['iguanodon', '이구아노돈', 'dino', 'L', 'steady', { rain: 0.02 }],
    ['gallimimus', '갈리미무스', 'dino', 'M', 'quick hurdler', { heat: 0.03 }],
    ['mosasaurus', '모사사우루스', 'dino', 'L', 'water heavy', { rain: 0.05 }],
    ['quetzal', '케찰코아틀루스', 'dino', 'M', '', { wind: 0.04 }],
    ['glyptodon', '글립토돈', 'dino', 'L', 'heavy steady', { heat: 0.02 }],
    // 곤충 50종
    ['ant', '개미', 'bug', 'S', 'steady', { rain: -0.03, heat: 0.03 }],
    ['fireant', '불개미', 'bug', 'S', 'quick', { rain: -0.02, heat: 0.05 }],
    ['leafcutter', '가위개미', 'bug', 'S', 'steady', { rain: 0.02, heat: 0.03 }],
    ['bulletant', '총알개미', 'bug', 'S', '', { rain: 0.02, heat: 0.04 }],
    ['termite', '흰개미', 'bug', 'S', 'steady', { rain: -0.03, heat: 0.04 }],
    ['honeybee', '꿀벌', 'bug', 'S', 'quick', { rain: -0.04, heat: 0.03 }],
    ['bumblebee', '호박벌', 'bug', 'S', 'steady', { rain: -0.03, snow: 0.02 }],
    ['wasp', '말벌', 'bug', 'S', 'quick nimble', { rain: -0.04, heat: 0.04 }],
    ['hornet', '장수말벌', 'bug', 'M', 'quick', { rain: -0.03, heat: 0.04 }],
    ['housefly', '파리', 'bug', 'S', 'nimble quick', { rain: -0.03, heat: 0.04 }],
    ['mosquito', '모기', 'bug', 'S', 'nimble', { rain: 0.02, heat: 0.04, wind: -0.04 }],
    ['fruitfly', '초파리', 'bug', 'S', 'nimble', { heat: 0.03, wind: -0.04 }],
    ['horsefly', '등에', 'bug', 'S', 'quick', { rain: -0.02, heat: 0.05 }],
    ['hoverfly', '꽃등에', 'bug', 'S', 'nimble', { rain: -0.03, heat: 0.03 }],
    ['swallowtail', '호랑나비', 'bug', 'S', 'nimble', { rain: -0.05, wind: -0.02, heat: 0.03 }],
    ['monarch', '제왕나비', 'bug', 'S', 'steady', { rain: -0.04, wind: 0.03 }],
    ['morpho', '모르포나비', 'bug', 'S', 'nimble', { rain: 0.02, heat: 0.03 }],
    ['moth', '나방', 'bug', 'S', '', { rain: -0.03, fog: 0.05 }],
    ['hawkmoth', '박각시', 'bug', 'S', 'quick', { rain: -0.03, fog: 0.03 }],
    ['caterpillar', '애벌레', 'bug', 'S', 'steady', { rain: 0.02, snow: -0.04 }],
    ['dragonfly', '잠자리', 'bug', 'S', 'quick nimble', { rain: -0.03, wind: 0.02 }],
    ['mayfly', '하루살이', 'bug', 'S', 'water', { rain: 0.02, wind: -0.04 }],
    ['grasshopper', '메뚜기', 'bug', 'S', 'hurdler quick', { rain: -0.03, heat: 0.04 }],
    ['locust', '풀무치', 'bug', 'S', 'hurdler', { rain: -0.03, heat: 0.05 }],
    ['cricket', '귀뚜라미', 'bug', 'S', 'hurdler', { rain: -0.02, snow: -0.03, fog: 0.03 }],
    ['katydid', '여치', 'bug', 'S', 'hurdler', { rain: -0.02, heat: 0.03 }],
    ['molecricket', '땅강아지', 'bug', 'S', 'mud', { rain: 0.03 }],
    ['flea', '벼룩', 'bug', 'S', 'hurdler nimble', { heat: 0.03 }],
    ['mantis', '사마귀', 'bug', 'S', 'quick', { rain: -0.02, heat: 0.03 }],
    ['stickbug', '대벌레', 'bug', 'S', 'steady', { wind: -0.03, heat: 0.02 }],
    ['ladybug', '무당벌레', 'bug', 'S', '', { rain: -0.03, heat: 0.03 }],
    ['rhinobeetle', '장수풍뎅이', 'bug', 'M', 'steady', { rain: -0.02, heat: 0.04 }],
    ['stagbeetle', '사슴벌레', 'bug', 'M', 'steady', { rain: -0.02, heat: 0.03 }],
    ['dungbeetle', '쇠똥구리', 'bug', 'S', 'mud steady', { heat: 0.04 }],
    ['firefly', '반딧불이', 'bug', 'S', '', { rain: -0.03, fog: 0.05 }],
    ['longhorn', '하늘소', 'bug', 'S', 'steady', { rain: -0.02, heat: 0.03 }],
    ['weevil', '바구미', 'bug', 'S', 'steady', { heat: 0.03 }],
    ['tigerbeetle', '길앞잡이', 'bug', 'S', 'quick', { rain: -0.03, heat: 0.05 }],
    ['bombardier', '폭탄먼지벌레', 'bug', 'S', '', { rain: -0.02, heat: 0.04 }],
    ['jewelbeetle', '비단벌레', 'bug', 'S', '', { rain: -0.03, heat: 0.04 }],
    ['divingbeetle', '물방개', 'bug', 'S', 'water', { rain: 0.05 }],
    ['strider', '소금쟁이', 'bug', 'S', 'water nimble', { rain: 0.04, wind: -0.03 }],
    ['waterbug', '물장군', 'bug', 'S', 'water', { rain: 0.05 }],
    ['cicada', '매미', 'bug', 'S', '', { rain: -0.03, heat: 0.06 }],
    ['stinkbug', '노린재', 'bug', 'S', 'steady', { rain: -0.02, heat: 0.03 }],
    ['cockroach', '바퀴벌레', 'bug', 'S', 'quick nimble', { heat: 0.04, snow: -0.04 }],
    ['earwig', '집게벌레', 'bug', 'S', '', { rain: 0.02 }],
    ['antlion', '개미귀신', 'bug', 'S', 'steady', { rain: -0.04, heat: 0.05 }],
    ['froghopper', '거품벌레', 'bug', 'S', 'hurdler', { rain: 0.02 }],
    ['aphid', '진딧물', 'bug', 'S', '', { rain: -0.04, heat: 0.02 }]
  ];
  var MORE_SPEED = {
    shark: 7.37, whale: 7.51, dolphin: 7.446, orca: 7.209, octopus: 7.483, squid: 7.507, crab: 7.338, lobster: 7.185,
    shrimp: 7.273, jellyfish: 7.411, starfish: 7.374, seahorse: 7.39, clownfish: 7.454, puffer: 7.468, manta: 7.478, walrus: 7.357,
    narwhal: 7.339, sealion: 7.652, manatee: 7.764, beluga: 7.324, swordfish: 7.43, angler: 7.363, seaturtle: 7.323, snake: 7.882,
    cobra: 7.813, lizard: 7.591, chameleon: 7.708, iguana: 7.749, gecko: 7.633, komodo: 7.775, tortoise: 7.619, axolotl: 7.338,
    salamander: 7.329, toad: 7.258, eagle: 7.856, falcon: 7.777, crow: 7.643, swan: 7.367, goose: 7.431, peacock: 7.994,
    toucan: 7.661, pelican: 7.467, woodpecker: 7.767, pigeon: 7.761, seagull: 7.386, sparrow: 7.609, hummingbird: 7.6, kiwi: 7.74,
    turkey: 7.761, crane: 7.386, stork: 7.369, puffin: 7.095, robin: 7.819, canary: 7.76, cockatoo: 7.592, vulture: 7.488,
    dodo: 7.716, trex: 7.951, triceratops: 7.902, stego: 8.117, brachio: 7.953, raptor: 7.807, ptero: 7.772, ankylo: 8.025,
    parasaur: 7.792, spino: 7.393, diplodocus: 7.797, pachy: 7.901, dilopho: 7.941, compy: 7.672, plesio: 7.41, mammoth: 7.744,
    sabertooth: 7.685, dimetrodon: 7.724, archaeo: 7.69, capybara: 7.599, fennec: 7.571, meerkat: 7.688, badger: 7.796, ferret: 7.548,
    chipmunk: 7.781, leopard: 7.858, panther: 7.613, hyena: 7.711, lynx: 7.346, bison: 7.831, moose: 7.756, reindeer: 7.548,
    llama: 7.909, donkey: 7.955, boar: 7.615, anteater: 7.886, armadillo: 7.809, pangolin: 7.946, platypus: 7.399, wombat: 7.852,
    quokka: 7.683, lemur: 7.406, orangutan: 7.832, chimp: 7.824, jaguar: 7.548, snowleopard: 7.431, gazelle: 7.578, gnu: 7.814,
    buffalo: 7.349, yak: 7.638, tapir: 7.306, okapi: 7.674, mole: 7.682, prairiedog: 7.819, flyingsquirrel: 7.594, tasdevil: 7.627,
    echidna: 7.882, mandrill: 7.71, magpie: 7.476, swallow: 7.541, kingfisher: 7.485, albatross: 7.395, emu: 7.536, cassowary: 7.752,
    roadrunner: 7.482, heron: 7.483, pheasant: 7.616, mandarin: 7.493, shoebill: 7.466, secretary: 7.549, rattlesnake: 7.643, anaconda: 7.475,
    frilled: 7.498, basilisk: 7.185, dartfrog: 7.439, softshell: 7.31, whaleshark: 7.613, hammerhead: 7.487, sunfish: 7.419, flyingfish: 7.245,
    moray: 7.518, seaotter: 7.338, hermit: 7.494, cuttlefish: 7.37, eel: 7.312, salmon: 7.148, allosaurus: 7.799, carno: 7.579,
    therizino: 7.854, iguanodon: 7.848, gallimimus: 7.529, mosasaurus: 7.445, quetzal: 7.828, glyptodon: 7.836, ant: 7.629, fireant: 7.529,
    leafcutter: 7.591, bulletant: 7.596, termite: 7.384, honeybee: 7.69, bumblebee: 7.666, wasp: 7.509, hornet: 7.634, housefly: 7.393,
    mosquito: 7.351, fruitfly: 7.525, horsefly: 7.564, hoverfly: 7.378, swallowtail: 7.524, monarch: 7.627, morpho: 7.412, moth: 7.724,
    hawkmoth: 7.417, caterpillar: 7.528, dragonfly: 7.586, mayfly: 7.265, grasshopper: 7.587, locust: 7.572, cricket: 7.761, katydid: 7.643,
    molecricket: 7.496, flea: 7.431, mantis: 7.542, stickbug: 7.608, ladybug: 7.633, rhinobeetle: 7.658, stagbeetle: 7.714, dungbeetle: 7.357,
    firefly: 7.713, longhorn: 7.58, weevil: 7.555, tigerbeetle: 7.475, bombardier: 7.59, jewelbeetle: 7.609, divingbeetle: 7.327, strider: 7.244,
    waterbug: 7.448, cicada: 7.632, stinkbug: 7.552, cockroach: 7.476, earwig: 7.687, antlion: 7.627, froghopper: 7.646, aphid: 7.772
  };
  var SIZE_DEF = { S: [8.4, 0.9, 0.8], M: [7.0, 0.5, 0.65], L: [5.6, 0.1, 0.35] };
  MORE.forEach(function (m) {
    var d = SIZE_DEF[m[3]], tr = {};
    m[4].split(' ').forEach(function (k) { if (k) tr[k] = 1; });
    ANIMALS.push({ id: m[0], name: m[1], cat: m[2], speed: MORE_SPEED[m[0]] || 7.6, accel: d[0], light: d[1], agi: d[2], tr: tr, wx: m[5] });
  });

  // 분류 (도감에서 묶어 보여 줌)
  var CATS = [['mam', '포유류'], ['bird', '새'], ['rep', '파충류 · 양서류'], ['sea', '바다 동물'], ['dino', '공룡 · 옛 동물'], ['bug', '곤충']];
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

  // ───────────── 스킬 · 필살기 (250종 × 3개 = 750개, 작동 방식이 모두 다르다) ─────────────
  // id: [스킬1 이름, 식, 스킬2 이름, 식, 필살기 이름, 식]
  // 식 = '효과@대상~조건:값' 을 '+' 로 이은 것. 'U' 는 아래 ULT 표에 따로 만든 전용 필살기.
  //   효과 — 스스로 : burst cruise ramp fade pulse windup over hop soar slide armor roll firm blink relay glide dig wheel
  //                   shield mirror thorns cleanse charge quick bank dice echo counter cocoon vault
  //          방해   : stun trip zap slow bog gust push sleep back freeze seal drain delay curse tax swap demote hook leech strip cling reel pin sting swarm itch aura
  //          도움   : aid guard feed tow heal        트랙 : peel mole slick hurdle wall drop        세상 : wx terra event
  //   대상 — a1 a2 a3(앞) L T3(선두) b1 b2(뒤) near wide lane adj last tail3 rnd rnd3 ahead behind all fast rich foe boosted
  //          bird mam rep sea dino bug kin alien heavy lightw odd even mid   ·   slick/hurdle/wall 은 놓는 자리 back front mid
  //   조건 — rank lead late early gap crowd alone stack fresh hurt calm gauge dice chase flee kin hits inWater… wRain…
  var ABIL = {
    rabbit: ['깡충깡충 대시', 'pulse', '깡충 뒷발차기', 'push@b1', '달나라 점프', 'hop+blink'],
    turtle: ['등껍질 스핀', 'armor', '느려도 꾸준히', 'firm~late', '시간아 멈춰라', 'U'],
    cheetah: ['번개 스프린트', 'over', '먹잇감 조준', 'reel@a1', '연쇄 사냥', 'U'],
    fox: ['여우 꾀', 'demote@L+burst', '여우불', 'slick@back:fire', '둔갑술', 'swap@L'],
    bear: ['쩌렁쩌렁 포효', 'slow@wide+cruise', '연어 낚아채기', 'windup~inWater', '겨울잠 뒤 대폭발', 'windup+armor'],
    penguin: ['배치기 슬라이딩', 'slide', '허들링', 'aid@near', '빙판 대미끄럼', 'U'],
    elephant: ['코 물대포', 'slow@L', '코 나팔', 'gust@lightw', '대지진 발구르기', 'trip@all'],
    kangaroo: ['슈퍼 점프', 'hop', '주머니 펀치', 'stun@a1+burst', '캥거루 권투', 'stun@a2+push@a2'],
    skunk: ['뿡뿡 구름', 'slow@behind+burst', '꼬리 세우기', 'gust@b2', '지독한 방귀 안개', 'wx:fog+slow@all'],
    pig: ['꿀꿀 돌진', 'roll', '진흙 튀기기', 'slick@back:mud', '꼴찌들의 반란', 'U'],
    dog: ['같이 가자!', 'aid@b1', '멍멍 짖기', 'back@a1', '모여라! 양몰이', 'U'],
    cat: ['냥냥 펀치', 'stun@a1', '살금살금', 'counter', '아홉 목숨', 'cleanse+counter+burst'],
    panda: ['대나무 간식 타임', 'windup', '데굴데굴 구르기', 'roll~inSlope', '쿵푸 데굴데굴', 'roll+push@a2'],
    duck: ['파닥파닥 활공', 'soar', '꽥꽥 물장구', 'slow@near~inWater', '장맛비 기우제', 'wx:rain+slide'],
    lion: ['왕의 포효', 'slow@ahead', '사냥 본능', 'burst~chase', '왕의 위엄', 'stun@ahead'],
    tiger: ['호랑이 덮치기', 'trip@a1+hop', '줄무늬 위장', 'shield~inForest', '호랑이 기운', 'leech@T3'],
    zebra: ['줄무늬 착시', 'seal@odd', '얼룩말 뒷발차기', 'stun@b1', '줄무늬 대혼란', 'U'],
    giraffe: ['높은 나무 열매', 'windup~inForest', '긴 다리 성큼', 'glide', '긴 목 걸기', 'reel@L'],
    horse: ['전력 질주', 'cruise', '히힝 뒷발차기', 'push@b2', '질풍 갤럽', 'cruise+firm'],
    cow: ['신선한 우유', 'cleanse+shield', '음메 합창', 'aid@kin', '소 떼 대이동', 'U'],
    sheep: ['양 세기 자장가', 'sleep@near', '털 뭉치 날리기', 'slow@a1+shield', '양 떼 꿈나라', 'sleep@all'],
    goat: ['오기 박치기', 'burst~rank', '절벽 타기', 'ramp~inRock', '뿔 박치기 연타', 'push@a3+burst'],
    deer: ['뿔 반사', 'mirror', '뿔 들이받기', 'push@a1+burst', '우아한 3단 도약', 'pulse~gap'],
    koala: ['어부바', 'cling@a1', '유칼립투스 간식', 'windup~calm', '잠결에 걷기', 'dice'],
    sloth: ['느긋함 전염', 'slow@near~calm', '나무늘보 하품', 'sleep@a1', '세상이 느려진다', 'slow@all'],
    monkey: ['바나나 세례', 'peel@a2', '나무 타기', 'hop~inForest', '바나나 대폭격', 'U'],
    gorilla: ['쿵쿵 가슴 두드리기', 'trip@near', '바위 던지기', 'drop@L', '킹콩 던지기', 'tax@a2'],
    hippo: ['진흙탕 만들기', 'slick@mid:mud', '큰 입 쩍', 'bog@near', '늪지대 소환', 'terra:mud+firm'],
    rhino: ['멈출 수 없는 돌진', 'ramp+thorns', '진흙 갑옷', 'shield~inMud', '무쌍 돌진', 'armor~late+push@a2'],
    croc: ['악어의 눈물', 'tax@a1', '죽은 척', 'shield+quick', '데스 롤', 'U'],
    frog: ['혓바닥 낼름', 'hook@a1', '폴짝 높이뛰기', 'hop~wRain', '연잎 뜀뛰기', 'pulse~crowd'],
    squirrel: ['도토리 세례', 'drop@heavy', '나무 위 지름길', 'blink~inForest', '도토리 폭풍', 'U'],
    hamster: ['쳇바퀴 질주', 'wheel', '해바라기씨 간식', 'charge', '쳇바퀴 터보', 'wheel+ramp'],
    mouse: ['쥐구멍 지름길', 'dig', '쥐구멍', 'shield+blink', '작아져라 얍!', 'U'],
    hedgehog: ['가시 세우기', 'thorns', '데굴데굴 가시 공', 'roll+thorns', '가시 폭풍', 'U'],
    raccoon: ['기운 가로채기', 'strip@boosted+burst~hits', '눈속임', 'swap@a1', '싹쓸이 도둑', 'U'],
    otter: ['물살 타기', 'shield+slide', '조개 던지기', 'stun@L', '물미끄럼틀', 'U'],
    beaver: ['통나무 댐', 'hurdle@back', '이빨 갉기', 'pin@a1', '댐 건설', 'wall@front'],
    wolf: ['무리 사냥 하울링', 'cruise~crowd', '무리 달리기', 'aid@near~crowd', '보름달 하울링', 'seal@all'],
    polar: ['얼음 숨결', 'freeze@a1', '눈 뭉치 던지기', 'stun@a2~wSnow', '빙하기', 'freeze@near'],
    seal: ['비치볼 튕기기', 'stun@T3', '배치기 미끄럼', 'slide~inWater', '서커스 공 저글링', 'stun@rnd3+pulse'],
    owl: ['밤이 왔다', 'pin@all', '소리 없는 비행', 'soar~alone', '시간 되감기', 'U'],
    chicken: ['달걀 폭탄', 'peel@b1', '꼬끼오 기상', 'heal@near', '달걀 융단 폭격', 'peel@behind+hop'],
    parrot: ['따라 하기', 'echo', '말 따라 하기', 'echo+shield', '따라쟁이 필살기', 'U'],
    flamingo: ['성큼성큼', 'relay', '한 발 버티기', 'firm', '핑크빛 군무', 'sleep@wide+soar'],
    ostrich: ['뒷발차기', 'push@b1+burst', '모래 뿌리기', 'slow@behind~inSand', '폭주 타조', 'over+push@a1'],
    camel: ['혹 에너지', 'firm~wHeat', '혹 속 비상식량', 'bank', '사막의 신기루', 'wx:heat+terra:sand'],
    alpaca: ['퉤! 침 뱉기', 'slow@a1', '복슬복슬 방패', 'guard@adj', '침 세례 대방출', 'slow@a3+seal@a3'],
    bat: ['초음파', 'delay@near', '박쥐 비행', 'soar~wFog', '거꾸로 세상', 'U'],
    redpanda: ['만세 위협', 'stun@near~fresh', '꼬리 이불', 'cleanse+cruise', '대왕 레서판다 변신', 'U'],
    shark: ['덥석 물기', 'trip@a1+burst', '지느러미 공포', 'back@sea', '피 냄새 추격', 'reel@L+burst'],
    whale: ['물기둥 분수', 'gust@near', '꼬리 내려치기', 'trip@behind', '큰 숨 들이마시기', 'U'],
    dolphin: ['공중제비 점프', 'hop~inWater', '초음파 장난', 'seal@a1', '파도 타고 대점프', 'event:bigwave+hop'],
    orca: ['큰 파도 일으키기', 'event:bigwave', '범고래 추격', 'reel@fast', '범고래 사냥 대형', 'U'],
    octopus: ['먹물 뿌리기', 'slick@back:ink', '빨판 붙잡기', 'cling@a1+drain@a1', '먹물 대폭발', 'slick@front:ink+armor'],
    squid: ['제트 분사', 'fade', '먹물 연막', 'slick@mid:ink', '대왕오징어 촉수', 'hook@a3'],
    crab: ['집게 꼬집기', 'trip@a1', '옆걸음 질주', 'burst~inSand', '게걸음 길막기', 'U'],
    lobster: ['집게 붙잡기', 'leech@a1', '뒤로 튕기기', 'blink~flee', '집게로 붙잡고 버티기', 'U'],
    shrimp: ['꼬리 튕기기', 'blink', '딱총 집게', 'stun@a1~dice', '새우 떼 군무', 'U'],
    jellyfish: ['찌릿 촉수', 'zap@near', '둥실둥실', 'soar~inWater', '전기 폭풍', 'wx:storm+zap@rnd3'],
    starfish: ['반짝 별 변신', 'event:star', '팔 다시 자라기', 'cleanse+quick', '별이 되어', 'armor+soar'],
    seahorse: ['물방울 대포', 'gust@L', '꼬리 감기', 'cling@a1~chase', '해류 태워 주기', 'tow@tail3+cruise'],
    clownfish: ['말미잘 숨바꼭질', 'shield+dig', '작은 용기', 'burst~gap', '말미잘 요새', 'thorns+guard@near'],
    puffer: ['빵빵 부풀기', 'thorns~hurt', '물총 쏘기', 'slow@a1~wRain', '복어 폭탄 돌리기', 'U'],
    manta: ['수면 활공', 'glide~inWater', '날개 물보라', 'slow@lane', '하늘을 나는 가오리', 'soar+gust@behind'],
    walrus: ['쿵 엉덩방아', 'trip@near~inSnow', '엄니 찍기', 'stun@a1+shield', '북극의 숨결', 'wx:snow+freeze@a2'],
    narwhal: ['뿔 콕 찌르기', 'push@a1', '뿔 등대', 'guard@near', '외뿔 돌격', 'ramp+push@a2'],
    sealion: ['박수 응원', 'feed@near', '공 튕기기', 'stun@L~dice', '박수 갈채', 'event:crowd+aid@near'],
    manatee: ['느긋한 헤엄', 'firm~inWater', '해초 뜯기', 'charge+cleanse', '평화의 바다', 'pin@all+heal@all'],
    beluga: ['바다의 자장가', 'sleep@wide', '메아리 길잡이', 'guard@b1', '고래의 메아리', 'delay@all+cruise'],
    swordfish: ['쾌속 찌르기', 'burst~lead', '칼날 스치기', 'strip@a1+burst', '일섬', 'blink+stun@a2'],
    angler: ['초롱불 유혹', 'hook@a2', '어둠 속 돌진', 'burst~wFog', '초롱불 덫', 'wx:fog+back@a3'],
    seaturtle: ['해류 타기', 'cruise~inWater', '등딱지 방패', 'shield+firm', '끈기의 완주', 'cruise~late+cleanse'],
    snake: ['휘감기', 'pin@a1+burst', '독니 물기', 'curse@a1', '휘감기 포획', 'cling@L+drain@L'],
    cobra: ['후드 펼치기', 'seal@a2', '독 뿜기', 'curse@L', '코브라 최면', 'back@T3'],
    lizard: ['꼬리 떼고 줄행랑', 'cleanse+burst', '벽 타기', 'glide~inRock', '꼬리 자르기 대탈출', 'U'],
    chameleon: ['색깔 흉내', 'swap@rnd', '혀 총알', 'tax@a1~gap', '누가 나게?', 'swap@a3+shield'],
    iguana: ['일광욕 충전', 'charge~wSunny', '꼬리 채찍', 'trip@b1', '태양 에너지 충전', 'wx:sunny+ramp'],
    gecko: ['찰싹 발바닥', 'firm~inSlope', '꼬리 미끼', 'slow@b2', '천장 달리기', 'glide+armor'],
    komodo: ['끈적 침 공격', 'curse@a1+bog@a1', '묵직한 돌진', 'ramp', '맹독', 'curse@ahead'],
    tortoise: ['단단한 등딱지', 'counter~late', '백 년의 걸음', 'cruise~late', '등딱지 회전 돌진', 'roll+shield'],
    axolotl: ['말랑 재생', 'cleanse+ramp', '방긋 미소', 'back@a1~chase', '끝없는 재생', 'armor+cleanse'],
    salamander: ['미끌 점액', 'slick@back:ice', '불씨 뱉기', 'slick@front:fire', '불도마뱀의 불길', 'slick@mid:fire+burst'],
    toad: ['혓바닥 낚아채기', 'hook@a1+drain@a1', '개굴 합창', 'delay@all', '모 아니면 도', 'dice+blink'],
    eagle: ['급강하 낚아채기', 'tax@L', '하늘 높이', 'soar~wWind', '하늘의 제왕', 'tax@T3+soar'],
    falcon: ['쏜살 급강하', 'burst~early', '발톱 치기', 'stun@bird', '음속 급강하', 'blink~lead+stun@a1'],
    crow: ['반짝이 눈속임', 'drain@L', '까악까악 놀리기', 'delay@a1+burst', '까마귀 떼 습격', 'stun@rnd3+drain@rnd3'],
    swan: ['우아한 날갯짓', 'shield+soar', '날개 치기', 'gust@b1', '백조의 호수', 'terra:water+slide'],
    goose: ['꽥꽥 소동', 'delay@near~crowd', '부리 꼬집기', 'stun@a1~stack', 'V자 편대 비행', 'aid@kin+soar'],
    peacock: ['꼬리 부채 펼치기', 'sleep@even', '우아한 걸음', 'cruise~calm', '거울 깃털', 'mirror+strip@all'],
    toucan: ['큰 부리 콕', 'trip@a1~stack', '열매 던지기', 'drop@L~dice', '코코넛 낙하', 'drop@T3+burst'],
    pelican: ['부리 물벼락', 'slow@near', '물고기 간식', 'windup~wRain', '삼켰다 뱉기', 'tax@a2+stun@a2'],
    woodpecker: ['따다다닥 쪼기', 'pin@a1+delay@a1', '나무 구멍 숨기', 'dig~inForest', '구멍 뚫기 공사', 'mole@ahead'],
    pigeon: ['편지 배달', 'feed@last', '구구 떼 지어', 'cruise~kin', '비둘기 떼 날아오름', 'pin@ahead+soar'],
    seagull: ['간식 낚아채기', 'drain@a1+burst', '끼룩끼룩 급강하', 'trip@a1~wWind', '새우 과자 쟁탈전', 'drain@T3+strip@T3'],
    sparrow: ['짹짹 떼 지어 날기', 'soar~kin', '전깃줄 쉼터', 'bank~calm', '참새 떼 총공격', 'trip@all~kin'],
    hummingbird: ['초고속 날갯짓', 'pulse~stack', '꿀 한 모금', 'charge+quick', '벌새 광속 비행', 'blink~early+pulse'],
    kiwi: ['지렁이 간식', 'windup~inMud', '부리 콕콕', 'stun@a1~inForest', '땅속 급행', 'dig~gap'],
    turkey: ['깃털 부풀리기', 'thorns~crowd', '골골골 위협', 'back@a2~crowd', '추수감사절 대탈출', 'dice+armor'],
    crane: ['학다리 성큼', 'relay~inWater', '긴 부리 찌르기', 'push@a1~chase', '날갯바람', 'gust@all'],
    stork: ['행운 배달', 'aid@rnd', '높이 날기', 'soar~late', '꼴찌 특급 배달', 'tow@last+soar'],
    puffin: ['파도 타기', 'slide~wRain', '물고기 한입 가득', 'windup~gauge', '빙산 미끄럼', 'terra:snow+slide'],
    robin: ['아침 노래', 'heal@adj', '총총 걸음', 'pulse~early', '새봄의 응원', 'aid@tail3+heal@tail3'],
    canary: ['고운 노래 자장가', 'sleep@a2', '노란 섬광', 'stun@a1~wSunny', '초고음 샤우팅', 'zap@wide'],
    cockatoo: ['흉내 내기', 'echo+burst', '볏 세우기', 'thorns~fresh', '앵무새 필살 흉내', 'echo+counter'],
    vulture: ['기다렸다 덮치기', 'burst~late', '빙빙 맴돌기', 'reel@L~late', '때를 기다린 자', 'blink~late'],
    dodo: ['될 대로 돼라', 'burst~dice', '뒤뚱뒤뚱 돌진', 'ramp~dice', '운명의 룰렛', 'U'],
    trex: ['쩌렁쩌렁 대포효', 'back@wide', '먹잇감 물기', 'stun@a1+tax@a1', '운석 소환', 'U'],
    triceratops: ['세 뿔 돌진', 'ramp+push@a1', '프릴 방패', 'mirror+firm', '세 뿔 관통', 'push@a3+armor'],
    stego: ['꼬리 가시 휘두르기', 'trip@behind~flee', '등판 햇볕 쬐기', 'charge~wHeat', '가시 꼬리 회오리', 'event:twister+thorns'],
    brachio: ['쿵쿵 발 구르기', 'trip@wide', '높은 잎 뜯기', 'windup+shield', '거대 공룡의 행차', 'roll+trip@near'],
    raptor: ['발톱 걸기', 'trip@a1~chase', '무리 신호', 'feed@kin', '협공', 'stun@adj+burst'],
    ptero: ['하늘 활공', 'soar~inSlope', '익룡 발톱', 'tax@L~gap', '익룡 납치 비행', 'cling@L+soar'],
    ankylo: ['꼬리 곤봉', 'stun@b1+push@b1', '철갑 웅크리기', 'thorns+firm', '곤봉 지진', 'trip@wide+thorns'],
    parasaur: ['뿔나팔 불기', 'feed@all', '두 발로 뛰기', 'relay~early', '집합 나팔', 'tax@ahead'],
    spino: ['물살 가르기', 'ramp~inWater', '돛 펼치기', 'gust@behind~wWind', '강의 지배자', 'terra:water+ramp'],
    diplodocus: ['긴 꼬리 채찍', 'push@behind', '긴 목 뻗기', 'blink~chase', '채찍 꼬리', 'push@wide+stun@adj'],
    pachy: ['돌머리 박치기', 'stun@a1+push@a1', '머리 방패', 'counter~chase', '돌머리 대충돌', 'push@a2+stun@adj'],
    dilopho: ['독 침 뱉기', 'curse@a2', '볏 펼치기', 'back@adj', '독 안개 분사', 'wx:fog+curse@wide'],
    compy: ['우르르 몰려가기', 'burst~crowd', '쏜살같이', 'burst~alone', '개미 떼 작전', 'demote@ahead'],
    plesio: ['물속 질주', 'burst~inWater', '긴 목 물기', 'hook@L', '호수의 괴물', 'terra:water+back@near'],
    mammoth: ['눈보라 콧김', 'gust@a2~wSnow', '엄니 밀어붙이기', 'push@a1~inSnow', '빙하기의 재림', 'wx:snow+event:avalanche'],
    sabertooth: ['송곳니 덮치기', 'trip@a1+tax@a1', '으르렁', 'delay@a2', '송곳니 연쇄 사냥', 'trip@a3+blink'],
    dimetrodon: ['돛 충전', 'windup~wSunny', '돛 그늘', 'guard@lane', '태양열 폭주', 'wx:heat+over'],
    archaeo: ['서툰 첫 비행', 'soar~dice', '깃털 흩날리기', 'slow@behind~wWind', '추락 또는 비상', 'dice+soar'],
    capybara: ['다 같이 친구', 'aid@adj', '온천욕', 'cleanse+windup', '모두 온천 속으로', 'heal@all+sleep@T3'],
    fennec: ['큰 귀 레이더', 'shield~alone', '모래 파기', 'dig~inSand', '모래시계 뒤집기', 'terra:sand+swap@L'],
    meerkat: ['보초 서기', 'guard@kin', '망보기 신호', 'feed@adj', '굴 네트워크', 'dig+tow@tail3'],
    badger: ['땅굴 파기', 'dig~inMud', '사납게 덤비기', 'stun@a1~hurt', '겁 없는 돌격', 'counter+ramp'],
    ferret: ['쏙쏙 빠져나가기', 'cleanse+blink', '장난 깨물기', 'zap@a1', '족제비 댄스', 'demote@T3+pulse'],
    chipmunk: ['볼주머니 간식', 'bank~gauge', '도토리 던지기', 'drop@a1', '도토리 창고 대방출', 'drop@ahead'],
    leopard: ['나무 위 덮치기', 'stun@a1+hop', '얼룩 위장', 'shield~inRock', '나무 위 기습', 'blink+trip@a1'],
    panther: ['그림자 숨기', 'dig~wFog', '어둠의 발톱', 'stun@a1~alone', '칠흑의 밤', 'pin@all+burst'],
    hyena: ['낄낄 가로채기', 'strip@fast+burst', '끈질긴 추격', 'reel@a1~late', '비웃음의 저주', 'U'],
    lynx: ['날쌘 앞발', 'stun@a1~inSnow', '눈밭 질주', 'burst~inSnow', '눈 속의 사냥꾼', 'wx:snow+reel@L'],
    bison: ['대평원 돌진', 'ramp~inTrack', '콧김 뿜기', 'gust@a1', '버펄로 대이동', 'roll+aid@kin'],
    moose: ['큰 뿔 반사', 'mirror~calm', '늪 건너기', 'glide~inMud', '숲의 왕 돌진', 'terra:forest+ramp'],
    reindeer: ['썰매 끄는 비행', 'soar~wSnow', '방울 소리', 'aid@b2', '썰매 대작전', 'tow@tail3+soar'],
    llama: ['퉤퉤 침 세례', 'bog@a2', '복슬 방패', 'shield+cruise', '라마 드라마', 'demote@mid+dice'],
    donkey: ['고집 뒷발차기', 'stun@b1~hurt', '히이잉 버티기', 'firm~hurt', '고집불통 버티기', 'wall+firm'],
    boar: ['저돌 맹진', 'ramp~chase', '엄니 들이받기', 'push@a1~inForest', '연쇄 충돌', 'roll+stun@a3'],
    anteater: ['긴 혀 낼름', 'hook@a1~inForest', '개미 간식', 'windup~inSand', '긴 혀로 꽁꽁', 'pin@a2+hook@a2'],
    armadillo: ['공처럼 말기', 'roll~inSand', '땅 파기', 'dig~inRock', '아르마딜로 볼링', 'roll+trip@ahead'],
    pangolin: ['비늘 갑옷', 'thorns~inRock', '비늘 공 굴리기', 'roll~inRock', '철갑 비늘 폭풍', 'thorns+trip@near'],
    platypus: ['독 발톱', 'curse@a1~inWater', '전기 탐지', 'counter~inWater', '전기 감각', 'zap@T3'],
    wombat: ['네모 블록 쌓기', 'wall', '엉덩이 방패', 'counter+push@b1', '네모 지뢰밭', 'peel@T3+wall'],
    quokka: ['행복 미소', 'sleep@a1~chase', '폴짝 뛰기', 'hop~calm', '행복 바이러스', 'back@all'],
    lemur: ['나무 타기 점프', 'relay~inForest', '꼬리 흔들기', 'delay@b1', '어부바 점프', 'U'],
    orangutan: ['긴 팔 쭉 뻗기', 'hook@a2~inForest', '나뭇잎 우산', 'shield~wRain', '밀림의 그네', 'terra:forest+pulse'],
    chimp: ['돌멩이 던지기', 'drop@a1~dice', '흰개미 낚시', 'windup~dice', '도구의 달인', 'drop@rnd3+peel@rnd3'],
    jaguar: ['물가의 매복', 'trip@a1~inWater', '강한 턱', 'pin@a1~chase', '밀림의 그림자', 'terra:forest+blink'],
    snowleopard: ['절벽 도약', 'hop~inRock', '긴 꼬리 균형', 'firm~inSnow', '설산의 유령', 'wx:snow+dig'],
    gazelle: ['통통 뜀뛰기', 'pulse~flee', '지그재그 회피', 'counter~flee', '초원의 질주', 'terra:track+over'],
    gnu: ['무리 대이동', 'aid@mam', '강 건너기', 'armor~inWater', '끝없는 행렬', 'aid@all+cruise'],
    buffalo: ['물웅덩이 목욕', 'terra:water', '뿔 걸어 넘기기', 'demote@a1', '진흙 폭풍', 'slick@front:mud+ramp'],
    yak: ['털북숭이 방한', 'firm~wSnow', '고산 등반', 'ramp~inSlope', '설산 눈사태', 'event:avalanche+armor'],
    tapir: ['꿈 먹기', 'strip@near', '코 스노클', 'dig~inWater', '악몽 삼키기', 'sleep@T3+drain@T3'],
    okapi: ['긴 혀 세수', 'cleanse+hop', '숲속 숨바꼭질', 'counter~inForest', '줄무늬 다리 착시', 'seal@ahead+burst'],
    mole: ['두더지 굴', 'mole@a2', '흙더미 밀어 올리기', 'hurdle@front', '두더지 대소동', 'event:moles+dig'],
    prairiedog: ['경계 휘파람', 'guard@all', '굴속 대피', 'dig~hurt', '땅굴 도시', 'terra:sand+mole@ahead'],
    flyingsquirrel: ['활강 비막', 'soar~inForest', '나무에서 나무로', 'blink~stack', '달밤의 활공', 'soar~gap+strip@ahead'],
    tasdevil: ['회오리 스핀', 'event:twister', '사나운 울음', 'back@b1', '데빌 토네이도', 'gust@wide+roll'],
    echidna: ['가시 말기', 'thorns~flee', '개미굴 탐사', 'charge~inSand', '가시 지뢰', 'peel@behind+thorns'],
    mandrill: ['알록달록 얼굴', 'stun@lane', '송곳니 하품', 'back@a1~fresh', '밀림의 왕 납시오', 'back@ahead+cruise'],
    magpie: ['반가운 소식', 'feed@rnd3', '반짝이 수집', 'drain@rich', '오작교', 'swap@L+tow@last'],
    swallow: ['물 찬 제비', 'burst~wRain', '박씨 물어다 주기', 'feed@b1', '강남 가는 길', 'wx:sunny+soar'],
    kingfisher: ['물총 다이빙', 'blink~inWater', '정조준', 'stun@fast', '쪽빛 섬광', 'blink+zap@a1'],
    albatross: ['바람 타기', 'glide~wWind', '쉬지 않는 날개', 'cruise~alone', '폭풍 속 활공', 'wx:storm+glide'],
    emu: ['쿵쿵 발차기', 'push@adj', '끈질긴 달리기', 'cruise~stack', '에뮤 대전쟁', 'push@ahead'],
    cassowary: ['단검 발톱', 'stun@a1+curse@a1', '투구 박치기', 'push@a1~lead', '숲의 무법자', 'stun@near+armor'],
    roadrunner: ['삑삑 질주', 'over~inSand', '모래 먼지', 'pin@behind', '사막의 총알', 'blink~inSand+over'],
    heron: ['외다리 기다림', 'bank~late', '번개 부리', 'stun@a1~calm', '물안개 사냥', 'wx:fog+stun@a2'],
    pheasant: ['꿩 대신 닭', 'demote@rnd', '푸드덕 날아오르기', 'hop~hurt', '장끼의 깃', 'mirror+soar'],
    mandarin: ['원앙 한 쌍', 'aid@a1', '물 위 산책', 'firm~wRain', '금슬 좋은 짝', 'cling@a1+aid@a1'],
    shoebill: ['부동의 눈빛', 'freeze@a1~chase', '부리 딱딱', 'delay@a1', '석상의 저주', 'freeze@T3+curse@T3'],
    secretary: ['뱀 밟기', 'stun@rep', '긴 다리 스텝', 'relay~chase', '초원의 사냥꾼', 'stun@a3~hits+burst'],
    rattlesnake: ['방울 경고', 'delay@behind', '독니 한 방', 'curse@a1~chase', '사막의 방울 소리', 'back@wide+curse@wide'],
    anaconda: ['조이기', 'pin@a1+leech@a1', '강물 매복', 'tax@a1~inWater', '거대한 똬리', 'wall+pin@behind'],
    frilled: ['목도리 활짝', 'back@a1+burst', '두 발 줄행랑', 'over~flee', '깜짝 대소동', 'back@near+seal@near'],
    basilisk: ['물 위 달리기', 'over~inWater', '볏 세우고 질주', 'fade~flee', '기적의 물 위 질주', 'terra:water+over'],
    dartfrog: ['경고색', 'thorns~chase', '독 피부', 'counter+curse@foe', '맹독 화살', 'curse@T3+seal@T3'],
    softshell: ['모래 속 잠복', 'dig~alone', '덥석 물고 안 놓기', 'cling@a1+pin@a1', '용궁 가는 길', 'terra:water+tow@tail3'],
    whaleshark: ['큰 입 흡입', 'tax@near', '느긋한 유영', 'cruise~lead', '플랑크톤 대이동', 'feed@all+tax@ahead'],
    hammerhead: ['망치 머리 박치기', 'stun@a1~inWater', '전기 감지', 'reel@rich', '망치 머리 강타', 'stun@T3+tax@T3'],
    sunfish: ['일광욕 둥둥', 'bank~wSunny', '깜짝 놀라 기절', 'dice~hurt', '개복치 대점프', 'dice+hop'],
    flyingfish: ['수면 박차기', 'hop~flee', '날개 지느러미', 'soar~chase', '무지개 비행', 'event:rainbow+soar'],
    moray: ['바위틈 매복', 'trip@a1~inRock', '두 번째 턱', 'hook@a1+stun@a1', '심해의 덫', 'wall+trip@behind'],
    seaotter: ['조개 깨기', 'windup~inRock', '손잡고 둥둥', 'aid@lane', '다시마 침대', 'heal@near+sleep@a3'],
    hermit: ['집 속으로 쏙', 'shield~flee', '집 갈아타기', 'swap@a2', '소라 껍데기 요새', 'thorns+wall'],
    cuttlefish: ['색깔 최면', 'back@a2~chase', '먹물 분신', 'counter+slick@back:ink', '오색 최면 쇼', 'back@T3+seal@T3'],
    eel: ['찌릿 방전', 'zap@adj', '전기 충전', 'charge~wStorm', '백만 볼트', 'zap@all'],
    salmon: ['거슬러 오르기', 'burst~inSlope', '폭포 뛰어넘기', 'hop~gap', '고향 가는 길', 'ramp~late+firm'],
    allosaurus: ['도끼 턱', 'stun@a1+pin@a1', '사냥 질주', 'fade~chase', '쥐라기의 포식자', 'trip@a2+reel@L'],
    carno: ['뿔 달린 돌진', 'ramp~lead', '작은 팔 허우적', 'burst~hurt', '황소 공룡 돌격', 'over+trip@a2'],
    therizino: ['긴 발톱 휘두르기', 'push@lane', '나뭇잎 긁어모으기', 'windup~hurt', '거대 낫 발톱', 'strip@all+push@near'],
    iguanodon: ['엄지 가시 콕', 'curse@a1+burst', '네 발 두 발 전환', 'relay~stack', '엄지 척 반격', 'counter+push@foe'],
    gallimimus: ['타조 공룡 달리기', 'cruise~chase', '무리 흩어지기', 'gust@lane', '백악기 단거리 왕', 'over~early+blink'],
    mosasaurus: ['심해 급습', 'tax@a2~inWater', '거대한 꼬리', 'gust@behind', '바다의 폭군', 'event:bigwave+tax@L'],
    quetzal: ['거대 날개 그늘', 'pin@near', '상승 기류', 'soar~wHeat', '하늘의 지배자', 'soar+pin@all'],
    glyptodon: ['돔 껍질', 'armor~flee', '곤봉 꼬리', 'push@b1~flee', '움직이는 요새', 'armor+wall'],
    // 곤충 50종
    ant: ['줄지어 행진', 'aid@bug', '영차영차 들어 옮기기', 'tax@heavy', '개미 군단', 'swarm@T3+cruise'],
    fireant: ['따끔 깨물기', 'sting@a1', '불개미 뗏목', 'glide~wRain', '불개미 떼 습격', 'sting@near+swarm@L'],
    leafcutter: ['잎사귀 우산', 'shield~wHeat', '싹둑싹둑', 'strip@a2', '버섯 농장', 'terra:forest+aid@bug'],
    bulletant: ['총알 독침', 'sting@a1+burst', '끈질긴 턱', 'cling@a1~hurt', '세상에서 가장 아픈 침', 'stun@L+sting@L'],
    termite: ['갉아먹기', 'pin@a2', '흙기둥 쌓기', 'wall~late', '흰개미 탑', 'wall@front+cocoon'],
    honeybee: ['8자 춤', 'feed@bug', '꽃꿀 모으기', 'charge~inForest', '여왕벌을 지켜라', 'swarm@a3+guard@kin'],
    bumblebee: ['붕붕 박치기', 'push@a1~fresh', '꽃가루 범벅', 'slow@lane~inForest', '뚱보 비행', 'soar+push@ahead'],
    wasp: ['날카로운 침', 'sting@a2', '윙윙 위협', 'back@a1~lead', '말벌집 건드리기', 'event:bees+soar'],
    hornet: ['독침 연타', 'sting@a1~stack', '큰턱 물기', 'stun@a1~gap', '장수말벌 습격', 'sting@T3+stun@T3'],
    housefly: ['윙윙 성가시게', 'itch@a1', '손 비비기', 'cleanse~calm', '파리채 피하기', 'counter+blink~hurt'],
    mosquito: ['앵앵 물기', 'itch@a1+drain@a1', '피 한 모금', 'leech@a1~chase', '모기 떼의 밤', 'itch@all'],
    fruitfly: ['과일 향기 따라', 'reel@a1~inForest', '눈앞에서 알짱', 'seal@a1~chase', '초파리 대번식', 'swarm@rnd3'],
    horsefly: ['따가운 한 방', 'stun@a1+sting@a1', '윙윙 따라붙기', 'reel@fast~chase', '소 떼를 쫓아', 'sting@heavy+burst'],
    hoverfly: ['공중 정지', 'bank~alone', '벌인 척하기', 'mirror~chase', '제자리 비행 묘기', 'glide+counter'],
    swallowtail: ['팔랑팔랑', 'soar~calm', '날개 가루', 'slow@behind~calm', '나비 효과', 'wx:wind+gust@ahead'],
    monarch: ['먼 길 이동', 'cruise~early', '독 날개 경고', 'thorns~calm', '대이동', 'aid@bug+glide'],
    morpho: ['푸른 섬광', 'stun@lane~wSunny', '반짝 숨기', 'shield~wSunny', '눈부신 날갯짓', 'stun@near+soar'],
    moth: ['불빛 따라', 'reel@L~wFog', '날개 가루 뿌리기', 'pin@behind~wFog', '달빛 군무', 'wx:fog+sleep@a3'],
    hawkmoth: ['벌새인 척', 'pulse~calm', '긴 주둥이 꿀 빨기', 'charge~calm', '초고속 호버링', 'relay+glide'],
    caterpillar: ['꿈틀꿈틀', 'ramp~rank', '실 뽑기', 'pin@b1', '번데기에서 나비로', 'cocoon'],
    dragonfly: ['공중 급선회', 'counter~lead', '모기 사냥', 'stun@bug', '고추잠자리 편대', 'soar~lead+stun@a2'],
    mayfly: ['하루뿐인 삶', 'over~fresh', '물 위 춤', 'soar~wRain', '오늘만 산다', 'over~late'],
    grasshopper: ['폴짝 뛰어넘기', 'vault@a1', '뒷다리 차기', 'push@b1~chase', '대도약', 'vault@a3'],
    locust: ['메뚜기 떼', 'swarm@a1', '풀밭 갉아먹기', 'terra:track', '하늘을 덮는 떼', 'swarm@ahead'],
    cricket: ['귀뚤귀뚤 자장가', 'sleep@b1', '가을밤 연주', 'feed@near~calm', '귀뚜라미 합창', 'sleep@behind+aid@bug'],
    katydid: ['잎사귀 위장', 'counter~calm', '쓰르르 울음', 'delay@lane', '풀숲의 연주자', 'terra:forest+delay@all'],
    molecricket: ['앞발 굴착기', 'dig~rank', '땅굴 함정', 'mole@b1', '지하 터널', 'dig+vault@a2'],
    flea: ['높이뛰기 챔피언', 'hop~stack', '올라타기', 'cling@a1~gap', '벼룩의 간', 'vault@L'],
    mantis: ['낫 휘두르기', 'trip@a1+pin@a1', '기도하는 척', 'bank~chase', '당랑권', 'stun@a2+vault@a2'],
    stickbug: ['나뭇가지인 척', 'armor~calm', '흔들흔들', 'counter~wWind', '숲과 하나 되기', 'terra:forest+armor'],
    ladybug: ['진딧물 사냥', 'stun@bug+burst', '벌렁 드러눕기', 'shield~hurt', '행운의 일곱 점', 'dice+shield'],
    rhinobeetle: ['뿔 들어 올리기', 'demote@a1+burst', '수액 한 잔', 'windup~stack', '뿔 뒤집기 한판', 'demote@a3+armor'],
    stagbeetle: ['집게 조이기', 'stun@a1+leech@a1', '집게로 던지기', 'gust@a1~chase', '큰턱 대결', 'hook@L+stun@L'],
    dungbeetle: ['쇠똥 굴리기', 'roll~stack', '은하수 길잡이', 'glide~late', '거대 쇠똥', 'roll+trip@a3'],
    firefly: ['깜빡깜빡 신호', 'feed@near~wFog', '눈부신 불빛', 'seal@behind', '반딧불이의 밤', 'wx:fog+guard@all'],
    longhorn: ['긴 더듬이 탐지', 'counter~alone', '나무 갉기', 'hurdle@mid', '더듬이 채찍', 'trip@a3+push@a3'],
    weevil: ['주둥이 드릴', 'pin@a1~inForest', '죽은 척 떨어지기', 'dig~flee', '곡식 창고 습격', 'drain@ahead+cruise'],
    tigerbeetle: ['길 안내 질주', 'fade~lead', '너무 빨라 안 보여', 'blink~lead', '곤충계 최고 속도', 'over+fade'],
    bombardier: ['뜨거운 방귀 폭탄', 'push@b1+blink', '부글부글 충전', 'charge~hurt', '연쇄 폭발', 'push@behind+stun@near'],
    jewelbeetle: ['무지갯빛 반사', 'mirror~wSunny', '반짝 눈속임', 'swap@a1~wSunny', '비단 갑옷', 'mirror+armor'],
    divingbeetle: ['공기 방울 잠수', 'armor~wRain', '노 젓기', 'relay~wRain', '물속 추격', 'terra:water+reel@L'],
    strider: ['물 위 미끄럼', 'wheel~inWater', '물결 신호', 'delay@near~inWater', '수면 스케이팅', 'terra:water+wheel'],
    waterbug: ['앞다리 낚아채기', 'hook@a1~inWater', '물속 매복', 'trip@a1~wRain', '연못의 폭군', 'terra:water+tax@T3'],
    cicada: ['맴맴 고함', 'delay@wide', '땅속 7년', 'bank~stack', '한여름 대합창', 'wx:heat+seal@all'],
    stinkbug: ['고약한 냄새', 'aura', '방패 등딱지', 'shield~chase', '노린내 폭탄', 'aura+back@near'],
    cockroach: ['사사삭 도망', 'burst~flee', '끈질긴 생명력', 'cleanse~hurt', '불사신', 'cleanse+armor+quick'],
    earwig: ['꼬리 집게', 'pin@b1+push@b1', '틈새 숨기', 'dig~chase', '집게 덫', 'wall+pin@near'],
    antlion: ['모래 함정', 'terra:sand', '모래 튀기기', 'slow@a1~inSand', '개미지옥', 'terra:sand+tax@ahead'],
    froghopper: ['거품 집', 'guard@b1~calm', '초강력 점프', 'hop~rank', '거품 대폭발', 'slick@mid:lake+vault@a2'],
    aphid: ['단물 나눠 주기', 'feed@adj~calm', '개미 경호원 부르기', 'guard@bug', '폭풍 번식', 'swarm@all']
  };
  function parseAb(str) {
    return str.split('+').map(function (p) {
      var m = /^([a-zA-Z]+)(?:@([a-zA-Z0-9]+))?(?:~([a-zA-Z]+))?(?::([a-zA-Z]+))?$/.exec(p);
      if (!m) throw new Error('능력식 오류: ' + str);
      return { op: m[1], tg: m[2] || null, tw: m[3] || null, arg: m[4] || null };
    });
  }
  // 식의 '뼈대' : 순서만 다른 식은 같은 것으로 본다 (겹치는지 확인할 때 씀)
  function abKey(str) { return str.split('+').sort().join('+'); }

  // ── 도감에 적는 설명은 식에서 자동으로 만든다 (그래서 설명과 실제 동작이 어긋나지 않는다) ──
  var TG_TXT = {
    a1: '바로 앞 동물', a2: '앞의 두 마리', a3: '앞의 세 마리', L: '1등', T3: '선두 세 마리', b1: '바로 뒤 동물', b2: '뒤의 두 마리',
    near: '가까이 있는 동물들', wide: '주변 넓은 범위의 동물들', lane: '양옆 레인의 동물', adj: '바로 앞뒤 동물', last: '꼴찌', tail3: '뒤쪽 세 마리',
    rnd: '아무나 한 마리', rnd3: '아무나 세 마리', ahead: '앞선 동물 모두', behind: '뒤따르는 동물 모두', all: '다른 동물 모두',
    fast: '지금 가장 빠른 동물', rich: '필살기 게이지가 가장 많이 찬 동물', foe: '나를 방해한 동물', boosted: '지금 빨라진 동물들',
    bird: '새들', bug: '곤충들', mam: '포유류들', rep: '파충류 · 양서류들', sea: '바다 동물들', dino: '공룡들', kin: '나와 같은 분류의 동물들', alien: '나와 다른 분류의 동물들',
    heavy: '덩치 큰 동물들', lightw: '몸이 가벼운 동물들', odd: '홀수 레인의 동물들', even: '짝수 레인의 동물들', mid: '중간 순위 동물들'
  };
  var PLACE_TXT = { back: '내 바로 뒤', front: '선두 바로 앞', mid: '무리 한가운데' };
  var SLICK_TXT = { mud: '진흙탕을 만들어요. 진흙을 좋아하는 동물은 오히려 빨라져요', ice: '빙판을 만들어요. 얼음을 좋아하는 동물은 오히려 빨라져요',
    lake: '물웅덩이를 만들어요. 물을 좋아하는 동물은 오히려 빨라져요', fire: '불길을 놓아요. 밟으면 펄쩍 뛰고 한동안 느려져요', ink: '먹물을 뿌려요. 지나가는 동물은 앞이 캄캄해 느려져요' };
  var EVENT_TXT = { bees: '벌 떼를 불러요', moles: '두더지들을 불러내요', crowd: '관중의 응원을 끌어내요', ufo: 'UFO 를 불러요', hurdles: '트랙에 허들을 세워요', star: '별똥별을 불러요',
    rainbow: '무지개를 띄워 뒤처진 동물들을 도와요', twister: '회오리바람을 일으켜 두 동물의 자리를 바꿔요', rockfall: '낙석을 일으켜요', bigwave: '큰 파도를 불러요', avalanche: '눈사태를 일으켜 뒤쪽 동물들을 밀어 올려요' };
  var OP_TXT = {
    burst: '짧고 굵게 확 치고 나가요', cruise: '오랫동안 꾸준히 빨라져요', ramp: '달릴수록 점점 빨라져요', fade: '로켓처럼 튀어 나간 뒤 서서히 원래 속도로 돌아와요',
    pulse: '세 번 연달아 톡톡 튀어 나가요', windup: '잠깐 멈춰 힘을 모았다가 폭발적으로 달려요', over: '엄청난 속도로 달리지만 끝나면 잠깐 지쳐요',
    hop: '높이 뛰어올라 바닥의 방해를 넘으며 나아가요', soar: '낮게 날아 바닥의 방해를 피하며 오래 나아가요',
    slide: '미끄러지듯 나아가요. 젖은 날이나 물길 · 눈밭 · 진흙탕에서는 훨씬 오래 미끄러져요', armor: '어떤 방해도 통하지 않는 상태로 달려요',
    roll: '데굴데굴 굴러가며 스치는 동물을 휘청이게 해요', firm: '느려지는 방해가 안 통하고 꾸준히 빨라요', blink: '눈 깜짝할 새 앞쪽으로 자리를 옮겨요',
    relay: '두 번에 나눠 힘차게 달려요', glide: '한동안 지형과 날씨의 불이익을 받지 않고 달려요', dig: '땅속으로 숨어 방해를 피하고, 조금 앞에서 튀어나와요',
    wheel: '바퀴처럼 굴러 바닥의 방해를 무시하고 달려요', shield: '다음 방해를 한 번 막아 주는 방패를 둘러요', mirror: '다음 방해를 건 동물에게 그대로 되돌려 줘요',
    thorns: '잠깐 무적이 되고, 그동안 건드린 동물은 따끔해서 멈춰요', cleanse: '걸려 있던 방해를 모두 털어 내고 힘을 내요', charge: '필살기 게이지를 채워요',
    quick: '다음 스킬을 훨씬 빨리 쓸 수 있게 돼요', bank: '살짝 물러났다가 잠시 뒤 훨씬 멀리 튀어 나가요', dice: '주사위를 굴려요. 대박일 수도 꽝일 수도 있어요',
    echo: '방금 다른 동물이 쓴 스킬을 그대로 따라 해요', counter: '다음 방해를 막고, 막아 내면 그 힘으로 치고 나가요',
    cocoon: '고치 속에 들어가 잠깐 쉬어요. 그동안은 어떤 방해도 안 통하고, 나오면서 폭발적으로 달려요',
    vault: '{을} 훌쩍 뛰어넘어 바로 앞에 내려앉아요. 너무 멀면 닿는 데까지만 뛰어요',
    aura: '한동안 고약한 구름을 두르고 달려요. 가까이 있는 동물은 계속 느려져요',
    sting: '{에게} 독침을 놓아요. 독이 퍼질수록 점점 더 느려져요', swarm: '{에게} 벌레 떼를 붙여 느리게 해요. 떼는 끝날 때 가까운 동물에게 한 번 옮겨 붙어요',
    itch: '{을} 가렵게 해서 세 번 멈칫하게 해요',
    stun: '{을} 잠깐 멈춰 세워요', trip: '{의} 발을 걸어 넘어뜨려요. 공중에 떠 있으면 안 걸려요', zap: '{을} 찌릿하게 해서 멈추고 스킬도 잠깐 못 쓰게 해요',
    slow: '{을} 한동안 느리게 해요', bog: '{을} 느리게 해요. 덩치가 클수록 오래가요', gust: '{을} 뒤로 날려 보내요. 가벼울수록 멀리 날아가요', push: '{을} 뒤로 밀어내요',
    sleep: '{을} 재워요. 누가 추월하면 깨어나요', back: '{이} 잠깐 뒷걸음질 치게 해요', freeze: '{을} 얼려요. 눈 오는 날이나 눈밭에서는 더 오래 얼어요',
    seal: '{이} 한동안 스킬과 필살기를 못 쓰게 해요', drain: '{의} 필살기 게이지를 빼앗아 와요', delay: '{의} 다음 스킬을 늦춰요', curse: '{에게} 시한폭탄을 붙여요. 잠시 뒤 멈춰 서요',
    tax: '{이} 나보다 앞서 있는 거리를 뚝 깎아요', swap: '{과} 자리를 바꿔요. 너무 멀리 있으면 닿는 범위에서 가장 앞선 동물과 바꿔요', demote: '{을} 그 바로 뒤 동물과 자리를 바꿔 한 칸씩 내려요', hook: '{을} 끌어당기고 그 힘으로 나는 앞으로 나가요',
    leech: '{의} 속도를 빼앗아 내 속도로 만들어요', strip: '{의} 가속과 방패를 벗겨 내요', cling: '{의} 등에 매달려 같은 속도로 따라가요', reel: '{에게} 줄을 걸어 끌려가듯 따라붙어요',
    pin: '{이} 한동안 가속하지 못하게 해요', aid: '{과} 함께 빨라져요', guard: '{과} 나에게 방패를 둘러 줘요', feed: '{의} 필살기 게이지를 채워 주고 나도 조금 채워요',
    tow: '{을} 앞으로 끌어 주고 나도 힘을 내요', heal: '{과} 나에게 걸린 방해를 풀고 함께 조금 빨라져요',
    peel: '{의} 앞길에 미끄러운 함정을 놓아요', mole: '{의} 앞길에 두더지 구멍을 내요. 덩치 큰 동물은 그냥 밟고 지나가요',
    hurdle: '통나무 허들을 놓아요', wall: '벽을 세워 뒤따르는 동물을 잠깐 막아요', drop: '{의} 머리 위로 무언가를 떨어뜨려요. 조금 뒤에 떨어지니 그사이 벗어나면 안 맞아요'
  };
  var TW_TXT = {
    rank: '순위가 낮을수록 효과가 커요', lead: '순위가 높을수록 효과가 커요', late: '결승선에 가까울수록 효과가 커요', early: '초반일수록 효과가 커요',
    gap: '선두와 멀리 떨어질수록 효과가 커요', crowd: '주변에 동물이 많을수록 효과가 커요', alone: '주변에 아무도 없으면 효과가 커요', stack: '쓸 때마다 점점 강해져요',
    fresh: '처음 쓸 때가 가장 강해요', hurt: '방금 방해를 당했다면 효과가 커요', calm: '한동안 방해받지 않았다면 효과가 커요', gauge: '필살기 게이지가 많이 찼을수록 효과가 커요',
    dice: '효과의 크기가 그때그때 달라요', chase: '바로 앞에 따라잡을 동물이 있으면 효과가 커요', flee: '바로 뒤에 쫓아오는 동물이 있으면 효과가 커요',
    kin: '같은 분류의 동물이 함께 뛸수록 효과가 커요', hits: '맞힌 동물이 많을수록 효과가 커요'
  };
  var TERR_KO = { water: '물길', sand: '모래밭', snow: '눈밭', mud: '진흙탕', rock: '바윗길', slope: '내리막', forest: '숲길', track: '흙길' };
  var WX_KO = { sunny: '맑은 날', rain: '비 오는 날', snow: '눈 오는 날', wind: '바람 부는 날', heat: '무더운 날', fog: '안개 낀 날', storm: '천둥번개 치는 날' };
  var WX_TO = { sunny: '맑음', rain: '비', snow: '눈', wind: '바람', heat: '무더위', fog: '안개', storm: '천둥번개' };
  function twText(tw) {
    if (TW_TXT[tw]) return TW_TXT[tw];
    var k = tw.slice(2).toLowerCase();
    if (tw.slice(0, 2) === 'in') return TERR_KO[k] + '에서 쓰면 효과가 훨씬 커요';
    return WX_KO[tw.slice(1).toLowerCase()] + '에는 효과가 훨씬 커요';
  }
  function tgFill(tpl, tg) {
    var t = TG_TXT[tg || 'a1'];
    return tpl.replace('{을}', josa(t, '을', '를')).replace('{이}', josa(t, '이', '가')).replace('{과}', josa(t, '과', '와')).replace('{의}', t + '의').replace('{에게}', t + '에게');
  }
  function partText(e) {
    var s;
    if (e.op === 'slick') s = PLACE_TXT[e.tg || 'back'] + '에 ' + SLICK_TXT[e.arg || 'ice'];
    else if (e.op === 'hurdle' || e.op === 'wall') s = PLACE_TXT[e.tg || 'back'] + '에 ' + OP_TXT[e.op];
    else if (e.op === 'wx') s = '날씨를 ' + josa(WX_TO[e.arg], '으로', '로') + ' 바꿔요';
    else if (e.op === 'terra') s = '지금 달리는 구간을 ' + josa(TERR_KO[e.arg], '으로', '로') + ' 바꿔요';
    else if (e.op === 'event') s = EVENT_TXT[e.arg];
    else s = tgFill(OP_TXT[e.op], e.tg);
    return s + '.' + (e.tw ? ' ' + twText(e.tw) + '.' : '');
  }
  function abDesc(parts) {
    return parts.map(function (e, i) { return (i ? '그리고 ' : '') + partText(e); }).join(' ');
  }

  // ───────────── 지형 ─────────────
  var TERRAINS = {
    track: { name: '흙길', desc: '평범한 길이에요.' },
    water: { name: '물길', desc: '물을 좋아하는 동물은 빨라지고, 나머지는 첨벙첨벙 느려져요.' },
    sand: { name: '모래밭', desc: '더위에 강한 동물이 잘 달려요. 무거운 동물은 발이 빠져요.' },
    snow: { name: '눈밭', desc: '추위에 강한 동물이 잘 달려요.' },
    mud: { name: '진흙탕', desc: '진흙을 좋아하는 동물만 신나요.' },
    rock: { name: '바윗길 오르막', desc: '날쌘 동물이 유리하고 무거운 동물은 힘들어요.' },
    slope: { name: '내리막', desc: '모두 빨라져요. 무거울수록 더 빨리 내려가요.' },
    forest: { name: '숲길', desc: '작고 날쌘 동물이 유리해요.' }
  };
  function terrainMul(a, type) {
    var t = a.tr, w = a.wx || {}, heavy = a.light <= 0.15;
    switch (type) {
      case 'water': return t.water || a.cat === 'sea' ? 1.15 : (a.cat === 'bird' || a.cat === 'bug' ? 0.96 : 0.88);
      case 'sand': return (w.heat || 0) > 0.02 ? 1.09 : (heavy ? 0.9 : 0.95);
      case 'snow': return t.ice || (w.snow || 0) > 0.03 ? 1.12 : ((w.snow || 0) < -0.03 ? 0.88 : 0.93);
      case 'mud': return t.mud ? 1.14 : (heavy ? 0.96 : 0.9);
      case 'rock': return t.hurdler || t.nimble || t.quick ? 1.08 : (heavy ? 0.89 : 0.95);
      case 'slope': return heavy ? 1.2 : 1.1;
      case 'forest': return a.agi >= 0.75 ? 1.07 : (heavy ? 0.93 : 1);
      default: return 1;
    }
  }

  // ───────────── 필살기 (동물마다 하나씩 · 게이지가 차면 터진다) ─────────────
  // id: [이름, 설명, 방식, 수치]
  var ULT = {
    turtle: ['시간아 멈춰라', '다른 동물들의 시간이 잠깐 멈춰요.', 'timeStop', { t: 1.9 }],
    cheetah: ['연쇄 사냥', '앞선 세 마리를 차례로 넘어뜨리며 뛰어넘어요.', 'leap', { n: 3, stun: 0.9 }],
    penguin: ['빙판 대미끄럼', '트랙을 길게 얼려 혼자 신나게 미끄러져요.', 'road', { type: 'ice', len: 70, m: 1.9, t: 3.2 }],
    pig: ['꼴찌들의 반란', '뒤처진 동물들이 한꺼번에 로켓처럼 치고 나가요.', 'underdog', { n: 3, m: 1.8, t: 3.5 }],
    dog: ['모여라! 양몰이', '앞서가던 동물들을 내 옆으로 몰아와요.', 'gather', { R: 70 }],
    zebra: ['줄무늬 대혼란', '선두권 동물들의 자리가 뒤죽박죽 섞여요.', 'shuffle', { n: 4 }],
    cow: ['소 떼 대이동', '소 떼가 몰려와 길 위의 동물을 쓸어 버려요.', 'stampede', {}],
    monkey: ['바나나 대폭격', '앞선 동물들 발밑에 바나나가 쏟아져요.', 'trapRain', { n: 10, what: 'banana' }],
    croc: ['데스 롤', '빙글빙글 돌며 주변 동물을 모두 튕겨 내요.', 'sweep', { R: 18, push: 10, stun: 1.0 }],
    squirrel: ['도토리 폭풍', '도토리가 비처럼 쏟아져 여러 동물이 맞아요.', 'storm', { n: 5, t: 1.0, fx: 'bonk2', proj: 'acorn' }],
    mouse: ['작아져라 얍!', '선두 세 마리가 생쥐만 하게 작아져 느려져요.', 'shrink', { n: 3, m: 0.66, t: 5.5 }],
    hedgehog: ['가시 폭풍', '가시를 사방으로 쏘고 한동안 가시투성이가 돼요.', 'spikeBurst', { R: 16, stun: 1.2, t: 5 }],
    raccoon: ['싹쓸이 도둑', '모두의 필살기 게이지를 훔쳐 무적으로 달려요.', 'stealGauge', {}],
    otter: ['물미끄럼틀', '큰 물살을 일으켜 그 위를 타고 가요.', 'wave', {}],
    owl: ['시간 되감기', '앞선 동물들이 5초 전 자리로 돌아가요.', 'rewind', { sec: 5, who: 'ahead' }],
    parrot: ['따라쟁이 필살기', '방금 누군가 쓴 필살기를 그대로 따라 해요.', 'mimic', {}],
    bat: ['거꾸로 세상', '세상이 뒤집혀 앞선 동물은 뒤로, 뒤처진 동물은 앞으로 가요. 참가가 많은 판에서는 옮겨지는 거리에 한도가 있어요.', 'reverse', {}],
    redpanda: ['대왕 레서판다 변신', '엄청나게 커져서 부딪친 동물을 밀쳐 내요.', 'giant', { t: 6, m: 1.35 }],
    whale: ['큰 숨 들이마시기', '모든 동물이 고래 쪽으로 빨려 와요.', 'blackhole', { k: 0.65 }],
    orca: ['범고래 사냥 대형', '선두 세 마리를 그물처럼 가둬요.', 'net', { n: 3, t: 1.9 }],
    crab: ['게걸음 길막기', '옆으로 걸으며 길을 막아 아무도 못 지나가요.', 'block', { t: 5 }],
    lobster: ['집게로 붙잡고 버티기', '1등을 꽉 붙잡아 같이 멈춰요. 내가 먼저 풀려나요.', 'grab', { t: 2.5, self: 0.9 }],
    shrimp: ['새우 떼 군무', '바다 친구가 많을수록 더 빨라져요.', 'pack', { base: 1.4, per: 0.15, t: 5 }],
    puffer: ['복어 폭탄 돌리기', '폭탄이 이 동물 저 동물로 옮겨 다니다 펑!', 'bomb', { t: 6, stun: 2.2 }],
    lizard: ['꼬리 자르기 대탈출', '모든 방해를 떨치고, 뒤처졌다면 무리 한가운데로 돌아와요.', 'rescue', {}],
    dodo: ['운명의 룰렛', '다른 동물의 필살기 가운데 하나가 랜덤으로 나와요.', 'roulette', {}],
    trex: ['운석 소환', '거대한 운석이 선두에 떨어져요. 티라노도 가까이 있으면 위험!', 'meteor', { n: 1, delay: 2.0, r: 22, stun: 2.2, push: 8, self: 1 }],
    hyena: ['비웃음의 저주', '한동안 1등으로 달리는 동물은 계속 느려져요.', 'crown', { t: 10, m: 0.76 }],
    lemur: ['어부바 점프', '1등(너무 멀면 닿는 범위에서 가장 앞선 동물) 등에 올라타 편하게 가다가 앞으로 뛰어내려요.', 'ride', { t: 3.2 }]
  };
  // 방식별 게이지 차는 빠르기 (센 것은 천천히)
  var ULT_CH = {};
  // 참가가 많은 판(9마리 이상)에서만 더해지는 게이지 보정 : 22마리 판에서 이 값만큼, 그 사이는 비례해서
  var ULT_BIG = {};
  // 참가가 많은 판(9마리 이상)에서만 더해지는 속력 보정(m/s) : 22마리 판에서 이 값만큼, 그 사이는 비례해서
  var BIG_SPD = {
    rabbit: -0.060, turtle: 0.037, cheetah: -0.050, fox: 0.091, bear: 0.030, penguin: 0.014, elephant: 0.010, kangaroo: 0.022, skunk: -0.052, pig: -0.002,
    dog: -0.073, cat: -0.085, panda: -0.003, duck: 0.093, lion: 0.020, tiger: -0.029, zebra: -0.081, giraffe: 0.017, horse: -0.005, cow: -0.018,
    sheep: -0.020, goat: 0.016, deer: -0.028, koala: 0.009, sloth: -0.008, monkey: 0.003, gorilla: 0.004, hippo: 0.030, rhino: 0.015, croc: 0.041,
    frog: -0.020, squirrel: -0.028, hamster: 0.003, mouse: -0.011, hedgehog: -0.072, raccoon: -0.101, otter: 0.033, beaver: 0.017, wolf: -0.031, polar: 0.016,
    seal: 0.060, owl: -0.027, chicken: -0.056, parrot: 0.020, flamingo: 0.017, ostrich: -0.007, camel: 0.038, alpaca: -0.017, bat: 0.263, redpanda: -0.021,
    shark: -0.036, whale: -0.025, dolphin: 0.019, orca: 0.087, octopus: -0.050, squid: -0.027, crab: 0.037, lobster: -0.072, shrimp: -0.035, jellyfish: 0.016,
    starfish: -0.054, seahorse: -0.045, clownfish: -0.030, puffer: -0.025, manta: -0.013, walrus: 0.068, narwhal: 0.023, sealion: -0.056, manatee: -0.075, beluga: 0.019,
    swordfish: 0.009, angler: 0.002, seaturtle: 0.007, snake: -0.013, cobra: 0.030, lizard: -0.006, chameleon: -0.004, iguana: 0.021, gecko: -0.001, komodo: 0.061,
    tortoise: 0.028, axolotl: 0.007, salamander: 0.052, toad: -0.012, eagle: -0.029, falcon: -0.047, crow: 0.054, swan: 0.066, goose: -0.038, peacock: -0.059,
    toucan: 0.016, pelican: 0.011, woodpecker: -0.061, pigeon: -0.039, seagull: 0.026, sparrow: -0.008, hummingbird: 0.010, kiwi: -0.036, turkey: -0.035, crane: 0.030,
    stork: 0.006, puffin: 0.107, robin: -0.118, canary: -0.036, cockatoo: -0.055, vulture: -0.001, dodo: 0.030, trex: -0.006, triceratops: 0.041, stego: -0.057,
    brachio: -0.001, raptor: -0.018, ptero: 0.080, ankylo: -0.027, parasaur: 0.031, spino: 0.060, diplodocus: 0.040, pachy: 0.002, dilopho: -0.008, compy: 0.037,
    plesio: 0.022, mammoth: 0.035, sabertooth: 0.040, dimetrodon: 0.084, archaeo: 0.011, capybara: -0.052, fennec: 0.048, meerkat: -0.090, badger: -0.065, ferret: 0.000,
    chipmunk: 0.003, leopard: -0.007, panther: -0.021, hyena: -0.040, lynx: -0.053, bison: -0.001, moose: 0.013, reindeer: 0.031, llama: -0.022, donkey: -0.049,
    boar: 0.038, anteater: 0.011, armadillo: -0.029, pangolin: -0.088, platypus: -0.016, wombat: -0.006, quokka: -0.007, lemur: 0.081, orangutan: 0.042, chimp: 0.007,
    jaguar: -0.034, snowleopard: 0.047, gazelle: 0.028, gnu: -0.014, buffalo: 0.082, yak: 0.038, tapir: 0.049, okapi: -0.029, mole: -0.053, prairiedog: -0.058,
    flyingsquirrel: -0.035, tasdevil: -0.069, echidna: -0.091, mandrill: 0.004, magpie: -0.061, swallow: -0.032, kingfisher: -0.036, albatross: 0.072, emu: 0.001, cassowary: -0.019,
    roadrunner: -0.002, heron: 0.048, pheasant: -0.043, mandarin: -0.018, shoebill: 0.007, secretary: 0.009, rattlesnake: 0.001, anaconda: 0.003, frilled: 0.065, basilisk: 0.158,
    dartfrog: 0.027, softshell: 0.036, whaleshark: -0.050, hammerhead: 0.025, sunfish: 0.060, flyingfish: 0.072, moray: -0.015, seaotter: -0.028, hermit: -0.031, cuttlefish: 0.041,
    eel: 0.016, salmon: 0.255, allosaurus: 0.077, carno: 0.047, therizino: 0.054, iguanodon: 0.023, gallimimus: 0.024, mosasaurus: 0.066, quetzal: 0.023, glyptodon: -0.005,
    ant: -0.036, fireant: -0.021, leafcutter: -0.037, bulletant: -0.026, termite: 0.009, honeybee: -0.053, bumblebee: -0.025, wasp: -0.017, hornet: -0.009, housefly: 0.012,
    mosquito: 0.008, fruitfly: -0.050, horsefly: -0.017, hoverfly: 0.040, swallowtail: -0.008, monarch: -0.040, morpho: -0.014, moth: -0.010, hawkmoth: 0.028, caterpillar: -0.005,
    dragonfly: -0.014, mayfly: 0.084, grasshopper: -0.004, locust: -0.024, cricket: -0.034, katydid: -0.038, molecricket: 0.000, flea: -0.040, mantis: 0.023, stickbug: -0.009,
    ladybug: -0.016, rhinobeetle: -0.032, stagbeetle: -0.035, dungbeetle: 0.012, firefly: -0.023, longhorn: -0.035, weevil: -0.023, tigerbeetle: 0.015, bombardier: 0.009, jewelbeetle: -0.026,
    divingbeetle: 0.035, strider: 0.028, waterbug: -0.004, cicada: -0.015, stinkbug: -0.004, cockroach: -0.021, earwig: -0.017, antlion: -0.015, froghopper: -0.033, aphid: -0.024
  };
  // 동물별 게이지 빠르기 보정 (밸런스를 맞추며 정한 값)
  var ULT_RATE = {
    rabbit: 0.963, turtle: 0.933, cheetah: 0.971, fox: 1.152, bear: 0.921, penguin: 0.906, elephant: 1.037, kangaroo: 1.015, skunk: 1.202, pig: 0.96,
    dog: 0.958, cat: 1.027, panda: 1.177, duck: 0.79, lion: 1.117, tiger: 1.175, zebra: 1.079, giraffe: 1.391, horse: 0.971, cow: 1.09,
    sheep: 1.052, goat: 1.017, deer: 1.062, koala: 1.105, sloth: 1.093, monkey: 0.947, gorilla: 1.087, hippo: 0.922, rhino: 1.107, croc: 0.927,
    frog: 1.055, squirrel: 0.95, hamster: 0.929, mouse: 0.948, hedgehog: 1.13, raccoon: 1.006, otter: 0.912, beaver: 0.817, wolf: 1.059, polar: 1.068,
    seal: 0.892, owl: 0.918, chicken: 1.301, parrot: 1.024, flamingo: 1.018, ostrich: 1.015, camel: 1.073, alpaca: 1.092, bat: 0.945, redpanda: 1.014,
    shark: 1.038, whale: 0.935, dolphin: 0.921, orca: 0.833, octopus: 1.033, squid: 1.057, crab: 0.892, lobster: 0.929, shrimp: 0.939, jellyfish: 1.097,
    starfish: 0.922, seahorse: 1.032, clownfish: 1.047, puffer: 0.969, manta: 0.961, walrus: 0.963, narwhal: 0.951, sealion: 1.322, manatee: 1.429, beluga: 1.098,
    swordfish: 1.084, angler: 1.012, seaturtle: 1.013, snake: 1.142, cobra: 1.023, lizard: 1.035, chameleon: 1.132, iguana: 0.874, gecko: 0.916, komodo: 0.944,
    tortoise: 0.949, axolotl: 0.96, salamander: 0.847, toad: 0.954, eagle: 1.073, falcon: 1.205, crow: 0.976, swan: 0.88, goose: 1.08, peacock: 1.271,
    toucan: 1.016, pelican: 0.913, woodpecker: 1.217, pigeon: 1.157, seagull: 1.043, sparrow: 0.98, hummingbird: 0.885, kiwi: 0.974, turkey: 1.033, crane: 0.938,
    stork: 1.027, puffin: 0.821, robin: 1.186, canary: 1.167, cockatoo: 1.018, vulture: 0.923, dodo: 1.046, trex: 0.972, triceratops: 1.184, stego: 1.434,
    brachio: 1.125, raptor: 1.249, ptero: 1.619, ankylo: 1.283, parasaur: 1.143, spino: 0.895, diplodocus: 1.15, pachy: 1.045, dilopho: 1.24, compy: 1.059,
    plesio: 1.02, mammoth: 1.052, sabertooth: 1.279, dimetrodon: 0.817, archaeo: 1.048, capybara: 1.291, fennec: 0.848, meerkat: 1.119, badger: 0.95, ferret: 1.196,
    chipmunk: 0.995, leopard: 1.239, panther: 1.256, hyena: 0.986, lynx: 1.087, bison: 1.072, moose: 1.002, reindeer: 0.86, llama: 1.185, donkey: 1.177,
    boar: 1.008, anteater: 1.707, armadillo: 1.123, pangolin: 1.211, platypus: 1.028, wombat: 1.174, quokka: 1.026, lemur: 1.145, orangutan: 1.312, chimp: 1.081,
    jaguar: 0.94, snowleopard: 0.817, gazelle: 0.974, gnu: 1.292, buffalo: 0.739, yak: 1.047, tapir: 0.703, okapi: 1.091, mole: 1.103, prairiedog: 1.3,
    flyingsquirrel: 0.994, tasdevil: 1.033, echidna: 1.402, mandrill: 1.144, magpie: 0.861, swallow: 0.933, kingfisher: 0.871, albatross: 0.783, emu: 0.927, cassowary: 1.2,
    roadrunner: 0.867, heron: 0.867, pheasant: 1.02, mandarin: 0.88, shoebill: 0.851, secretary: 0.941, rattlesnake: 1.055, anaconda: 0.862, frilled: 0.886, basilisk: 0.607,
    dartfrog: 0.824, softshell: 0.706, whaleshark: 1.016, hammerhead: 0.872, sunfish: 0.807, flyingfish: 0.653, moray: 0.906, seaotter: 0.729, hermit: 0.882, cuttlefish: 0.759,
    eel: 0.706, salmon: 0.582, allosaurus: 1.266, carno: 0.978, therizino: 1.36, iguanodon: 1.346, gallimimus: 0.919, mosasaurus: 0.829, quetzal: 1.314, glyptodon: 1.326,
    ant: 1.036, fireant: 0.919, leafcutter: 0.99, bulletant: 0.994, termite: 0.771, honeybee: 1.113, bumblebee: 1.082, wasp: 0.896, hornet: 1.041, housefly: 0.781,
    mosquito: 0.742, fruitfly: 0.914, horsefly: 0.958, hoverfly: 0.766, swallowtail: 0.913, monarch: 1.032, morpho: 0.798, moth: 1.16, hawkmoth: 0.803, caterpillar: 0.917,
    dragonfly: 0.983, mayfly: 0.669, grasshopper: 0.986, locust: 0.966, cricket: 1.213, katydid: 1.052, molecricket: 0.883, flea: 0.817, mantis: 0.932, stickbug: 1.009,
    ladybug: 1.04, rhinobeetle: 1.072, stagbeetle: 1.146, dungbeetle: 0.746, firefly: 1.145, longhorn: 0.977, weevil: 0.947, tigerbeetle: 0.861, bombardier: 0.988, jewelbeetle: 1.011,
    divingbeetle: 0.72, strider: 0.652, waterbug: 0.833, cicada: 1.039, stinkbug: 0.944, cockroach: 0.862, earwig: 1.109, antlion: 1.033, froghopper: 1.056, aphid: 1.229
  };
  ANIMALS.forEach(function (a) {
    var b = ABIL[a.id], u = ULT[a.id];
    if (!b) throw new Error('능력이 없는 동물: ' + a.id);
    a.skill = { name: b[0], ab: parseAb(b[1]), key: abKey(b[1]) }; a.skill.desc = abDesc(a.skill.ab);
    a.skill2 = { name: b[2], ab: parseAb(b[3]), key: abKey(b[3]) }; a.skill2.desc = abDesc(a.skill2.ab);
    if (b[5] === 'U') a.ult = { name: u[0], desc: u[1], kind: u[2], p: u[3], key: 'U:' + u[2] };
    else { a.ult = { name: b[4], ab: parseAb(b[5]), key: abKey(b[5]) }; a.ult.desc = abDesc(a.ult.ab); }
    a.ult.ch = ULT_RATE[a.id] || 1; a.ult.big = ULT_BIG[a.id] || 1;
  });

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
    fog:   { id: 'fog', name: '안개', base: 0, desc: '멀리서 던지는 공격이 잘 빗나가요.' },
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
      nextEvent: rng.range(12, 18), lastEvent: null, eventCount: 0, lastSkill: null,
      cdMul: Math.max(1, n / 8),                       // 스킬 쉬는 시간 배율 (참가가 많으면 한 마리가 쓰는 횟수가 줄어든다)
      ultDiv: n <= 8 ? 1 : 1 + (n - 8) * 0.05,
      stageFree: 5, acts: 0, leadSeg: 0, terrain: null,        // 참가가 많으면 필살기 게이지가 조금 천천히 찬다
      blockers: [], bomb: null, curse: null, lastUlt: null,
      order: []
    };

    function setWeather(id) {
      var w = WEATHERS[id];
      race.weather = { id: w.id, name: w.name, desc: w.desc, base: w.base, gust: 0, timer: rng.range(2.5, 4.5) };
    }
    setWeather(wid);
    // 지형 : 출발 60m 와 마지막 60m 는 흙길, 그 사이를 70~130m 구간으로 나눈다
    var terr = [{ type: 'track', x0: 0, x1: 60 }], tx0 = 60, tprev = 'track', tkeys = ['water', 'sand', 'snow', 'mud', 'rock', 'slope', 'forest', 'track'];
    while (tx0 < LEN - 60 && opts.terrain !== 'none') {
      var tl = rng.range(70, 130), tt;
      do { tt = rng.pick(tkeys); } while (tt === tprev);
      if (tx0 + tl > LEN - 100) tl = LEN - 60 - tx0;
      terr.push({ type: tt, x0: tx0, x1: tx0 + tl }); tx0 += tl; tprev = tt;
    }
    terr.push({ type: 'track', x0: opts.terrain === 'none' ? 60 : LEN - 60, x1: LEN + 60 });
    race.terrain = terr;
    if (!opts.noWeatherChange) race.wxChangeAt = rng.range(16, 28);

    var i;
    for (i = 0; i < n; i++) {
      var a = picked[i];
      var form = [];
      for (var k = 0; k < 10; k++) form.push(1 + clamp(rng.gauss() * 0.024, -0.06, 0.06));
      var nm = (opts.names[i] || '').trim();
      race.racers.push({
        i: i, lane: i + 1, name: nm || a.name, named: !!nm, a: a,
        x: 0, prevX: 0, v: 0,
        cond: 1 + clamp(rng.gauss() * 0.012, -0.03, 0.03),
        form: form, noise: 0, draft: false,
        tune: ((opts.tune && opts.tune[a.id]) || 0) + (n > 8 ? (BIG_SPD[a.id] || 0) * Math.min(1, (n - 8) / 14) : 0),
        ultCh: Math.exp(1.2 * ((opts.tune && opts.tune[a.id]) || 0)) * (n > 8 ? Math.pow(a.ult.big, Math.min(1, (n - 8) / 14)) : 1),
        startDelay: rng.range(0.02, 0.28) * (a.tr.quick ? 0.3 : 1),
        fx: [],
        item: null, itemT: 0, itemWait: 0,
        skillT: rng.range(4, 8) + rng.range(0, n * 1.5), skillWait: 0, seg: 0, tmul: null, ultSince: 0,
        finished: false, finT: null, place: 0, rank: i + 1,
        napped: false, napMarks: [150, 350, 550, 750, 900], bumped: null,
        ult: rng.range(0, 22), ultRate: rng.range(0.85, 1.15), ultReady: false, ultDelay: 0, ultWait: 0, ultN: 0, ultRefund: 0,
        sealT: 0, hist: [], histT: -1, charge: null, burst: 0, mimicId: null, uses: [0, 0], hurtT: -99, foe: null,
        stats: { skills: 0, items: 0, gave: 0, took: 0, helps: 0, top: 0, leadTime: 0, blocked: 0, ults: 0 }
      });
    }

    // 아이템 상자 : 5줄, 레인마다 65% 확률 (참가가 많으면 조금씩 줄임)
    var boxP = n <= 8 ? 0.65 : Math.max(0.38, 0.65 - (n - 8) * 0.02);
    var boxXs = [];
    // (아이템 상자는 없앴다)
    boxXs.forEach(function (bx) {
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
          if (sh.rebound) { addFx(tgt, { kind: 'boost', fx: 'dash', t: sh.rebound, m: 1.7 }); pop(tgt, '받아쳤다!', 'good'); sfx('boost'); return 'shield'; }
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
      tgt.hurtT = race.t; if (src && src !== tgt) tgt.foe = src;
      if (!tgt.ultReady) tgt.ult = Math.min(100, tgt.ult + (spec.minor ? 1 : 4));
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
      if (race.wxChangeAt !== null && race.t >= race.wxChangeAt && race.leadX > LEN - 110) race.wxChangeAt = null;
      if (race.wxChangeAt !== null && race.t >= race.wxChangeAt && race.t >= race.stageFree) {
        race.wxChangeAt = race.t + rng.range(24, 40);
        var ids = WEATHER_WEIGHTS.filter(function (p) { return p[0] !== w.id; });
        var prev = w.name;
        setWeather(rng.weighted(ids));
        w = race.weather;
        banner('wx_' + w.id, '날씨가 바뀝니다!', prev + ' → ' + w.name);
        takeStage('event', null, w.name, { wx: w.id });
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
    var EVENT_WEIGHTS = [['bees', 8], ['moles', 9], ['crowd', 10], ['ufo', 8], ['hurdles', 9], ['star', 9], ['rainbow', 10], ['twister', 9]];
    var TERRAIN_EVENT = { water: 'bigwave', rock: 'rockfall', slope: 'rockfall', sand: 'twister', forest: 'bees', snow: 'avalanche' };

    function updateEvents() {
      if (race.t < race.nextEvent || race.t < race.stageFree) return;
      if (race.leadX < 30) { race.nextEvent = race.t + 1; return; }
      if (race.leadX > LEN - 48 || race.finished > 0) { race.nextEvent = Infinity; return; }
      var pool = EVENT_WEIGHTS.filter(function (p) { return p[0] !== race.lastEvent; });
      var id = rng.weighted(pool);
      var act = active().filter(function (r) { return r.x < LEN - 8; });
      if (act.length === 0) { race.nextEvent = Infinity; return; }
      var ordered = act.slice().sort(function (p, q) { return q.x - p.x; });
      var lead = ordered[0];
      var tev = TERRAIN_EVENT[race.terrain[lead.seg].type];
      if (tev && tev !== race.lastEvent && rng.chance(0.55)) id = tev;
      if ((id === 'hurdles' || id === 'bigwave') && lead.x > LEN - 80) id = 'crowd';
      if ((id === 'bees' || id === 'twister') && act.length < 2) id = 'rainbow';
      race.lastEvent = id; race.eventCount++;
      race.nextEvent = race.t + rng.range(16, 24);
      takeStage('event', null, id, { ev: id });
      fireEvent(id);
    }
    function fireEvent(id) {
      var act = active().filter(function (r) { return r.x < LEN - 8; });
      if (!act.length) return;
      var ordered = act.slice().sort(function (p, q) { return q.x - p.x; });
      var lead = ordered[0];
      if ((id === 'hurdles' || id === 'bigwave') && lead.x > LEN - 80) id = 'crowd';
      if ((id === 'bees' || id === 'twister') && act.length < 2) id = 'rainbow';
      var k, list, r, res;
      switch (id) {
        case 'rainbow':
          banner('star', '무지개가 떴어요!', '뒤처진 동물들에게 행운이 찾아와요');
          list = ordered.slice(-Math.max(1, Math.min(3, Math.round(act.length / 4))));
          list.forEach(function (q) { addFx(q, { kind: 'boost', fx: 'cheer', t: 3.2, m: 1.6 }); pop(q, '힘이 솟는다!', 'good'); });
          log('event', null, '무지개가 떴어요! ' + josa(shortNames(list.map(function (q) { return q.name; })), '이', '가') + ' 행운을 받아 치고 나갑니다.');
          sfx('star');
          break;
        case 'twister':
          banner('wx_wind', '회오리바람!', '휩쓸린 두 동물의 자리가 바뀌어요');
          list = rng.shuffle(act.filter(function (q) { return !hasFlag(q, 'imm'); })).slice(0, 2);
          if (list.length === 2) {
            k = list[0].x; warp(list[0], list[1].x); warp(list[1], k);
            list.forEach(function (q) { addFx(q, { kind: 'stun', fx: 'spin', t: 0.7, m: 0 }); pop(q, '빙글빙글~', 'bad'); });
            race.ev.push({ k: 'swap', a: list[0].i, b: list[1].i }); race.ev.push({ k: 'tornado', from: list[0].i, to: [list[1].i] });
            log('event', null, '회오리바람에 ' + josa(list[0].name, '과', '와') + ' ' + list[1].name + '의 자리가 바뀌었어요!');
          }
          sfx('wind');
          break;
        case 'rockfall':
          banner('hurdles', '낙석 주의!', '바위가 떨어집니다. 빨간 구역을 피하세요');
          rng.shuffle(act.slice()).slice(0, Math.max(2, Math.round(act.length / 5))).forEach(function (q) {
            newObj({ type: 'meteor', x: clamp(q.x + q.v * 1.4 * 0.95, 5, LEN - 8), at: race.t + 1.4, dur: 1.4, rad: 4.5, stun: 1.1, push: 0, src: null, self: true, nut: true });
          });
          log('event', null, '바위가 굴러떨어집니다! 머리 조심!');
          break;
        case 'bigwave':
          banner('wx_rain', '큰 물결!', '물을 좋아하는 동물만 신나요');
          newObj({ type: 'wave', x: ordered[ordered.length - 1].x - 30, v: 44, endX: lead.x + 50, src: null, hit: {} });
          log('event', null, '물길에 큰 물결이 밀려옵니다!');
          sfx('wind');
          break;
        case 'avalanche':
          banner('wx_snow', '눈사태!', '뒤쪽 동물들이 눈에 떠밀려 앞으로 와요');
          list = ordered.slice(-Math.max(1, Math.min(3, Math.round(act.length / 4))));
          list.forEach(function (q) { warp(q, q.x + 12); addFx(q, { kind: 'boost', fx: 'slide', t: 2.2, m: 1.4 }); pop(q, '떠밀려 간다~', 'good'); });
          log('event', null, '눈사태! ' + josa(shortNames(list.map(function (q) { return q.name; })), '이', '가') + ' 눈에 떠밀려 앞으로 나왔어요.');
          race.ev.push({ k: 'shake' });
          break;
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

    // ───────────── 스킬 · 필살기 실행 ─────────────
    // id : 쓸 스킬의 주인 동물 (따라 할 때는 다른 동물의 id) · copied : 따라 하는 중인지 · which : 1 또는 2
    function castSkill(r, dt, id, copied, which) {
      var A = ANIMAL_BY_ID[id], w = which === 2 ? 1 : 0, SK = w ? A.skill2 : A.skill;
      var res = execAb(r, SK.ab, 'skill', r.uses[w], 0);
      r.uses[w]++;
      r.stats.skills++;
      r.skillT = rng.range(16, 23) * race.cdMul * res.quick;
      r.skillWait = 0;
      race.ev.push({ k: 'skill', r: r.i, name: SK.name, id: id });
      pop(r, (copied ? '따라 하기 → ' : '') + SK.name + '!', 'skill');
      sfx('skill');
      log('skill', r, (copied ? '(따라 하기) ' : '') + josa(r.name, '이', '가') + ' ' + SK.name + '! ' + res.msg);
      if (!copied && !res.echo) race.lastSkill = { id: id, which: w + 1 };     // 흉내 스킬은 기록하지 않는다 (서로 흉내 내다 끝없이 도는 것을 막음)
      return true;
    }

    function terrOf(q) { return race.terrain[q.seg].type; }
    // 대상 고르기
    function tgList(r, tg) {
      var ot = othersOf(r), li, k;
      var ah = ot.filter(function (o) { return o.x > r.x; }).sort(function (p, q) { return p.x - q.x; });       // 가까운 순
      var bh = ot.filter(function (o) { return o.x <= r.x; }).sort(function (p, q) { return q.x - p.x; });
      var byx = ot.slice().sort(function (p, q) { return q.x - p.x; });                                          // 앞선 순
      function within(arr, d) { return arr.filter(function (o) { return Math.abs(o.x - r.x) <= d; }); }
      switch (tg) {
        case 'a1': return within(ah, 35).slice(0, 1);
        case 'a2': return within(ah, 45).slice(0, 2);
        case 'a3': return within(ah, 55).slice(0, 3);
        case 'L': return byx.slice(0, 1);
        case 'T3': return byx.slice(0, 3);
        case 'b1': return within(bh, 30).slice(0, 1);
        case 'b2': return within(bh, 40).slice(0, 2);
        case 'near': return within(ot, 12);
        case 'wide': return within(ot, 28);
        case 'lane': return within(ot, 45).filter(function (o) { return Math.abs(o.lane - r.lane) === 1; });
        case 'adj': return within(ah, 35).slice(0, 1).concat(within(bh, 30).slice(0, 1));
        case 'last': return byx.slice(-1);
        case 'tail3': return byx.slice(-3);
        case 'rnd': return ot.length ? [rng.pick(ot)] : [];
        case 'rnd3': return rng.shuffle(ot.slice()).slice(0, 3);
        case 'ahead': return ah;
        case 'behind': return bh;
        case 'all': return ot;
        case 'fast': li = null; ot.forEach(function (o) { if (!li || o.v > li.v) li = o; }); return li ? [li] : [];
        case 'rich': li = null; ot.forEach(function (o) { if (!li || o.ult > li.ult) li = o; }); return li ? [li] : [];
        case 'foe': return r.foe && !r.foe.finished ? [r.foe] : within(ah, 35).slice(0, 1);
        case 'boosted': return ot.filter(boosted);
        case 'kin': return ot.filter(function (o) { return o.a.cat === r.a.cat; });
        case 'alien': return ot.filter(function (o) { return o.a.cat !== r.a.cat; });
        case 'heavy': return ot.filter(function (o) { return o.a.light <= 0.2; });
        case 'lightw': return ot.filter(function (o) { return o.a.light >= 0.8; });
        case 'odd': return ot.filter(function (o) { return o.lane % 2 === 1; });
        case 'even': return ot.filter(function (o) { return o.lane % 2 === 0; });
        case 'mid': k = byx.length; return byx.slice(Math.floor(k / 3), Math.max(Math.floor(k / 3) + 1, Math.ceil(k * 2 / 3)));
        case 'bird': case 'mam': case 'rep': case 'sea': case 'dino': case 'bug': return ot.filter(function (o) { return o.a.cat === tg; });
      }
      return within(ah, 35).slice(0, 1);
    }
    // 조건에 따른 효과 크기 (평균이 1 근처가 되게 잡았다)
    function twistF(r, tw, uses, hits) {
      var na = race.racers.length - race.finished, rk = na > 1 ? clamp((r.rank - 1 - race.finished) / (na - 1), 0, 1) : 0, c = 0, k;
      switch (tw) {
        case 'rank': return 0.7 + 0.95 * rk;
        case 'lead': return 1.6 - 0.9 * rk;
        case 'late': return 0.7 + 0.95 * r.x / LEN;
        case 'early': return 1.65 - 0.95 * r.x / LEN;
        case 'gap': return 0.75 + Math.min(Math.max(0, race.leadX - r.x), 60) / 60 * 0.95;
        case 'crowd': race.racers.forEach(function (o) { if (o !== r && !o.finished && Math.abs(o.x - r.x) <= 12) c++; }); return Math.min(1.75, 0.7 + 0.3 * c);
        case 'alone': race.racers.forEach(function (o) { if (o !== r && !o.finished && Math.abs(o.x - r.x) <= 10) c++; }); return c ? 0.8 : 1.6;
        case 'stack': return Math.min(1.75, 0.75 + 0.3 * uses);
        case 'fresh': return uses === 0 ? 1.75 : (uses === 1 ? 1.05 : 0.85);
        case 'hurt': return race.t - r.hurtT < 6 ? 1.7 : 0.85;
        case 'calm': return race.t - r.hurtT > 15 ? 1.5 : 0.8;
        case 'gauge': return 0.7 + Math.min(100, r.ult) / 100;
        case 'dice': return rng.range(0.45, 1.75);
        case 'chase': return aheadOf(r, 7) ? 1.6 : 0.85;
        case 'flee': race.racers.forEach(function (o) { if (o !== r && !o.finished && o.x < r.x && r.x - o.x <= 7) c++; }); return c ? 1.6 : 0.85;
        case 'kin': race.racers.forEach(function (o) { if (o !== r && !o.finished && o.a.cat === r.a.cat) c++; }); return Math.min(1.75, 0.8 + 0.3 * c);
        case 'hits': return Math.min(1.9, 0.7 + 0.4 * hits);
      }
      k = tw.slice(2).toLowerCase();
      if (tw.slice(0, 2) === 'in') return terrOf(r) === k ? 1.75 : 0.85;
      k = tw.slice(1).toLowerCase();
      return (race.weather.id === k || (k === 'rain' && race.weather.id === 'storm')) ? 1.75 : 0.85;
    }
    var SELFISH = { burst: 1, cruise: 1, ramp: 1, fade: 1, pulse: 1, windup: 1, over: 1, hop: 1, soar: 1, slide: 1, armor: 1, roll: 1, firm: 1, blink: 1, relay: 1, glide: 1, dig: 1, wheel: 1,
      shield: 1, mirror: 1, thorns: 1, cleanse: 1, charge: 1, quick: 1, bank: 1, dice: 1, echo: 1, counter: 1, cocoon: 1, vault: 1, hook: 1, leech: 1, cling: 1, reel: 1, aid: 1, guard: 1, feed: 1, tow: 1, heal: 1, wx: 1, terra: 1 };
    var NEG_POP = { stun: '어질어질~', trip: '꽈당!', zap: '찌릿!', slow: '으으, 느려…', bog: '질척질척…', gust: '날아간다~', push: '으악!', sleep: '쿨쿨…', back: '몸이 뒤로 간다…', freeze: '꽁꽁!',
      seal: '스킬이 안 써져!', drain: '기운이 빠져…', delay: '어? 뭐 하려 했더라', curse: '똑딱똑딱…', tax: '끌려간다!', demote: '밀렸다!', hook: '끌려간다!', leech: '힘이 빠져…', strip: '내 가속이!', pin: '몸이 무거워…', sting: '따끔! 독이다…', swarm: '벌레 떼다!', itch: '가려워!' };
    var NEG_SAY = { stun: '멈춰 섰어요.', trip: '넘어졌어요.', zap: '찌릿! 멈춰 섰어요.', slow: '느려졌어요.', bog: '발이 묶였어요.', gust: '뒤로 날아갔어요.', push: '뒤로 밀려났어요.', sleep: '스르르 잠들었어요.',
      back: '뒷걸음질을 칩니다.', freeze: '꽁꽁 얼었어요.', seal: '스킬을 못 쓰게 됐어요.', drain: '게이지를 빼앗겼어요.', delay: '스킬이 늦어졌어요.', curse: '시한폭탄이 붙었어요.', tax: '뒤로 확 끌려갔어요.',
      demote: '한 칸 밀려났어요.', hook: '끌려왔어요.', leech: '속도를 빼앗겼어요.', strip: '가속과 방패가 벗겨졌어요.', pin: '가속을 못 하게 됐어요.', sting: '독에 걸려 점점 느려집니다.', swarm: '벌레 떼에 휩싸였어요.', itch: '가려워서 자꾸 멈칫해요.' };
    var SLICK_KO = { mud: '진흙탕', ice: '빙판', lake: '물웅덩이', fire: '불길', ink: '먹물' };

    // 능력 하나 실행. tier : 'skill' | 'ult' · uses : 이 능력을 전에 쓴 횟수 → { msg, quick, echo }
    function execAb(r, parts, tier, uses, depth) {
      var K = tier === 'ult' ? 2.1 : 1, share = [1, 0.7, 0.56][Math.min(2, parts.length - 1)];
      var out = [], lastHits = 0, selfish = false, quick = 1, usedEcho = false;
      function sb(fx, m, t, extra) {
        var e = { kind: 'boost', fx: fx, t: t, m: m };
        if (extra) for (var k2 in extra) e[k2] = extra[k2];
        addFx(r, e);
      }
      function fxOf(o, fx) { for (var j = 0; j < o.fx.length; j++) if (o.fx[j].fx === fx) return o.fx[j]; return null; }
      function gaugeTo(o, amt) {            // 게이지 더하기 (필살기를 막 쓴 동물은 쓰고 난 뒤 몫으로)
        if (o === r && tier === 'ult') { r.ultRefund = Math.min(60, (r.ultRefund || 0) + amt); return; }
        if (!o.ultReady) o.ult = Math.min(99.5, o.ult + amt);
      }
      function runOne(e) {
        var f = e.tw ? twistF(r, e.tw, uses, lastHits) : 1, mag = K * share * f;
        var T, hit = [], ts, d, k, x0, o2, li, lead = leaderOf(), res;
        function neg(o, spec) { res = applyNeg(r, o, spec); if (res === 'hit') { hit.push(o); if (NEG_POP[e.op]) pop(o, NEG_POP[e.op], 'bad'); return true; } return false; }
        function hitMsg() { lastHits = hit.length; return hit.length ? (e.op === 'curse' ? namesOf(hit) + '에게' : josa(namesOf(hit), '이', '가')) + ' ' + NEG_SAY[e.op] : (T.length ? '하지만 모두 버텨 냈어요.' : '노릴 상대가 없어 혼자 힘을 냅니다.'); }
        function needT() { T = tgList(r, e.tg || 'a1'); ts = T.length ? Math.max(0.3, 1 / Math.sqrt(T.length)) : 1; if (!T.length) sb('dash', 1.25, 2.0 * mag); return T.length > 0; }
        if (SELFISH[e.op]) selfish = true;
        switch (e.op) {
          // ── 스스로 달리기 ──
          case 'burst': sb('dash', 2.0, 1.3 * mag); return '확 치고 나갑니다!';
          case 'cruise': sb('run', 1.28, 4.6 * mag); return '꾸준히 속도를 올립니다.';
          case 'ramp': sb('charge', 1.05, 2.6 * mag, { ramp: [1.05, 2.0] }); return '달릴수록 점점 빨라집니다!';
          case 'fade': sb('rocket', 2.4, 2.0 * mag, { ramp: [2.4, 1.0] }); return '로켓처럼 튀어 나갑니다!';
          case 'pulse':
            (function hopN(left) {
              addFx(r, { kind: 'boost', fx: 'hop', t: 0.5 * mag, m: 1.95, onEnd: left > 1 ? function () {
                if (!r.finished) addFx(r, { kind: 'buff', fx: 'rest', t: 0.2, m: 1, onEnd: function () { if (!r.finished && !stunned(r)) hopN(left - 1); } });
              } : null });
            })(3);
            return '톡, 톡, 톡! 세 번 튀어 나갑니다.';
          case 'windup':
            addFx(r, { kind: 'stun', fx: 'eat', t: 0.7, m: 0, onEnd: function () { if (!r.finished) { sb('power', 1.8, 2.9 * mag); pop(r, '힘이 솟는다!', 'good'); sfx('boost'); } } });
            return '잠깐 멈춰 힘을 모읍니다… 곧 폭발해요!';
          case 'over':
            sb('sprint', 2.25, 1.5 * mag, { cancelOnStun: true, onEnd: function () { if (!r.finished) { addFx(r, { kind: 'slow', fx: 'tired', t: 2.4, m: 0.8 }); pop(r, '헥헥…', 'bad'); } } });
            return '전속력! 하지만 곧 지칠 거예요.';
          case 'hop': sb('jump', 1.9, 1.3 * mag, { air: true }); return '높이 뛰어오릅니다!';
          case 'soar': sb('fly', 1.42, 3.0 * mag, { air: true }); return '낮게 날아갑니다.';
          case 'slide':
            k = wet() || terrOf(r) === 'water' || terrOf(r) === 'snow' || terrOf(r) === 'mud';
            sb('slide', 1.5, 2.2 * mag * (k ? 1.45 : 1), { gnd: true, cancelOnStun: true });
            return k ? '길이 미끄러워 훨씬 멀리 쭈욱 미끄러집니다!' : '쭈욱 미끄러집니다!';
          case 'armor': sb('shell', 1.42, 2.6 * mag, { imm: true }); return '어떤 방해도 안 통해요!';
          case 'roll': r.bumped = {}; sb('roll', 1.45, 2.2 * mag, { imm: true, onEnd: function () { r.bumped = null; } }); return '데굴데굴 굴러갑니다! 스치면 휘청해요.';
          case 'firm': sb('steady', 1.3, 3.6 * mag, { noslow: true }); return '흔들림 없이 달립니다.';
          case 'blink': d = 9 * mag; warp(r, r.x + d); r.hop = race.t; return Math.round(d) + 'm 앞으로 순간 이동!';
          case 'relay':
            sb('dash', 1.6, 1.5 * mag, { onEnd: function () {
              if (!r.finished) addFx(r, { kind: 'buff', fx: 'rest', t: 0.9, m: 1, onEnd: function () { if (!r.finished && !stunned(r)) sb('dash', 1.6, 1.5 * mag); } });
            } });
            return '두 번에 나눠 힘차게 달립니다.';
          case 'glide': sb('glide', 1.2, 5.5 * mag, { allterr: true }); return '지형도 날씨도 상관없이 달립니다.';
          case 'dig': sb('burrow', 1.3, 1.7 * mag, { imm: true, gnd: true, onEnd: function () { if (!r.finished) { warp(r, r.x + 3 * mag); r.hop = race.t; } } }); return '땅속으로 쏙! 조금 앞에서 튀어나올 거예요.';
          case 'wheel': sb('wheel', 1.45, 2.4 * mag, { gnd: true }); return '바퀴처럼 굴러갑니다!';
          // ── 스스로 지키기 · 채우기 ──
          case 'shield': addFx(r, { kind: 'shield', fx: 'shield', t: 8 * Math.sqrt(mag), m: 1 }); sb('guard', 1.2, 2.0 * mag); return '방패를 둘렀어요.';
          case 'mirror': addFx(r, { kind: 'shield', fx: 'reflect', t: 8 * Math.sqrt(mag), m: 1, reflect: true }); sb('guard', 1.15, 2.0 * mag); return '다음 방해는 되돌려 줄 거예요.';
          case 'thorns': sb('thorns', 1.12, 2.6 * mag, { imm: true, thorns: true }); return '건드리면 따끔해요!';
          case 'cleanse':
            r.fx = r.fx.filter(function (x) { return x.kind !== 'slow' && x.kind !== 'stun'; }); r.sealT = 0;
            sb('fresh', 1.5, 1.2 * mag); return '방해를 싹 털어 냈어요.';
          case 'charge': gaugeTo(r, 22 * mag); sb('fresh', 1.15, 1.5 * mag); return '필살기 게이지를 채웠어요.';
          case 'quick': quick = 0.42; sb('fresh', 1.25, 1.6 * mag); return '다음 스킬이 금방 준비돼요.';
          case 'bank':
            warp(r, r.x - 3);
            addFx(r, { kind: 'buff', fx: 'rest', t: 3.2, m: 1, onEnd: function () { if (!r.finished) { warp(r, r.x + 3 + 11 * mag); r.hop = race.t; pop(r, '지금이다!', 'good'); } } });
            return '한 발 물러섭니다… 잠시 뒤 크게 튀어 나가요!';
          case 'dice':
            k = Math.floor(rng.next() * 6);
            if (k === 0) { warp(r, r.x + 22 * mag); r.hop = race.t; pop(r, '대박!', 'good'); return '주사위 6! 대박, 저 앞으로 날아갑니다!'; }
            if (k === 1) { sb('dash', 2.0, 1.6 * mag); return '주사위 5! 힘차게 치고 나갑니다.'; }
            if (k === 2) { addFx(r, { kind: 'shield', fx: 'shield', t: 8, m: 1 }); sb('guard', 1.3, 2.2 * mag); return '주사위 4! 방패를 얻었어요.'; }
            if (k === 3) { gaugeTo(r, 30 * mag); sb('fresh', 1.2, 1.6 * mag); return '주사위 3! 필살기 게이지가 찼어요.'; }
            if (k === 4) { pop(r, '꽝…', 'bad'); return '주사위 2… 꽝! 아무 일도 없었어요.'; }
            addFx(r, { kind: 'stun', fx: 'trip', t: 0.9, m: 0 }); warp(r, r.x - 4); pop(r, '삐끗!', 'bad'); return '주사위 1… 삐끗! 넘어졌어요.';
          case 'echo':
            usedEcho = true;
            if (race.lastSkill && depth < 1) {
              o2 = ANIMAL_BY_ID[race.lastSkill.id]; o2 = race.lastSkill.which === 2 ? o2.skill2 : o2.skill;
              return '「' + o2.name + '」 따라 하기! ' + execAb(r, o2.ab, tier, 0, depth + 1).msg;
            }
            sb('dash', 1.6, 1.6 * mag); return '아직 따라 할 스킬이 없어 그냥 달립니다.';
          case 'counter': addFx(r, { kind: 'shield', fx: 'shield', t: 7 * Math.sqrt(mag), m: 1, rebound: 2.3 * mag }); sb('guard', 1.12, 1.6 * mag); return '받아칠 준비를 합니다.';
          case 'cocoon':
            addFx(r, { kind: 'stun', fx: 'cocoon', t: 1.1, m: 0, imm: true, onEnd: function () {
              if (r.finished) return;
              r.fx = r.fx.filter(function (x) { return x.kind !== 'slow'; }); r.sealT = 0;
              sb('power', 2.0, 3.0 * mag); r.hop = race.t; pop(r, '짜잔!', 'good'); sfx('boost');
            } });
            return '고치 속으로 쏙! 곧 날개를 펴고 나옵니다.';
          case 'vault':
            T = tgList(r, e.tg || 'a1').filter(function (o) { return o.x > r.x; });
            d = 12 * K + 2; o2 = null;                 // 닿는 거리 : 스킬 14m · 필살기 27m
            T.forEach(function (o) { if (o.x - r.x <= d && (!o2 || o.x > o2.x)) o2 = o; });
            if (!o2 && T.length) race.racers.forEach(function (o) { if (o !== r && !o.finished && o.x > r.x && o.x - r.x <= d && (!o2 || o.x > o2.x)) o2 = o; });
            r.hop = race.t;
            if (!o2) { warp(r, r.x + 6 * mag); return '뛰어넘을 상대가 없어 그냥 앞으로 폴짝!'; }
            warp(r, o2.x + 1.5); lastHits = 1; pop(o2, '머리 위로?!', 'bad');
            return josa(o2.name, '을', '를') + ' 훌쩍 뛰어넘었어요!';
          // ── 방해 ──
          case 'aura': addFx(r, { kind: 'buff', fx: 'stinkaura', t: 3.6 * mag, m: 1, aura: 9, hitSet: {} }); return '고약한 구름을 두르고 달립니다. 가까이 오면 느려져요!';
          case 'sting':
            if (needT()) T.forEach(function (o) { if (neg(o, { kind: 'slow', fx: 'poison', m: 0.92, t: 3.4 * mag * ts })) { o2 = fxOf(o, 'poison'); if (o2) o2.ramp = [0.92, 0.5]; } });
            return hitMsg();
          case 'swarm':
            if (needT()) T.forEach(function (o) {
              d = 2.6 * mag * ts;
              if (!neg(o, { kind: 'slow', fx: 'bees', m: 0.78, t: d })) return;
              o2 = fxOf(o, 'bees');
              if (o2) o2.onEnd = (function (q, dur) { return function () {      // 떼가 가까운 동물에게 한 번 옮겨 붙는다
                var nx = null; race.racers.forEach(function (z) { if (z !== q && z !== r && !z.finished && Math.abs(z.x - q.x) <= 15 && !fxOf(z, 'bees') && (!nx || Math.abs(z.x - q.x) < Math.abs(nx.x - q.x))) nx = z; });
                if (nx && applyNeg(r, nx, { kind: 'slow', fx: 'bees', m: 0.78, t: dur * 0.6 }) === 'hit') pop(nx, '떼가 옮겨 왔다!', 'bad');
              }; })(o, d);
            });
            return hitMsg();
          case 'itch':
            if (needT()) T.forEach(function (o) {
              d = clamp(0.42 * mag * ts, 0.2, 1.2);
              (function scratch(left, first) {
                if (o.finished || applyNeg(r, o, { kind: 'stun', fx: 'itch', t: d, minor: !first }) !== 'hit') return;
                if (first) { hit.push(o); pop(o, NEG_POP.itch, 'bad'); }
                var fe = fxOf(o, 'itch');
                if (fe && left > 1) fe.onEnd = function () { if (!o.finished) addFx(o, { kind: 'buff', fx: 'itchwait', t: 0.45, m: 1, onEnd: function () { scratch(left - 1, false); } }); };
              })(3, true);
            });
            return hitMsg();
          case 'stun': if (needT()) T.forEach(function (o) { neg(o, { kind: 'stun', fx: 'spin', t: clamp(1.2 * mag * ts, 0.35, 3.2) }); }); return hitMsg();
          case 'trip': if (needT()) T.forEach(function (o) { neg(o, { kind: 'stun', fx: 'trip', t: clamp(1.35 * mag * ts, 0.35, 3.2), ground: true }); }); return hitMsg();
          case 'zap': if (needT()) T.forEach(function (o) { if (neg(o, { kind: 'stun', fx: 'zap', t: clamp(0.8 * mag * ts, 0.3, 2.4) })) o.sealT = Math.max(o.sealT, 3.5 * mag * ts); }); return hitMsg();
          case 'slow': if (needT()) T.forEach(function (o) { neg(o, { kind: 'slow', fx: 'wet', m: 0.6, t: 3.0 * mag * ts }); }); return hitMsg();
          case 'bog': if (needT()) T.forEach(function (o) { neg(o, { kind: 'slow', fx: 'puddle', m: 0.55, t: 2.4 * mag * ts * (o.a.light <= 0.2 ? 1.6 : (o.a.light >= 0.8 ? 0.7 : 1)) }); }); return hitMsg();
          case 'gust': if (needT()) T.forEach(function (o) { if (negWarp(r, o, o.x - 8 * mag * ts * (0.55 + 0.9 * o.a.light), 0.35, 'spin')) { hit.push(o); pop(o, NEG_POP.gust, 'bad'); } }); return hitMsg();
          case 'push': if (needT()) T.forEach(function (o) { if (negWarp(r, o, o.x - 8 * mag * ts, 0.4, 'trip')) { hit.push(o); pop(o, NEG_POP.push, 'bad'); } }); return hitMsg();
          case 'sleep':
            if (needT()) T.forEach(function (o) { if (neg(o, { kind: 'stun', fx: 'sleep', t: clamp(2.3 * mag * ts, 0.5, 4.5) })) { o2 = fxOf(o, 'sleep'); if (o2) o2.wakeRank = o.rank; } });
            return hitMsg();
          case 'back':
            if (needT()) T.forEach(function (o) { if (neg(o, { kind: 'stun', fx: 'charm', t: clamp(1.3 * mag * ts, 0.4, 3.2) })) { o2 = fxOf(o, 'charm'); if (o2) o2.back = 3; } });
            return hitMsg();
          case 'freeze':
            if (needT()) T.forEach(function (o) { neg(o, { kind: 'stun', fx: 'ice', t: clamp(1.15 * mag * ts * ((race.weather.id === 'snow' || terrOf(o) === 'snow') ? 1.6 : 1), 0.35, 3.6) }); });
            return hitMsg();
          case 'seal': if (needT()) T.forEach(function (o) { d = 5.5 * mag * ts; if (neg(o, { kind: 'slow', fx: 'lost', m: 0.9, t: d })) o.sealT = Math.max(o.sealT, d); }); return hitMsg();
          case 'drain':
            if (needT()) T.forEach(function (o) {
              if (!neg(o, { kind: 'slow', fx: 'scared', m: 0.9, t: 1.0, minor: true })) return;
              d = Math.min(o.ult, 18 * mag * ts); o.ult -= d; if (o.ultReady && d > 0) { o.ultReady = false; }
              gaugeTo(r, d * 0.8);
            });
            return hitMsg();
          case 'delay': if (needT()) T.forEach(function (o) { if (neg(o, { kind: 'slow', fx: 'lost', m: 0.92, t: 1.2, minor: true })) o.skillT = Math.max(o.skillT, 0) + 9 * mag * ts; }); return hitMsg();
          case 'curse':
            if (needT()) T.forEach(function (o) {
              if (!neg(o, { kind: 'buff', fx: 'cursed', m: 1, t: 2.5, minor: true })) return;
              o2 = fxOf(o, 'cursed'); d = clamp(1.7 * mag * ts, 0.4, 3.4);
              if (o2) o2.onEnd = (function (q, dur) { return function () { if (!q.finished && applyNeg(r, q, { kind: 'stun', fx: 'zap', t: dur }) === 'hit') { pop(q, '펑!', 'bad'); race.ev.push({ k: 'boom', x: q.x, r: q.i, small: true }); } }; })(o, d);
            });
            return hitMsg();
          case 'tax':
            if (needT()) T.forEach(function (o) {
              d = o.x - r.x; if (d <= 1) return;
              if (negWarp(r, o, o.x - clamp(d * 0.45 * mag * ts, 2, 16 * K), 0.3, 'spin')) { hit.push(o); pop(o, NEG_POP.tax, 'bad'); }
            });
            return hitMsg();
          case 'swap':
            if (!needT()) return '바꿀 상대가 없어 혼자 힘을 냅니다.';
            o2 = T[T.length - 1]; d = 14 * K + 2;        // 닿는 거리 : 스킬 16m · 필살기 31m
            if (o2.x - r.x > d) {                          // 너무 멀면 닿는 범위에서 가장 앞선 동물과 바꾼다
              o2 = null; race.racers.forEach(function (q) { if (q !== r && !q.finished && q.x > r.x && q.x - r.x <= d && (!o2 || q.x > o2.x)) o2 = q; });
              if (!o2) { sb('dash', 1.5, 2.0 * mag); return '바꿀 상대가 너무 멀어 대신 힘껏 달려요.'; }
            }
            x0 = o2.x;
            if (negWarp(r, o2, r.x, 0.4)) { warp(r, x0); pop(o2, '어? 여긴 어디?', 'bad'); race.ev.push({ k: 'swap', a: r.i, b: o2.i }); sfx('swap'); lastHits = 1; return josa(o2.name, '과', '와') + ' 자리가 바뀌었어요!'; }
            sb('dash', 1.5, 2.0 * mag); return josa(o2.name, '이', '가') + ' 막아 냈어요. 대신 힘껏 달려요.';
          case 'demote':
            if (needT()) {
              li = othersOf(r).sort(function (p, q) { return q.x - p.x; });        // 앞선 순 (쓴 동물은 뺀다)
              for (k = 0; k < li.length - 1; k++) {
                if (T.indexOf(li[k]) < 0 || li[k].x - li[k + 1].x > 40) continue;
                x0 = li[k].x;
                if (negWarp(r, li[k], li[k + 1].x, 0.4)) { warp(li[k + 1], x0); hit.push(li[k]); pop(li[k], NEG_POP.demote, 'bad'); race.ev.push({ k: 'swap', a: li[k].i, b: li[k + 1].i }); }
                k++;          // 방금 올라간 동물은 다시 건드리지 않는다
              }
            }
            return hitMsg();
          case 'hook':
            if (needT()) { d = 0; T.forEach(function (o) { if (negWarp(r, o, o.x - 5 * mag * ts, 0.35, 'spin')) { hit.push(o); pop(o, NEG_POP.hook, 'bad'); d += 5 * mag * ts; race.ev.push({ k: 'tongue', a: r.i, b: o.i }); } }); if (d) warp(r, r.x + Math.min(d, 14 * K)); }
            return hitMsg();
          case 'leech':
            if (needT()) { T.forEach(function (o) { neg(o, { kind: 'slow', fx: 'tired', m: 0.72, t: 3.0 * mag * ts }); }); if (hit.length) sb('power', 1 + 0.28 * Math.sqrt(Math.min(hit.length, 4)), 3.0 * mag * ts); }
            return hitMsg();
          case 'strip':
            if (needT()) T.forEach(function (o) {
              if (hasFlag(o, 'imm')) return;
              k = o.fx.length; o.fx = o.fx.filter(function (x) { return x.kind !== 'boost' && x.kind !== 'shield'; });
              if (o.fx.length < k) { hit.push(o); pop(o, NEG_POP.strip, 'bad'); o.stats.took++; r.stats.gave++; }
            });
            return hitMsg();
          case 'cling':
            if (!needT()) return '매달릴 상대가 없어 혼자 힘을 냅니다.';
            o2 = T[0];
            if (o2.x <= r.x || hasFlag(o2, 'imm')) { sb('dash', 1.4, 2.0 * mag); return josa(o2.name, '에게', '에게') + ' 매달리지 못해 그냥 달립니다.'; }
            addFx(r, { kind: 'buff', fx: 'cling', t: 1.3 * mag, m: 1, target: o2 }); lastHits = 1;
            return o2.name + '의 등에 찰싹 매달렸어요!';
          case 'reel':
            if (!needT()) return '따라붙을 상대가 없어 혼자 힘을 냅니다.';
            o2 = T[0];
            if (o2.x <= r.x) { sb('dash', 1.4, 2.0 * mag); return '이미 앞서 있어 그냥 달립니다.'; }
            addFx(r, { kind: 'buff', fx: 'reel', t: 0.5 * mag, m: 1, target: o2, noslow: true }); lastHits = 1; race.ev.push({ k: 'tongue', a: r.i, b: o2.i });
            return o2.name + '에게 줄을 걸고 끌려가듯 따라붙습니다!';
          case 'pin':
            if (needT()) T.forEach(function (o) { if (neg(o, { kind: 'slow', fx: 'net', m: 0.9, t: 4.0 * mag * ts })) { o2 = fxOf(o, 'net'); if (o2) o2.noboost = true; o.fx = o.fx.filter(function (x) { return x.kind !== 'boost'; }); } });
            return hitMsg();
          // ── 도움 ──
          case 'aid':
            T = tgList(r, e.tg || 'b1');
            T.concat([r]).forEach(function (o) { addFx(o, { kind: 'boost', fx: 'buddy', t: 2.5 * mag, m: 1.38 }); if (o !== r) { pop(o, '고마워!', 'good'); r.stats.helps++; race.ev.push({ k: 'buddy', a: r.i, b: o.i }); } });
            lastHits = T.length; return T.length ? josa(namesOf(T), '과', '와') + ' 함께 빨라집니다.' : '혼자서도 힘을 냅니다.';
          case 'guard':
            T = tgList(r, e.tg || 'b1');
            T.concat([r]).forEach(function (o) { addFx(o, { kind: 'shield', fx: 'shield', t: 8 * Math.sqrt(mag), m: 1 }); if (o !== r) { pop(o, '방패다!', 'good'); r.stats.helps++; } });
            sb('guard', 1.2, 2.0 * mag); lastHits = T.length; return T.length ? namesOf(T) + '에게도 방패를 씌워 줬어요.' : '방패를 둘렀어요.';
          case 'feed':
            T = tgList(r, e.tg || 'b1');
            T.forEach(function (o) { gaugeTo(o, 14 * mag); pop(o, '게이지 충전!', 'good'); r.stats.helps++; });
            gaugeTo(r, 9 * mag); sb('fresh', 1.2, 1.6 * mag); lastHits = T.length; return T.length ? namesOf(T) + '의 필살기 게이지를 채워 줬어요.' : '필살기 게이지를 채웠어요.';
          case 'tow':
            T = tgList(r, e.tg || 'last').filter(function (o) { return o.x < r.x; });
            T.forEach(function (o) { o.fx = o.fx.filter(function (x) { return x.kind !== 'stun' && x.kind !== 'slow'; }); warp(o, Math.min(o.x + 10 * mag, Math.max(o.x, r.x - 1.5))); pop(o, '고마워!', 'good'); r.stats.helps++; });
            sb('buddy', 1.35, 2.6 * mag); lastHits = T.length; return T.length ? josa(namesOf(T), '을', '를') + ' 앞으로 끌어 줬어요.' : '끌어 줄 동물이 없어 혼자 힘을 냅니다.';
          case 'heal':
            T = tgList(r, e.tg || 'near');
            T.concat([r]).forEach(function (o) { o.fx = o.fx.filter(function (x) { return x.kind !== 'stun' && x.kind !== 'slow'; }); o.sealT = 0; addFx(o, { kind: 'boost', fx: 'cheer', t: 2.0 * mag, m: 1.2 }); if (o !== r) { pop(o, '개운해!', 'good'); r.stats.helps++; } });
            lastHits = T.length; return T.length ? namesOf(T) + '에게 걸린 방해를 풀어 줬어요.' : '걸린 방해를 털어 냈어요.';
          // ── 트랙에 놓기 ──
          case 'peel':
            if (needT()) T.forEach(function (o) { newObj({ type: 'banana', lane: o.lane, x: Math.min(LEN - 6, o.x + 4 + o.v * 0.55), src: r, done: false }); });
            lastHits = T.length; return T.length ? namesOf(T) + ' 앞에 미끄러운 함정을 놓았어요.' : '놓을 곳이 없어 혼자 힘을 냅니다.';
          case 'mole':
            if (needT()) T.forEach(function (o) { newObj({ type: 'mole', lane: o.lane, x: Math.min(LEN - 6, o.x + rng.range(6, 10)), born: race.t, done: false }); });
            lastHits = T.length; return T.length ? namesOf(T) + ' 앞에 두더지 구멍이 생겼어요.' : '구멍 낼 곳이 없어 혼자 힘을 냅니다.';
          case 'slick': case 'hurdle':
            x0 = e.tg === 'front' ? (lead ? lead.x : r.x) + 13 : (e.tg === 'mid' ? medianX() + 8 : r.x - 2);
            x0 = clamp(x0, 14, LEN - 16);
            for (k = 0; k < (tier === 'ult' ? 2 : 1); k++) {
              o2 = e.op === 'hurdle' ? { type: 'hurdles', log: true, x: x0 + k * 18, done: {}, broken: {} }
                : { type: 'slick', mud: e.arg === 'mud', lake: e.arg === 'lake', fire: e.arg === 'fire', ink: e.arg === 'ink', src: r, x: x0 + k * 18, x1: x0 + k * 18 + 12, done: {} };
              o2.done[r.i] = true;           // 놓은 동물은 걸리지 않는다
              newObj(o2);
            }
            return (e.tg === 'front' ? '선두 앞' : (e.tg === 'mid' ? '무리 한가운데' : '바로 뒤')) + '에 ' + (e.op === 'hurdle' ? '통나무 허들' : SLICK_KO[e.arg || 'ice']) + '! 지나가는 동물은 조심하세요.';
          case 'wall':
            x0 = e.tg === 'front' && lead && lead !== r ? Math.min(LEN - 10, lead.x + 14) : r.x - 1.5;
            newObj({ type: 'dam', x: x0, until: race.t + 1.4 * mag + (x0 > r.x ? (x0 - r.x) / 12 : 0), src: r, hit: {} });
            sfx('crash'); return x0 > r.x ? '선두 앞에 벽이 생겼어요! 잠깐 아무도 못 지나가요.' : '뒤에 벽을 세웠어요! 뒤따르던 동물은 잠깐 막혀요.';
          case 'drop':
            if (needT()) T.forEach(function (o) { newObj({ type: 'meteor', x: clamp(o.x + o.v * 1.1 * 0.95, 5, LEN - 8), at: race.t + 1.1, dur: 1.1, rad: 4.5, stun: clamp(1.2 * mag * ts, 0.4, 3), push: 0, src: r, self: false, nut: true }); });
            lastHits = T.length; return T.length ? namesOf(T) + ' 머리 위로 뭔가 떨어집니다!' : '떨어뜨릴 곳이 없어 혼자 힘을 냅니다.';
          // ── 세상 바꾸기 ──
          case 'wx':
            if (race.weather.id !== e.arg) { x0 = race.weather.name; setWeather(e.arg); banner('wx_' + e.arg, '날씨가 바뀝니다!', x0 + ' → ' + race.weather.name); sfx('weather'); if (race.wxChangeAt !== null) race.wxChangeAt = Math.max(race.wxChangeAt, race.t + 14); }
            sb('power', 1.25, 2.4 * mag); return '날씨를 ' + josa(race.weather.name, '으로', '로') + ' 바꿨어요!';
          case 'terra':
            o2 = race.terrain[r.seg];
            sb('power', 1.2, 2.2 * mag);
            if (r.seg <= 0 || r.seg >= race.terrain.length - 1 || o2.type === e.arg) return '이 구간은 바꿀 수 없어 그냥 힘을 냅니다.';
            o2.type = e.arg; race.racers.forEach(function (q) { q.tmul = null; });
            race.ev.push({ k: 'terrain', type: e.arg, changed: true });
            return '이 구간이 ' + josa(TERR_KO[e.arg], '으로', '로') + ' 바뀌었어요!';
          case 'event': fireEvent(e.arg); return '';
        }
        throw new Error('모르는 효과: ' + e.op);
      }
      parts.forEach(function (e) { var m = runOne(e); if (m) out.push(m); });
      if (!selfish && !r.finished) sb(tier === 'ult' ? 'ultra' : 'dash', tier === 'ult' ? 1.6 : 1.3, tier === 'ult' ? 3.2 : 1.8);
      return { msg: out.join(' '), quick: quick, echo: usedEcho };
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
              if (res === 'hit') { o.gone = true; pop(r, '미끄덩~!', 'bad'); sfx('slip'); log('hit', r, josa(r.name, '이', '가') + (o.cube ? ' 네모 블록을 밟고 빙그르르!' : o.hole ? ' 구멍에 발이 빠져 빙그르르!' : o.egg ? ' 달걀을 밟고 빙그르르!' : ' 바나나 껍질을 밟고 빙그르르!')); }
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
          case 'dam':
            if (race.t < o.until && r !== o.src && r.prevX < o.x && r.x >= o.x && !hasFlag(r, 'air') && !hasFlag(r, 'imm')) {
              r.x = o.x - 0.3; r.v *= 0.3;
              if (!o.hit[r.i]) { o.hit[r.i] = true; pop(r, '댐에 막혔다!', 'bad'); }
            }
            break;
          case 'slick':
            if (!o.done[r.i] && r.prevX < o.x && r.x >= o.x) {
              o.done[r.i] = true;
              if (o.lake) {
                if (r.a.tr.water) { addFx(r, { kind: 'boost', fx: 'splash', t: 2.6, m: 1.45 }); pop(r, '물이다, 야호!', 'good'); }
                else { res = applyNeg(o.src || null, r, { kind: 'slow', fx: 'wet', t: 3.0, m: 0.6, ground: true }); if (res === 'hit') { pop(r, '첨벙첨벙…', 'bad'); log('hit', r, josa(r.name, '이', '가') + ' 호수에 빠져 허우적거려요!'); } }
                break;
              }
              if (o.fire) {
                res = applyNeg(o.src || null, r, { kind: 'stun', fx: 'sting', t: 0.9, ground: true });
                if (res === 'hit') { addFx(r, { kind: 'slow', fx: 'hot', t: 2.5, m: 0.75 }); pop(r, '앗 뜨거!', 'bad'); log('hit', r, josa(r.name, '이', '가') + ' 불길을 밟고 펄쩍 뛰어요!'); }
                break;
              }
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
    // ───────────── 필살기 ─────────────
    var ULT_BASE = 0.8;      // 1초에 차는 게이지 (100 이면 발동). 뒤처질수록 · 방해를 당할수록 빨리 찬다.
    function uBoost(q, fx, m, t, extra) {
      var e = { kind: 'boost', fx: fx, t: t, m: m };
      if (extra) for (var k in extra) e[k] = extra[k];
      addFx(q, e);
    }
    // 자리 옮기기 (결승선 바로 앞까지만)
    function warp(q, nx) {
      var from = q.x;
      q.x = clamp(nx, 0, LEN - 3); q.prevX = q.x;
      race.ev.push({ k: 'warp', r: q.i, from: from, to: q.x });
    }
    // 밀어내기 · 끌어당기기 : 무적이나 방패에 막히면 false
    function negWarp(src, q, nx, stunT, fx) {
      if (applyNeg(src, q, { kind: 'stun', fx: fx || 'spin', t: stunT || 0.5 }) !== 'hit') return false;
      warp(q, nx);
      return true;
    }
    function othersOf(r) { return race.racers.filter(function (o) { return o !== r && !o.finished; }); }
    function aheadAll(r) { return othersOf(r).filter(function (o) { return o.x > r.x; }).sort(function (p, q) { return p.x - q.x; }); }   // 가까운 순
    function namesOf(arr) { return shortNames(arr.map(function (o) { return o.name; })); }
    function medianX() { var xs = active().map(function (o) { return o.x; }).sort(function (p, q) { return p - q; }); return xs.length ? xs[Math.floor(xs.length / 2)] : 0; }
    function histAt(q, sec) {
      var want = race.t - sec, h = q.hist;
      for (var j = 0; j < h.length; j += 2) if (h[j] >= want) return h[j + 1];
      return h.length ? h[h.length - 1] : q.x;
    }
    function newObj(o) { o.id = race.objects.length; race.objects.push(o); return o; }

    // 필살기 발동 : 쓸 수 없는 상황이면 false 를 돌려주고 조금 기다린다
    // 방식별 덤 : 남을 방해하는 필살기는 쓰고 난 뒤 나도 조금 빨라진다 [배율, 초]
    var ULT_SB = {
      shrink: [1.75, 3.6], net: [1.75, 3.6], pullBack: [1.75, 3.6], backward: [1.75, 3.6], grab: [1.75, 3.6], meteor: [1.75, 3.6],
      freeze: [1.7, 3.4], gather: [1.7, 3.4], bomb: [1.7, 3.4],
      quake: [1.6, 3.2], block: [1.6, 3.2], blackhole: [1.6, 3.2], underdog: [1.6, 3.2], slowWorld: [1.6, 3.2], sleepAll: [1.6, 3.2],
      fear: [1.6, 3.2], rewind: [1.6, 3.2], shuffle: [1.6, 3.2], silence: [1.6, 3.2],
      storm: [1.5, 3], sweep: [1.5, 3], blind: [1.5, 3], crown: [1.5, 3], leap: [1.5, 3],
      stealItems: [1.45, 3], trapRain: [1.45, 3],
      reverse: [1.4, 3], timeStop: [1.4, 2.5], road: [1.4, 2.5], wave: [1.4, 2.5],
      pack: [1.35, 2.5], itemBurst: [1.3, 2.5], carry: [1.3, 2.5]
    };
    function castUlt(r, U, copied, dt) {
      if (U.ab) {
        log('ult', r, (copied ? '(따라 하기) ' : '') + josa(r.name, '이', '가') + ' 필살기 「' + U.name + '」! ' + execAb(r, U.ab, 'ult', r.ultN, 0).msg);
        return true;
      }
      if (!castUltCore(r, U, copied, dt)) return false;
      var sb = ULT_SB[U.kind];
      if (sb && !r.finished) uBoost(r, 'ultra', sb[0], sb[1]);
      return true;
    }
    function castUltCore(r, U, copied, dt) {
      var P = U.p || {}, me = (copied ? '(따라 하기) ' : '') + josa(r.name, '이', '가') + ' 필살기 「' + U.name + '」! ';
      var ah = aheadAll(r), ot = othersOf(r), lead = leaderOf(), hit = [], li, tg, d, res, cnt, k, x0;
      function say(msg) { log('ult', r, me + msg); }
      function wait() {
        r.ultWait += dt;
        if (r.ultWait < 8) return false;
        uBoost(r, 'dash', 1.8, 3.2, { imm: true });
        say('쓸 상대가 없어 혼자 전력 질주로 바꿨어요.');
        return true;
      }
      function topN(nn) { return ah.slice(-nn); }        // 앞선 동물 가운데 선두 쪽 nn 마리
      function sc(k) { return n <= 8 ? k : Math.max(k, Math.round(k * (n - 1) / 7)); }   // 참가가 많으면 대상 수도 같은 비율로 늘린다
      function neg(o, spec) { res = applyNeg(r, o, spec); if (res === 'hit') hit.push(o); return res === 'hit'; }
      function hitMsg(tail, none) { return hit.length ? josa(namesOf(hit), '이', '가') + ' ' + tail : (none || '하지만 모두 버텨 냈어요.'); }
      switch (U.kind) {
        case 'dash':
          d = Math.min(6, P.m + (P.rank ? P.rank * 7 * (rankAmongActive(r) - 1) / Math.max(1, ot.length) : 0));
          uBoost(r, P.fx || 'dash', 1 + (d - 1) * 0.8, P.t * 0.8, { imm: true, air: true, uncap: true });
          if (P.gift) sortedActive().filter(function (o) { return o !== r; }).slice(-sc(P.gift)).forEach(function (o) { uBoost(o, 'rocket', 1.9, 2.4); pop(o, '선물이다!', 'good'); r.stats.helps++; hit.push(o); });
          say(P.gift && hit.length ? josa(namesOf(hit), '도', '도') + ' 선물 로켓을 받았어요.' : '눈 깜짝할 사이에 저 앞으로!');
          return true;
        case 'leap':
          if (!ah.length) return wait();
          li = ah.filter(function (o) { return o.x - r.x <= 60; }).slice(0, sc(P.n || 3));
          if (!li.length) { warp(r, r.x + 45); r.hop = race.t; say('멀리 뛰어 따라붙어요.'); return true; }
          if (P.stun) li.forEach(function (o) { if (neg(o, { kind: 'stun', fx: 'trip', t: P.stun })) pop(o, '으악!', 'bad'); });
          warp(r, li[li.length - 1].x + 1.5); r.hop = race.t;
          uBoost(r, 'dash', 1.3, 1.5);
          say(li.length + '마리를 단숨에 뛰어넘었어요!' + (hit.length ? ' ' + josa(namesOf(hit), '은', '는') + ' 넘어졌어요.' : ''));
          return true;
        case 'swap':
          tg = P.who === 'randomAhead' ? (ah.length ? rng.pick(ah) : null) : (lead !== r ? lead : null);
          if (!tg) return wait();
          x0 = tg.x;
          if (negWarp(r, tg, r.x, 0.6)) { warp(r, x0); pop(tg, '어? 여긴 어디?', 'bad'); race.ev.push({ k: 'swap', a: r.i, b: tg.i }); sfx('swap'); say(josa(tg.name, '과', '와') + ' 자리가 바뀌었어요!'); }
          else { uBoost(r, 'dash', 1.7, 2.6); say(josa(tg.name, '이', '가') + ' 막아 냈어요. 대신 힘껏 달려요.'); }
          return true;
        case 'hibernate':
          addFx(r, { kind: 'stun', fx: P.fx || 'sleep', t: P.sleep, m: 0, onEnd: function () { if (!r.finished) { uBoost(r, 'power', P.m - 0.1, P.t * 0.9, { imm: true }); pop(r, '힘이 넘친다!', 'good'); sfx('boost'); } } });
          say('잠깐 멈췄다가 무섭게 질주할 거예요.');
          return true;
        case 'gamble':
          if (rng.chance(P.p)) { warp(r, r.x + P.win); r.hop = race.t; uBoost(r, 'dash', 1.3, 1.5); pop(r, '대성공!', 'good'); say('대성공! ' + P.win + 'm 앞으로 나갔어요.'); }
          else { warp(r, r.x - P.lose); addFx(r, { kind: 'stun', fx: 'trip', t: 0.9, m: 0 }); pop(r, '꽝…', 'bad'); say('이런, 꽝! ' + P.lose + 'm 뒤로 밀렸어요.'); }
          return true;
        case 'surge':
          uBoost(r, P.fx || 'sprint', P.m, P.t, { noslow: true });
          say('오래오래 질주합니다.');
          return true;
        case 'giant':
          uBoost(r, 'giant', P.m, P.t, { imm: true, onEnd: function () { r.bumped = null; } });
          r.bumped = {};
          say('엄청나게 커졌어요! 부딪치면 휘청거려요.');
          return true;
        case 'ghost':
          uBoost(r, P.fx || 'illusion', 1 + (P.m - 1) * 0.85, P.t, { imm: true, air: true });
          if (P.refund) r.ultRefund = P.refund;
          say('한동안 어떤 방해도 통하지 않아요.');
          return true;
        case 'ride':
          if (!lead || lead === r) return wait();
          tg = lead;
          if (tg.x - r.x > 34) { tg = null; ah.forEach(function (o) { if (o.x - r.x <= 34) tg = o; }); }      // ah 는 가까운 순 → 닿는 범위에서 가장 앞선 동물
          if (!tg) return wait();
          warp(r, tg.x - 2);
          addFx(r, { kind: 'buff', fx: 'cling', t: P.t * 0.5, target: tg, onEnd: (function (q) { return function () { if (!r.finished && !q.finished) { warp(r, q.x + 1.5); r.hop = race.t; uBoost(r, 'dash', 1.3, 1.2); } }; })(tg) });
          pop(tg, '누가 업혔어?', 'bad');
          say(tg.name + ' 등에 올라탔어요. 곧 앞으로 뛰어내려요.');
          return true;
        case 'charge':
          uBoost(r, P.fx || 'charge', 1 + (P.m - 1) * 0.75, P.t * 0.75, { imm: true, uncap: true, air: !!P.air });
          r.charge = { push: P.push || 0, stun: P.stun || 0.8, hit: {}, until: race.t + P.t * 0.75 + 0.4 };
          say('부딪치는 동물은 뒤로 날아가요!');
          return true;
        case 'pullBack':
          if (!ah.length) return wait();
          li = P.near ? ah.slice(0, sc(P.n || 1)) : topN(sc(P.n || 1));
          x0 = Infinity; active().forEach(function (o) { if (o.x < x0) x0 = o.x; });
          li.forEach(function (o) {
            var nx = P.toLast ? x0 - 3 : (P.behindMe ? r.x - P.behindMe : o.x - P.d * 1.3);
            if (negWarp(r, o, nx, P.stun || 0.6, P.fx)) { hit.push(o); pop(o, '으아아~', 'bad'); }
          });
          sfx('throw');
          say(hitMsg(P.toLast ? '맨 뒤로 날아갔어요!' : '뒤로 밀려났어요!'));
          return true;
        case 'rewind':
          li = P.who === 'all' ? ot : (P.who === 'leader' ? (lead && lead !== r ? [lead] : []) : ah);
          if (!li.length) return wait();
          li.forEach(function (o) { var hx = histAt(o, P.sec); if (hx < o.x - 1 && negWarp(r, o, hx, 0.3)) hit.push(o); });
          race.ev.push({ k: 'tstop', t: 0.6 });
          say(hitMsg(P.sec + '초 전 자리로 돌아갔어요!'));
          return true;
        case 'freeze':
          li = P.any ? ot.sort(function (p, q) { return Math.abs(p.x - r.x) - Math.abs(q.x - r.x); }).slice(0, sc(P.n)) : ah;
          if (!li.length) return wait();
          li.forEach(function (o) { if (neg(o, { kind: 'stun', fx: 'ice', t: P.t * 1.25 })) pop(o, '꽁꽁!', 'bad'); });
          say(hitMsg('꽁꽁 얼었어요!'));
          return true;
        case 'meteor':
          li = ah.length ? topN(P.r > 10 ? P.n : sc(P.n)) : ot.slice(0, P.n);
          if (!li.length) return wait();
          li.forEach(function (o) { newObj({ type: 'meteor', x: clamp(o.x + o.v * P.delay * 0.92, 5, LEN - 8), at: race.t + P.delay, dur: P.delay, rad: P.r, stun: P.stun, push: P.push || 0, src: r, self: !!P.self, nut: !!P.nut }); });
          say(P.nut ? '코코넛이 떨어집니다, 머리 조심!' : '하늘에서 운석이 떨어집니다! 피하세요!');
          return true;
        case 'shrink':
          if (!ah.length) return wait();
          topN(sc(P.n)).forEach(function (o) { if (neg(o, { kind: 'slow', fx: P.fx || 'tiny', t: P.t, m: P.m })) pop(o, P.fx ? '으으, 독이…' : '몸이 작아졌어!', 'bad'); });
          say(hitMsg(P.fx ? '독이 퍼져 느려졌어요.' : '조그맣게 줄어들었어요.'));
          return true;
        case 'net':
          if (!ah.length) return wait();
          topN(sc(P.n)).forEach(function (o) { if (neg(o, { kind: 'stun', fx: 'net', t: P.t * 1.3 })) pop(o, '꼼짝 못 하겠어!', 'bad'); });
          say(hitMsg('붙잡혔어요!'));
          return true;
        case 'crown':
          race.curse = { until: race.t + P.t, src: r, m: P.m };
          uBoost(r, 'dash', 1.3, 3);
          say('지금부터 1등으로 달리는 동물은 계속 느려집니다!');
          return true;
        case 'reel':
          if (!lead || lead === r) return wait();
          addFx(r, { kind: 'buff', fx: 'reel', t: P.t * 0.85, target: lead, noslow: true,
            onEnd: P.bite ? function () { if (!r.finished && !lead.finished && Math.abs(lead.x - r.x) < 6 && applyNeg(r, lead, { kind: 'stun', fx: 'trip', t: P.bite }) === 'hit') pop(lead, '덥석! 아야!', 'bad'); } : null });
          say(lead.name + '에게 줄처럼 끌려갑니다.');
          return true;
        case 'drain':
          if (!ah.length) return wait();
          topN(sc(P.n)).forEach(function (o) { if (neg(o, { kind: 'slow', fx: 'tired', t: P.t, m: P.m })) pop(o, '힘이 빠져…', 'bad'); });
          uBoost(r, 'power', 1.25 + P.gain * hit.length, P.t);
          say(hitMsg('기운을 빼앗겼어요.'));
          return true;
        case 'silence':
          ot.forEach(function (o) { if (!hasFlag(o, 'imm')) { o.sealT = P.t; hit.push(o); } });
          uBoost(r, 'sprint', P.selfM || 1.3, 4.5);
          race.ev.push({ k: 'howl', r: r.i });
          say('다른 동물은 ' + P.t + '초 동안 스킬과 필살기를 못 써요.');
          return true;
        case 'bomb':
          tg = lead && lead !== r ? lead : (ot.length ? rng.pick(ot) : null);
          if (!tg) return wait();
          race.bomb = { holder: tg, until: race.t + P.t, dur: P.t, hopAt: race.t + 0.8, src: r, safe: race.t + 2.5, stun: P.stun };
          pop(tg, '폭탄이다!', 'bad');
          say(tg.name + '에게 폭탄이 붙었어요. 가까이 가면 옮겨붙어요!');
          return true;
        case 'stealGauge':
          cnt = 0;
          ot.forEach(function (o) { if (!hasFlag(o, 'imm') && o.ult > 15) { o.ult *= 0.35; o.ultReady = false; cnt++; o.stats.took++; pop(o, '게이지가 줄었어!', 'bad'); proj('steal', o, r); } });
          r.stats.gave += cnt;
          uBoost(r, 'star', 1.5, Math.min(6, 2 + 0.5 * cnt), { imm: true });
          say(cnt + '마리의 필살기 게이지를 훔쳐 무적으로 달려요!');
          return true;
        case 'reverse':
          li = active();
          if (li.length < 2 || rankAmongActive(r) <= Math.ceil(li.length / 2)) return wait();
          x0 = Infinity; d = -Infinity;
          li.forEach(function (o) { if (o.x < x0) x0 = o.x; if (o.x > d) d = o.x; });
          k = n <= 8 ? 1e9 : Math.max(22, 60 - (n - 8) * 2.5);        // 참가가 많으면 한 번에 옮겨지는 거리를 줄인다
          li.forEach(function (o) { o.fx = o.fx.filter(function (e) { return e.fx !== 'cling' && e.fx !== 'reel'; }); warp(o, clamp(x0 + d - o.x, o.x - k, o.x + k)); });
          race.ev.push({ k: 'flip' });
          say('세상이 뒤집혔어요! 1등이 꼴찌, 꼴찌가 1등!');
          return true;
        case 'shuffle':
          if (P.pairs) {
            li = ot.filter(function (o) { return !hasFlag(o, 'imm'); });
            for (k = 0; k < sc(P.pairs) && li.length >= 2; k++) {
              var a1 = rng.pick(li), b1 = rng.pick(li.filter(function (o) { return o !== a1; }));
              x0 = a1.x; warp(a1, b1.x); warp(b1, x0);
              race.ev.push({ k: 'swap', a: a1.i, b: b1.i });
              hit.push(a1, b1);
            }
            if (!hit.length) return wait();
            uBoost(r, 'dash', 1.5, 3);
            sfx('swap');
            say(josa(namesOf(hit), '의', '의') + ' 자리가 뒤바뀌었어요!');
            return true;
          }
          li = sortedActive().filter(function (o) { return o !== r && !hasFlag(o, 'imm'); }).slice(0, sc(P.n));
          li.push(r);
          if (li.length < 3) return wait();
          var xs = li.map(function (o) { return o.x; });
          for (k = xs.length - 1; k > 0; k--) { var j2 = Math.floor(rng.next() * (k + 1)), tmp = xs[k]; xs[k] = xs[j2]; xs[j2] = tmp; }
          li.forEach(function (o, q) { if (Math.abs(xs[q] - o.x) > 0.01) warp(o, xs[q]); });
          sfx('swap');
          say(josa(namesOf(li), '의', '의') + ' 자리가 뒤죽박죽 섞였어요!');
          return true;
        case 'blackhole':
          x0 = P.center === 'median' ? medianX() : r.x;
          ot.forEach(function (o) {
            var nx = o.x + (x0 - o.x) * P.k;
            if (nx < o.x - 0.5) { if (negWarp(r, o, nx, 0.4)) hit.push(o); }
            else if (nx > o.x + 0.5) { warp(o, nx); r.stats.helps++; }
          });
          if (P.center === 'median') warp(r, r.x + (x0 - r.x) * P.k + 2);
          race.ev.push({ k: 'hole', x: x0 });
          say('모두가 한곳으로 빨려 왔어요!');
          return true;
        case 'gather':
          li = ah.filter(function (o) { return o.x - r.x <= P.R; });
          if (!li.length) return wait();
          li.forEach(function (o) { if (negWarp(r, o, r.x + rng.range(0.5, 3.5), 0.5)) { hit.push(o); pop(o, '끌려간다~', 'bad'); } });
          say(hitMsg('옆으로 끌려왔어요!'));
          return true;
        case 'wave':
          newObj({ type: 'wave', x: r.x - 60, v: 42, endX: r.x + 230, src: r, hit: {} });
          uBoost(r, 'slide', 1.6, 3.6, { gnd: true, noslow: true });
          sfx('wind');
          say('큰 물살이 밀려옵니다! 물을 좋아하는 동물만 신나요.');
          return true;
        case 'stampede':
          newObj({ type: 'herd', x: r.x - 50, v: 34, endX: r.x + 170, src: r, hit: {}, animal: r.a.id });
          uBoost(r, 'charge', 1.6, 3.6, { imm: true });
          say('떼가 몰려옵니다! 길 비켜요!');
          return true;
        case 'quake':
          ot.forEach(function (o) { if (neg(o, { kind: 'stun', fx: 'trip', t: P.t * 1.3, ground: true })) pop(o, '흔들흔들 꽈당!', 'bad'); });
          race.ev.push({ k: 'roar', r: r.i }); race.ev.push({ k: 'shake' }); sfx('thunder');
          say(hitMsg('넘어졌어요!'));
          return true;
        case 'slowWorld':
          ot.forEach(function (o) { neg(o, { kind: 'slow', fx: 'slowmo', t: P.t * 1.2, m: P.m }); });
          race.ev.push({ k: 'slowmo', r: r.i });
          say(hitMsg('느릿느릿해졌어요.'));
          return true;
        case 'sleepAll':
          ot.forEach(function (o) { if (neg(o, { kind: 'stun', fx: 'sleep', t: P.t * 1.25 })) pop(o, '쿨쿨…', 'bad'); });
          sfx('lullaby');
          say(hitMsg('스르르 잠들었어요.'));
          return true;
        case 'storm':
          li = sortedActive().filter(function (o) { return o !== r; });
          li = li.map(function (o, q) { return [q + rng.next() * li.length * 0.9, o]; }).sort(function (p, q) { return p[0] - q[0]; }).slice(0, sc(P.n)).map(function (p) { return p[1]; });
          if (!li.length) return wait();
          li.forEach(function (o) {
            if (P.bolt) race.ev.push({ k: 'lightning', r: o.i }); else if (P.ball) race.ev.push({ k: 'ball', from: r.i, to: o.i }); else if (P.proj) proj(P.proj, r, o);
            if (neg(o, P.kind === 'slow' ? { kind: 'slow', fx: P.fx, t: P.t, m: P.m } : { kind: 'stun', fx: P.fx || 'zap', t: P.t })) pop(o, '으악!', 'bad');
          });
          if (P.bolt) sfx('thunder');
          uBoost(r, 'dash', 1.35, 3);
          say(hitMsg('당했어요!'));
          return true;
        case 'trapRain':
          li = ah.length ? ah.slice(-Math.min(sc(P.n), ah.length)) : [];
          li.forEach(function (o) { newObj({ type: 'banana', lane: o.lane, x: Math.min(LEN - 6, o.x + rng.range(7, 16)), src: r, egg: P.what === 'egg', cube: P.what === 'cube', hole: P.what === 'hole' }); });
          for (k = li.length; k < sc(P.n); k++) newObj({ type: 'banana', lane: 1 + Math.floor(rng.next() * n), x: Math.min(LEN - 6, (lead ? lead.x : r.x) + rng.range(10, 45)), src: r, egg: P.what === 'egg', cube: P.what === 'cube', hole: P.what === 'hole' });
          race.objects.forEach(function (o) { if (o.type === 'banana' && o.src === r && o.lane === r.lane) o.done = true; });
          uBoost(r, 'dash', 1.4, 3);
          sfx('throw');
          say('트랙 곳곳에 함정이 깔렸어요. 발밑 조심!');
          return true;
        case 'dam':
          x0 = lead && lead !== r ? Math.min(LEN - 10, lead.x + 14) : r.x - 5;
          newObj({ type: 'dam', x: x0, until: race.t + P.t + (x0 - r.x > 0 ? (x0 - r.x) / 12 : 0), src: r, hit: {} });
          uBoost(r, 'dash', 1.4, 3, { air: true });
          sfx('crash');
          say('트랙에 댐이 생겼어요! 잠깐 아무도 못 지나가요.');
          return true;
        case 'weather':
          if (race.weather.id !== P.to) { var pv = race.weather.name; setWeather(P.to); banner('wx_' + P.to, '날씨가 바뀝니다!', pv + ' → ' + race.weather.name); sfx('weather'); }
          uBoost(r, 'power', 1 + (P.m - 1) * 0.6, P.t * 0.8);
          if (P.lost) ot.forEach(function (o) { neg(o, { kind: 'slow', fx: 'lost', t: P.lost, m: 0.62 }); });
          if (P.freeze) ot.sort(function (p, q) { return Math.abs(p.x - r.x) - Math.abs(q.x - r.x); }).slice(0, sc(P.freeze)).forEach(function (o) { if (neg(o, { kind: 'stun', fx: 'ice', t: 1.9 })) pop(o, '꽁꽁!', 'bad'); });
          say('날씨를 ' + josa(race.weather.name, '으로', '로') + ' 바꿨어요!' + (hit.length ? ' ' + josa(namesOf(hit), '은', '는') + ' 정신을 못 차려요.' : ''));
          return true;
        case 'underdog':
          li = sortedActive();
          li.slice(-sc(P.n)).concat(li.indexOf(r) < li.length - sc(P.n) ? [r] : []).forEach(function (o) { uBoost(o, 'rocket', P.m, P.t); if (o !== r) { pop(o, '힘이 솟는다!', 'good'); r.stats.helps++; hit.push(o); } });
          li.slice(0, 2).forEach(function (o) { if (o !== r) applyNeg(r, o, { kind: 'slow', fx: 'scared', t: 2.2, m: 0.8, minor: true }); });
          sfx('cheer');
          say(hit.length ? josa(namesOf(hit), '도', '도') + ' 함께 치고 나갑니다!' : '혼자서도 치고 나갑니다!');
          return true;
        case 'pack':
          li = ot.filter(function (o) { return o.a.cat === r.a.cat; });
          uBoost(r, P.fx || 'dash', Math.min(2.1, P.base + 0.1 + P.per * li.length), P.t, P.fx === 'fly' ? { air: true } : null);
          li.forEach(function (o) { uBoost(o, 'cheer', 1.25, 3); r.stats.helps++; });
          race.ev.push({ k: 'howl', r: r.i });
          say(li.length ? '같은 무리 ' + li.length + '마리와 함께 힘을 냅니다!' : '혼자서도 씩씩하게 달려요.');
          return true;
        case 'mimic':
        case 'roulette':
          if (U.kind === 'mimic' && race.lastUlt && race.lastUlt !== r.a.id) r.mimicId = race.lastUlt;
          if (!r.mimicId) {
            li = ANIMALS.filter(function (o) { return o.ult.kind !== 'mimic' && o.ult.kind !== 'roulette'; });
            r.mimicId = rng.pick(li).id;
          }
          tg = ANIMAL_BY_ID[r.mimicId].ult;
          if (tg.kind === 'mimic' || tg.kind === 'roulette') { r.mimicId = null; return false; }
          if (!castUlt(r, { name: U.name + ' → ' + tg.name, kind: tg.kind, p: tg.p, ab: tg.ab }, U.kind === 'mimic', dt)) return false;
          r.mimicId = null;
          return true;
        case 'timeStop':
          ot.forEach(function (o) { neg(o, { kind: 'stun', fx: 'stop', t: P.t * 1.25 }); });
          race.ev.push({ k: 'tstop', t: P.t * 1.25 });
          say('다른 동물들의 시간이 멈췄어요!');
          return true;
        case 'mirror':
          uBoost(r, 'thorns', 1 + (P.m - 1) * 0.8, P.t, { imm: true, thorns: true });
          say('방해하는 동물이 오히려 당해요.');
          return true;
        case 'spikeBurst':
          ot.forEach(function (o) { if (Math.abs(o.x - r.x) <= P.R && neg(o, { kind: 'stun', fx: 'sting', t: P.stun })) pop(o, '앗 따가!', 'bad'); });
          uBoost(r, 'thorns', 1.3, P.t, { imm: true, thorns: true });
          say(hitMsg('가시에 찔렸어요!', '가시투성이가 되어 달려요.'));
          return true;
        case 'carry':
          li = sortedActive().filter(function (o) { return o !== r; });
          tg = li.length ? li[li.length - 1] : null;
          if (tg && tg.x < r.x - 2) { tg.fx = tg.fx.filter(function (e) { return e.kind !== 'stun' && e.kind !== 'slow'; }); warp(tg, r.x - 2.5); uBoost(tg, 'fly', 3.0, 1.3, { imm: true, air: true, uncap: true }); pop(tg, '날아간다~!', 'good'); r.stats.helps++; }
          else tg = null;
          uBoost(r, 'fly', 3.0, 1.3, { imm: true, air: true, uncap: true });
          say(tg ? '꼴찌였던 ' + josa(tg.name, '을', '를') + ' 물고 함께 날아갑니다!' : '혼자 훨훨 날아갑니다.');
          return true;
        case 'fear':
          ot.forEach(function (o) { neg(o, { kind: 'stun', fx: P.fx || 'pity', t: (Math.abs(o.x - r.x) <= P.R ? P.tNear : P.t) * 1.3 }); });
          race.ev.push({ k: P.fx === 'charm' ? 'charm' : 'roar', r: r.i });
          say(hitMsg(P.fx === 'charm' ? '넋을 잃고 멈춰 섰어요.' : '그 자리에 얼어붙었어요.'));
          return true;
        case 'rescue':
          r.fx = r.fx.filter(function (e) { return e.kind !== 'slow' && e.kind !== 'stun'; });
          li = active();
          if (rankAmongActive(r) > Math.ceil(li.length / 2)) { warp(r, medianX() + 2); r.hop = race.t; uBoost(r, 'dash', 1.5, 3, { imm: true }); say('무리 한가운데로 돌아왔어요!'); }
          else { uBoost(r, 'dash', 1.7, 3.5, { imm: true }); say('홀가분하게 달려 나갑니다.'); }
          return true;
        case 'sweep':
          ot.forEach(function (o) { if (Math.abs(o.x - r.x) <= P.R && negWarp(r, o, o.x - P.push, P.stun || 0.7)) { hit.push(o); pop(o, '으아아~', 'bad'); } });
          uBoost(r, 'dash', 1.4, 3);
          race.ev.push({ k: 'roar', r: r.i });
          say(hitMsg('뒤로 튕겨 나갔어요!', '주변에 아무도 없지만 기세가 올라요.'));
          return true;
        case 'road':
          tg = { type: 'slick', mud: P.type === 'mud', lake: P.type === 'lake', fire: P.type === 'fire', src: r, done: {} };
          tg.x = P.behind ? r.x - P.len : r.x + 3; tg.x1 = tg.x + P.len;
          tg.done[r.i] = true;
          if (P.behind) race.racers.forEach(function (o) { if (o.x >= tg.x) tg.done[o.i] = true; });
          newObj(tg);
          uBoost(r, 'slide', P.m, P.t, { gnd: true });
          say({ ice: '앞길이 빙판이 됐어요!', mud: '앞길이 진흙탕이 됐어요!', lake: '앞길이 호수가 됐어요!', fire: '지나온 길이 불바다가 됐어요!' }[P.type]);
          return true;
        case 'blind':
          li = P.dir === 'ahead' ? ah : ot;
          if (!li.length) return wait();
          li.forEach(function (o) { neg(o, { kind: 'slow', fx: P.fx, t: P.t, m: P.m }); });
          if (P.night) race.ev.push({ k: 'night' });
          if (P.fx === 'stink') race.ev.push({ k: 'stink', r: r.i });
          uBoost(r, 'dash', 1.35, 3);
          say(hitMsg('앞을 제대로 못 봐요.'));
          return true;
        case 'block':
          race.blockers.push({ r: r, until: race.t + P.t });
          addFx(r, { kind: 'buff', fx: 'block', t: P.t, noslow: true });
          uBoost(r, 'dash', 1.2, P.t);
          say(P.t + '초 동안 뒤에서 아무도 못 지나갑니다!');
          return true;
        case 'grab':
          if (!lead || lead === r) return wait();
          if (neg(lead, { kind: 'stun', fx: 'net', t: P.t * 1.3 })) { pop(lead, '놔 줘~!', 'bad'); warp(r, Math.max(r.x, lead.x - 12)); }
          addFx(r, { kind: 'stun', fx: 'pity', t: P.self * 0.6, m: 0 });
          say(hit.length ? josa(lead.name, '을', '를') + ' 꽉 붙잡았어요!' : josa(lead.name, '이', '가') + ' 빠져나갔어요.');
          return true;
        case 'backward':
          if (!ah.length) return wait();
          topN(sc(P.n)).forEach(function (o) {
            if (!neg(o, { kind: 'stun', fx: 'charm', t: P.t })) return;
            for (k = 0; k < o.fx.length; k++) if (o.fx[k].fx === 'charm') o.fx[k].back = P.v;
            pop(o, '몸이 뒤로 간다…', 'bad');
          });
          say(hitMsg('최면에 걸려 뒤로 걸어가요!'));
          return true;
      }
      return true;
    }

    function tickUlt(r, dt) {
      if (race.t - r.histT >= 0.25) { r.histT = race.t; r.hist.push(race.t, r.x); if (r.hist.length > 72) r.hist.splice(0, 2); }
      if (race.t < 6) return;
      var U = r.a.ult;
      if (!r.ultReady) {
        if (r.ult < 100) {
          var na = race.racers.length - race.finished;
          var f = na > 1 ? clamp((r.rank - 1 - race.finished) / (na - 1), 0, 1) : 0;
          r.ult += dt * ULT_BASE * r.ultRate * U.ch * r.ultCh / race.ultDiv * (1 + 0.9 * f);
        }
        if (r.ult < 100) return;
        r.ult = 100; r.ultReady = true; r.ultSince = race.t; r.ultWait = 0;
        race.ev.push({ k: 'ultready', r: r.i });
        return;
      }
    }

    // ───────────── 무대 : 스킬 · 필살기 · 사건은 한 번에 하나씩 ─────────────
    var GAPK = n > 12 ? 0.85 : 1;       // 참가가 많으면 장면 사이를 조금 좁힌다
    var STAGE_GAP = { skill: 3.0 * GAPK, ult: 4.0 * GAPK, event: 3.2 * GAPK };
    function takeStage(kind, r, name, extra) {
      race.stageFree = race.t + STAGE_GAP[kind];
      race.acts++;
      var e = { k: 'act', kind: kind, r: r ? r.i : -1, name: name };
      if (extra) for (var k in extra) e[k] = extra[k];
      race.ev.push(e);
    }
    function canAct(r) {
      if (r.finished || stunned(r) || r.sealT > 0 || r.x > LEN - 14 || r.x < 12) return false;
      for (var j = 0; j < r.fx.length; j++) if (r.fx[j].fx === 'cling' || r.fx[j].uncap) return false;
      return true;
    }
    function director() {
      if (race.t < race.stageFree) return;
      var cand = race.racers.filter(canAct), k, r, at, na = race.racers.length - race.finished;
      if (!cand.length) return;
      // 1) 필살기 : 게이지가 먼저 찬 동물부터
      var u = cand.filter(function (q) { return q.ultReady; }).sort(function (p, q) { return p.ultSince - q.ultSince; });
      for (k = 0; k < u.length && k < 3; k++) {
        r = u[k]; at = race.ev.length;
        if (!castUlt(r, r.a.ult, false, 2.5)) continue;
        race.ev.splice(at, 0, { k: 'act', kind: 'ult', r: r.i, name: r.a.ult.name, id: r.a.id }, { k: 'ult', r: r.i, name: r.a.ult.name, id: r.a.id });
        sfx('ult');
        r.ult = r.ultRefund || 0; r.ultRefund = 0; r.ultReady = false; r.ultN++; r.stats.ults++;
        race.lastUlt = r.a.id;
        race.stageFree = race.t + STAGE_GAP.ult; race.acts++;
        return;
      }
      // 2) 스킬 : 준비된 동물 가운데, 오래 기다렸거나 뒤처진 동물이 더 잘 뽑힌다
      var s2 = cand.filter(function (q) { return q.skillT <= 0; });
      for (k = 0; k < 3 && s2.length; k++) {
        r = rng.weighted(s2.map(function (q) { return [q, (1 + Math.min(8, -q.skillT) * 0.4 + (na > 1 ? (q.rank - 1) / (na - 1) : 0) * 1.5) * (q.stats.skills + q.stats.ults === 0 ? 2.5 : 1)]; }));
        var w = rng.chance(0.5) ? 1 : 2;
        at = race.ev.length;
        if (castSkill(r, 1.5, r.a.id, false, w) || castSkill(r, 1.5, r.a.id, false, 3 - w)) {
          var nm2 = null;
          for (var q2 = at; q2 < race.ev.length; q2++) if (race.ev[q2].k === 'skill' && race.ev[q2].r === r.i) { nm2 = race.ev[q2].name; break; }
          race.ev.splice(at, 0, { k: 'act', kind: 'skill', r: r.i, name: nm2 || r.a.skill.name, id: r.a.id });
          race.stageFree = race.t + STAGE_GAP.skill; race.acts++;
          return;
        }
        r.skillT = 1.5;
        s2 = s2.filter(function (q) { return q !== r; });
      }
    }

    // 돌진 필살기에 부딪친 동물
    function chargeBumps(r) {
      var c = r.charge;
      if (!c) return;
      if (race.t > c.until) { r.charge = null; return; }
      race.racers.forEach(function (o) {
        if (o === r || o.finished || c.hit[o.i]) return;
        if (Math.abs(o.x - r.x) < 1.9 && r.v > o.v + 2) {
          c.hit[o.i] = true;
          if (c.push ? negWarp(r, o, o.x - c.push, c.stun) : applyNeg(r, o, { kind: 'stun', fx: 'spin', t: c.stun }) === 'hit') pop(o, '으아아~ 날아간다!', 'bad');
        }
      });
    }

    // 필살기가 남긴 것들 : 저주 · 폭탄 · 운석 · 물살 · 떼
    function updateUltWorld(dt) {
      var c = race.curse, b = race.bomb, q, j, o;
      if (c) {
        if (race.t >= c.until) race.curse = null;
        else { q = leaderOf(); if (q && q !== c.src && !hasFlag(q, 'imm')) addFx(q, { kind: 'slow', fx: 'crown', t: 0.3, m: c.m }); }
      }
      if (b) {
        if (b.holder.finished) { q = leaderOf(); if (q) b.holder = q; else { race.bomb = b = null; } }
        if (b && race.t >= b.until) {
          race.ev.push({ k: 'boom', x: b.holder.x, r: b.holder.i });
          sfx('crash');
          if (negWarp(b.src, b.holder, b.holder.x - 12, b.stun)) { pop(b.holder, '펑!!', 'bad'); log('hit', b.holder, '펑! 폭탄이 ' + b.holder.name + '에게서 터졌어요!'); }
          race.racers.forEach(function (o2) { if (o2 !== b.holder && !o2.finished && Math.abs(o2.x - b.holder.x) < 6) applyNeg(b.src, o2, { kind: 'stun', fx: 'spin', t: 0.7, minor: true }); });
          race.bomb = null;
        } else if (b && race.t >= b.hopAt) {
          q = null;
          race.racers.forEach(function (o2) {
            if (o2 === b.holder || o2.finished || (o2 === b.src && race.t < b.safe)) return;
            var d2 = Math.abs(o2.x - b.holder.x);
            if (d2 < 2.4 && (!q || d2 < Math.abs(q.x - b.holder.x))) q = o2;
          });
          if (q) { b.holder = q; b.hopAt = race.t + 0.7; pop(q, '폭탄이 왔다!', 'bad'); race.ev.push({ k: 'bombhop', r: q.i }); sfx('pop'); }
        }
      }
      if (race.blockers.length) race.blockers = race.blockers.filter(function (k) { return race.t < k.until && !k.r.finished; });
      for (j = 0; j < race.objects.length; j++) {
        o = race.objects[j];
        if (o.gone) continue;
        if (o.type === 'meteor') {
          if (race.t < o.at) continue;
          o.gone = true;
          race.ev.push({ k: 'boom', x: o.x, big: o.rad > 10 }); race.ev.push({ k: 'shake' }); sfx('crash');
          (function (m) {
            var got = [];
            race.racers.forEach(function (o2) {
              if (o2.finished || Math.abs(o2.x - m.x) > m.rad || (o2 === m.src && !m.self)) return;
              if (m.push ? negWarp(m.src, o2, o2.x - m.push, m.stun, 'trip') : applyNeg(m.src, o2, { kind: 'stun', fx: 'bonk2', t: m.stun }) === 'hit') { got.push(o2); pop(o2, m.nut ? '콩! 아야' : '쾅!!', 'bad'); }
            });
            log('hit', null, (m.nut ? '코코넛이 떨어졌어요! ' : '운석이 떨어졌어요! ') + (got.length ? josa(namesOf(got), '이', '가') + ' 맞았어요.' : '다행히 아무도 안 맞았어요.'));
          })(o);
        } else if (o.type === 'wave' || o.type === 'herd') {
          var px = o.x;
          o.x += o.v * dt;
          (function (w) {
            race.racers.forEach(function (o2) {
              if (o2.finished || w.hit[o2.i] || o2.x < px || o2.x > w.x) return;
              w.hit[o2.i] = true;
              if (o2 === w.src) return;
              if (w.type === 'wave') {
                if (o2.a.tr.water) { uBoost(o2, 'splash', 1.5, 2.6); pop(o2, '파도타기다!', 'good'); }
                else if (applyNeg(w.src, o2, { kind: 'slow', fx: 'wet', t: 2.6, m: 0.55 }) === 'hit') { o2.x = Math.max(0, o2.x - 5); o2.prevX = o2.x; pop(o2, '어푸어푸!', 'bad'); }
              } else if (o2.a.tr.heavy) pop(o2, '끄떡없음!', 'good');
              else if (applyNeg(w.src, o2, { kind: 'stun', fx: 'trip', t: 1.3 }) === 'hit') pop(o2, '으악, 밟힌다!', 'bad');
            });
          })(o);
          if (o.x > o.endX || o.x > LEN + 30) o.gone = true;
        } else if (o.type === 'dam' && race.t >= o.until) { o.gone = true; race.ev.push({ k: 'boom', x: o.x, small: true }); }
      }
    }

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
      var seg = Math.min(9, Math.floor(r.x / 100));
      while (r.seg < race.terrain.length - 1 && r.x >= race.terrain[r.seg].x1) r.seg++;
      while (r.seg > 0 && r.x < race.terrain[r.seg].x0) r.seg--;
      if (!r.tmul) r.tmul = race.terrain.map(function (g) { return terrainMul(a, g.type); });
      var free = hasFlag(r, 'allterr');          // 지형 · 날씨의 불이익을 받지 않는 상태
      var base = (a.speed + r.tune) * r.cond * r.form[seg] * (1 + r.noise) * (free ? Math.max(1, r.tmul[r.seg]) : r.tmul[r.seg]);
      var gap = race.leadX - r.x;
      if (gap > 0) base *= 1 + Math.min(gap, 40) / 40 * RUBBER;
      if (r.draft) base *= 1.025;
      base *= free ? Math.max(1, weatherMult(r)) : weatherMult(r);
      var b = 1, s = 1, stun = false, cap = 2.4, back = 0, reel = null, nob = false;
      for (var j = 0; j < r.fx.length; j++) {
        var e = r.fx[j];
        if (e.noboost) nob = true;
        if (e.kind === 'stun') { stun = true; if (e.back) back = e.back; if (e.wakeRank && r.rank > e.wakeRank && e.t > 0.2) e.t = 0.2; }
        else if (e.kind === 'boost') {
          if (e.ramp) e.m = e.ramp[0] + (e.ramp[1] - e.ramp[0]) * (1 - Math.max(0, e.t) / e.dur);
          if (e.uncap) cap = 7;
          b *= e.m;
        }
        else if (e.kind === 'slow') s *= e.m;
        else if (e.fx === 'reel') reel = e;
      }
      if (b > cap) b = cap;
      if (nob && b > 1) b = 1;
      if (s < 0.4) s = 0.4;
      var target = stun ? 0 : base * b * s;
      var dv = target - r.v;
      var up = (cap > 3 ? 70 : a.accel * (b > 1 ? 2.6 : 1)) * dt, down = 18 * dt;
      if (dv > up) dv = up; else if (dv < -down) dv = -down;
      r.v += dv;
      if (r.v < 0) r.v = 0;
      r.x += r.v * dt;
      if (r.v > r.stats.top && cap < 3 && r.v < base * 2.5) r.stats.top = r.v;     // 필살기 돌진 속도는 기록에서 뺀다
      if (back) { r.v = 0; r.x = Math.max(0, r.x - back * dt); }      // 최면 : 뒤로 걷는다
      if (reel && !stun) {                                            // 줄에 끌려가기
        var rt = reel.target, rg = rt.x - r.x;
        if (rt.finished) reel.t = 0;
        else if (rg > 1.5) r.x += Math.min(rg - 1.5, (rg * 0.9 + 5) * dt);
      }
      if (race.blockers.length && !hasFlag(r, 'air') && !hasFlag(r, 'imm')) {   // 길막 : 뒤에서 못 지나간다
        for (var bi = 0; bi < race.blockers.length; bi++) {
          var bl = race.blockers[bi].r;
          if (bl !== r && r.prevX <= bl.x && r.x > bl.x - 0.8 && bl.x - r.prevX < 8) { r.x = Math.max(r.prevX, bl.x - 0.8); if (r.v > bl.v) r.v = bl.v; }
        }
      }
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
    function auraTick(r) {
      var e = null, j;
      for (j = 0; j < r.fx.length; j++) if (r.fx[j].aura) e = r.fx[j];
      if (!e || race.t < (e.next || 0)) return;
      e.next = race.t + 0.3;
      race.racers.forEach(function (o) {
        if (o === r || o.finished || Math.abs(o.x - r.x) > e.aura || hasFlag(o, 'imm') || hasFlag(o, 'noslow')) return;
        for (j = 0; j < o.fx.length; j++) if (o.fx[j].kind === 'shield') return;          // 방패가 있으면 냄새가 안 닿는다 (방패는 깨지지 않는다)
        addFx(o, { kind: 'slow', fx: 'stink', t: 0.5, m: 0.68 });
        if (!e.hitSet[o.i]) { e.hitSet[o.i] = true; pop(o, '으, 냄새!', 'bad'); o.stats.took++; r.stats.gave++; o.hurtT = race.t; o.foe = r; }
      });
    }
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
      if (race.order.length && !race.order[0].finished && race.order[0].seg !== race.leadSeg) {
        race.leadSeg = race.order[0].seg;
        var tg0 = TERRAINS[race.terrain[race.leadSeg].type];
        if (race.leadSeg > 0) { log('terrain', null, tg0.name + ' 구간에 들어섭니다. ' + tg0.desc); race.ev.push({ k: 'terrain', type: race.terrain[race.leadSeg].type }); }
      }
      updateWeather(dt);
      updateEvents();
      updateUltWorld(dt);
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
        if (r.sealT > 0) r.sealT -= dt;
        r.skillT -= dt;
        move(r, dt);
        checkObjects(r);
        rabbitNap(r);
        pigBumps(r);
        auraTick(r);
        chargeBumps(r);
        tickUlt(r, dt);
        if (r.rank === 1) r.stats.leadTime += dt;
        var goal = LEN - (r.a.tr.reach ? 1.2 : 0);
        if (r.x >= goal) {
          r.finished = true;
          r.finT = race.t - (r.x - goal) / Math.max(r.v, 0.5);
          r.fx = []; r.item = null; r.bumped = null; r.charge = null; r.burst = 0;
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
      director();
      if (race.finished === rs.length) {
        var moving = false;
        for (j = 0; j < rs.length; j++) if (rs[j].v > 0.05) moving = true;
        race.allIn = true;
        if (!moving) race.over = true;
      }
      if (race.t > 480) { race.over = true; }
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
    ULT: ULT,
    TERRAINS: TERRAINS,
    terrainMul: terrainMul,
    createRace: createRace,
    josa: josa
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RaceSim = api;
})(typeof window !== 'undefined' ? window : globalThis);
