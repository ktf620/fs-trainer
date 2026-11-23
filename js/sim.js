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

  // ───────────── 동물 14종 ─────────────
  // speed : 기본 속력(m/s) · accel : 가속 · light : 가벼움(바람 영향) · agi : 날렵함(장애물 피하기)
  // wx : 날씨별 속력 보정 (storm 은 rain 값을 같이 씀)
  var ANIMALS = [
    { id: 'rabbit', name: '토끼', speed: 7.621, accel: 8.0, light: 1.0, agi: 1.0,
      wx: { rain: -0.02, snow: 0.03, heat: -0.01 },
      skill: { name: '깡충깡충 대시', desc: '세 번 크게 뛰어 단숨에 앞으로 나가요.' },
      passive: '너무 앞서면 방심해서 낮잠을 자기도 해요.' },
    { id: 'turtle', name: '거북이', speed: 7.400, accel: 5.5, light: 0.2, agi: 0.2,
      wx: { rain: 0.04, heat: 0.02, snow: -0.02 },
      skill: { name: '등껍질 스핀', desc: '껍질 속에 쏙 들어가 팽이처럼 돌진! 방해도 튕겨 내요.' },
      passive: '꾸준해서 날씨가 나빠도 덜 느려져요.' },
    { id: 'cheetah', name: '치타', speed: 7.705, accel: 10.0, light: 0.6, agi: 0.8,
      wx: { heat: 0.03, snow: -0.05, rain: -0.03 },
      skill: { name: '번개 스프린트', desc: '누구보다 빠른 폭발 질주. 하지만 곧 지쳐서 헥헥거려요.' },
      passive: '출발이 가장 빨라요.' },
    { id: 'fox', name: '여우', speed: 7.577, accel: 7.0, light: 0.7, agi: 0.8,
      wx: { fog: 0.04, snow: 0.01 },
      skill: { name: '슬쩍하기', desc: '다른 동물이 들고 있는 아이템을 몰래 가져와요.' },
      passive: '안개 속에서도 길을 잘 찾아요.' },
    { id: 'bear', name: '곰', speed: 7.636, accel: 6.0, light: 0.1, agi: 0.4,
      wx: { snow: 0.04, heat: -0.05 },
      skill: { name: '쩌렁쩌렁 포효', desc: '가까이 있는 동물들이 깜짝 놀라 느려져요.' },
      passive: '무거워서 바람에 끄떡없어요.' },
    { id: 'penguin', name: '펭귄', speed: 7.326, accel: 6.0, light: 0.6, agi: 0.5,
      wx: { snow: 0.07, rain: 0.03, heat: -0.08 },
      skill: { name: '배치기 슬라이딩', desc: '배로 쭈욱 미끄러져요. 비나 눈이 오면 훨씬 멀리 가요.' },
      passive: '미끄러운 길이 오히려 좋아요.' },
    { id: 'elephant', name: '코끼리', speed: 7.768, accel: 5.5, light: 0.0, agi: 0.2,
      wx: { rain: 0.02, snow: -0.02 },
      skill: { name: '코 물대포', desc: '선두에게 물을 뿜어 느리게 만들어요.' },
      passive: '두더지와 허들쯤은 그냥 밟고 지나가요.' },
    { id: 'kangaroo', name: '캥거루', speed: 7.609, accel: 7.0, light: 0.6, agi: 1.0,
      wx: { heat: 0.03, snow: -0.04 },
      skill: { name: '슈퍼 점프', desc: '하늘 높이 뛰어 장애물과 방해를 훌쩍 넘어가요.' },
      passive: '허들은 식은 죽 먹기예요.' },
    { id: 'skunk', name: '스컹크', speed: 7.716, accel: 6.5, light: 0.8, agi: 0.6,
      wx: { fog: 0.02 },
      skill: { name: '뿡뿡 구름', desc: '뒤따라오는 동물들이 코를 막느라 느려져요.' },
      passive: '뒤에 아무도 없으면 방귀 로켓으로 추격해요.' },
    { id: 'pig', name: '돼지', speed: 7.515, accel: 6.0, light: 0.2, agi: 0.4,
      wx: { rain: 0.02, heat: -0.02 },
      skill: { name: '꿀꿀 돌진', desc: '데굴데굴 굴러 돌진! 스쳐 지나간 동물은 휘청거려요.' },
      passive: '간식을 먹으면 힘이 더 오래가요.' },
    { id: 'dog', name: '강아지', speed: 7.793, accel: 7.5, light: 0.6, agi: 0.7,
      wx: { heat: -0.02, snow: 0.02 },
      skill: { name: '같이 가자!', desc: '바로 뒤에 있는 친구와 함께 빨라져요.' },
      passive: '의리파라서 친구를 도와줘요.' },
    { id: 'cat', name: '고양이', speed: 7.664, accel: 8.0, light: 0.9, agi: 0.9,
      wx: { rain: -0.05, fog: 0.04 },
      skill: { name: '냥냥 펀치', desc: '앞선 동물을 톡! 쳐서 빙글 돌게 만들어요.' },
      passive: '넘어져도 금방 일어나요.' },
    { id: 'panda', name: '판다', speed: 7.384, accel: 5.8, light: 0.2, agi: 0.4,
      wx: { snow: 0.03, heat: -0.05 },
      skill: { name: '대나무 간식 타임', desc: '잠깐 멈춰 대나무를 먹고 엄청난 힘으로 질주해요.' },
      passive: '간식을 먹으면 힘이 더 오래가요.' },
    { id: 'duck', name: '오리', speed: 7.407, accel: 6.5, light: 1.0, agi: 0.6,
      wx: { rain: 0.08, snow: -0.02, heat: -0.01 },
      skill: { name: '파닥파닥 활공', desc: '낮게 날아서 웅덩이도 장애물도 휙 지나가요.' },
      passive: '비 오는 날을 제일 좋아해요.' }
  ];
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
      nextEvent: rng.range(7, 10.5), lastEvent: null, eventCount: 0,
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
        startDelay: rng.range(0.02, 0.28) * (a.id === 'cheetah' ? 0.3 : 1),
        fx: [],
        item: null, itemT: 0, itemWait: 0,
        skillT: rng.range(6, 13), skillWait: 0,
        finished: false, finT: null, place: 0, rank: i + 1,
        napped: false, napMarks: [150, 250, 350], bumped: null,
        stats: { skills: 0, items: 0, gave: 0, took: 0, helps: 0, top: 0, leadTime: 0, blocked: 0 }
      });
    }

    // 아이템 상자 : 5줄, 레인마다 65% 확률
    [70, 160, 250, 340, 430].forEach(function (bx) {
      for (var li = 0; li < n; li++) {
        if (rng.chance(0.65)) race.objects.push({ type: 'box', lane: li + 1, x: bx + rng.range(-6, 6), taken: false, id: race.objects.length });
      }
    });

    // ── 화면으로 보내는 알림 ──
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
      if (hasFlag(tgt, 'imm')) { pop(tgt, '튕겨 냄!', 'good'); tgt.stats.blocked++; return 'blocked'; }
      if (spec.ground && (hasFlag(tgt, 'air') || hasFlag(tgt, 'gnd'))) { pop(tgt, '휙~ 피함', 'good'); tgt.stats.blocked++; return 'dodged'; }
      for (var j = 0; j < tgt.fx.length; j++) {
        if (tgt.fx[j].kind === 'shield') {
          tgt.fx.splice(j, 1);
          pop(tgt, '방패로 막음!', 'good'); sfx('block'); tgt.stats.blocked++;
          return 'shield';
        }
      }
      var dur = spec.t;
      if (tgt.a.id === 'cat' && spec.kind === 'stun') dur *= 0.6;   // 고양이는 금방 일어남
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
      if (a.id === 'turtle' && m < 0) m *= 0.5;          // 꾸준함
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
            if (r.a.id === 'duck' || r.a.id === 'penguin' || r.a.id === 'turtle') {
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
            if (r.a.id === 'penguin') {
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
          r = randomActive(function (q) { return q.a.id !== 'fox' && q.a.id !== 'cat'; });
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
          list = rng.shuffle(act.slice()).slice(0, Math.min(2, act.length));
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
            var d = (q.a.id === 'pig' || q.a.id === 'panda') ? 3.3 : 2.2;
            addFx(q, { kind: 'boost', fx: 'snack', t: d, m: 1.28 });
            pop(q, '냠냠! 힘이 난다', 'good');
          });
          log('event', null, '간식이 쏟아집니다! ' + list.map(function (q) { return q.name; }).join(', ') + ' 냠냠 먹고 힘을 내요.');
          sfx('item');
          break;
        case 'crowd':
          banner('crowd', '관중석의 응원!', '뒤처진 동물들에게 응원이 쏟아져요');
          list = ordered.slice(-Math.min(2, Math.max(1, ordered.length - 1)));
          list.forEach(function (q) {
            addFx(q, { kind: 'boost', fx: 'cheer', t: 3.0, m: 1.38 });
            pop(q, '힘내라 힘!', 'good');
          });
          log('event', null, '관중들이 ' + josa(list.map(function (q) { return q.name; }).join(', '), '을', '를') + ' 응원합니다! 추격이 시작돼요.');
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
          addFx(r, { kind: 'boost', fx: 'carrot', t: (r.a.id === 'pig' || r.a.id === 'panda') ? 3.7 : 2.5, m: 1.35 });
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
          done(josa(r.name, '이', '가') + ' 확성기로 응원합니다! ' + (list.length ? list.map(function (o) { return o.name; }).join(', ') + '도 함께 힘을 내요.' : ''));
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
          done(josa(r.name, '이', '가') + ' 자장가를 틀었어요. ' + (slept.length ? slept.join(', ') + ' 꾸벅꾸벅!' : '하지만 아무도 잠들지 않았어요.'));
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
          done(josa(r.name, '이', '가') + ' 회오리를 보냈어요! ' + (spun.length ? spun.join(', ') + ' 빙글빙글!' : '하지만 모두 피했어요.'));
          break;
      }
    }

    // ───────────── 스킬 ─────────────
    function tryUseSkill(r, dt) {
      var id = r.a.id, tgt, list, res, used = false;
      function fin(msg) {
        used = true;
        r.stats.skills++;
        r.skillT = rng.range(16, 23);
        r.skillWait = 0;
        race.ev.push({ k: 'skill', r: r.i, name: r.a.skill.name });
        pop(r, r.a.skill.name + '!', 'skill');
        sfx('skill');
        log('skill', r, msg);
      }
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
          fin(josa(r.name, '이', '가') + ' 쩌렁쩌렁 포효합니다! ' + (scared.length ? scared.join(', ') + ' 깜짝 놀라 주춤!' : '기합을 넣고 속도를 올려요.'));
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
            fin(josa(r.name, '이', '가') + ' 뿡뿡 구름을 뿜었어요! ' + (stunk.length ? stunk.join(', ') + ' 코를 막고 주춤!' : ''));
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
      }
      return used;
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
              if (res === 'hit') { o.gone = true; pop(r, '미끄덩~!', 'bad'); sfx('slip'); log('hit', r, josa(r.name, '이', '가') + ' 바나나 껍질을 밟고 빙그르르!'); }
              else if (res === 'shield' || res === 'blocked') o.gone = true;
            }
            break;
          case 'mole':
            if (o.lane === r.lane && !o.done && r.prevX < o.x && r.x >= o.x) {
              o.done = true;
              if (r.a.id === 'elephant') { o.squash = race.t; pop(r, '쿵! 밟고 지나감', 'good'); log('event', r, josa(r.name, '은', '는') + ' 두더지를 못 보고 그냥 밟고 지나갔어요.'); break; }
              if (rng.chance(r.a.agi * 0.55)) { pop(r, '폴짝! 피함', 'good'); break; }
              res = applyNeg(null, r, { kind: 'stun', fx: 'trip', t: 1.1, ground: true });
              if (res === 'hit') { pop(r, '꽈당!', 'bad'); sfx('trip'); log('hit', r, josa(r.name, '이', '가') + ' 두더지에 걸려 넘어졌어요!'); }
            }
            break;
          case 'hurdles':
            if (!o.done[r.i] && r.prevX < o.x && r.x >= o.x) {
              o.done[r.i] = true;
              if (hasFlag(r, 'air')) { pop(r, '훨훨 넘어감', 'good'); break; }
              if (r.a.id === 'elephant' || hasFlag(r, 'imm') || hasFlag(r, 'gnd')) { o.broken[r.lane] = race.t; pop(r, '와장창!', 'good'); sfx('crash'); break; }
              var p = (r.a.id === 'kangaroo' || r.a.id === 'rabbit') ? 1 : 0.42 + 0.5 * r.a.agi;
              if (rng.chance(p)) { r.hop = race.t; pop(r, '폴짝!', 'good'); sfx('hop'); break; }
              o.broken[r.lane] = race.t;
              res = applyNeg(null, r, { kind: 'stun', fx: 'trip', t: 1.0, ground: true });
              if (res === 'hit') { pop(r, '꽈당!', 'bad'); sfx('trip'); log('hit', r, josa(r.name, '이', '가') + ' 허들에 걸려 넘어졌어요!'); }
            }
            break;
          case 'slick':
            if (!o.done[r.i] && r.prevX < o.x && r.x >= o.x) {
              o.done[r.i] = true;
              if (r.a.id === 'penguin') {
                addFx(r, { kind: 'boost', fx: 'splash', t: 2.0, m: 1.4 });
                pop(r, '야호! 미끄럼틀', 'good');
                log('event', r, josa(r.name, '은', '는') + ' 미끌미끌 구간에서 오히려 신이 났어요!');
                break;
              }
              if (rng.chance(0.55)) {
                res = applyNeg(null, r, { kind: 'stun', fx: 'spin', t: 1.1, ground: true });
                if (res === 'hit') { pop(r, '미끄덩~!', 'bad'); sfx('slip'); log('hit', r, josa(r.name, '이', '가') + ' 미끌미끌 구간에서 빙그르르!'); }
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
      var tau = 2.5, sig = a.id === 'turtle' ? 0.012 : 0.034;
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
        else if (e.kind === 'boost') b *= e.m;
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
          if (res === 'hit') { pop(o, '어이쿠!', 'bad'); log('hit', o, josa(o.name, '이', '가') + ' 굴러가는 ' + r.name + '에게 스쳐 휘청!'); }
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
        if (r.x >= LEN) {
          r.finished = true;
          r.finT = race.t - (r.x - LEN) / Math.max(r.v, 0.5);
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
    createRace: createRace,
    josa: josa
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RaceSim = api;
})(typeof window !== 'undefined' ? window : globalThis);
