/* 동물 달리기 500m — 경주 화면 그리기 (배경 · 트랙 · 동물 · 효과 · 상단 표시) */
(function (root) {
  'use strict';
  var S = root.RaceSim, Art = root.Art;
  var TAU = Math.PI * 2, PI = Math.PI, OL = Art.OL;
  var LC = Art.LANE_COLORS, LT = Art.LANE_TEXT;
  var FONT = '"Jua", "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

  var cv, c, W = 800, H = 480, DPR = 1;
  var race = null, n = 8;
  var L = {};                 // 화면 배치
  var view = { camX: 0, viewM: 30, ppm: 30 };
  var RS = [];                // 동물별 화면 상태
  var parts = [], projs = [], bolts = [], ufos = [], twisters = [], rings = [], weatherP = [];
  var banner = null, flashA = 0, clock = 0, excite = 0, gustDir = 0, gustT = 0, nightT = 0, balls = [];
  var sky = { cur: 'sunny', prev: 'sunny', mix: 1 };
  var mode = 'idle', cd = 0, goT = 0, follow = -1;
  var sA = 1;                 // 동물 기본 배율

  var SKY = {
    sunny: ['#5fb9ff', '#cfeeff'], rain: ['#7b8fa8', '#bccad8'], snow: ['#a4b8cf', '#e6eef6'], wind: ['#6fbaf5', '#d6f0fd'],
    heat: ['#ffab52', '#ffe6ad'], fog: ['#b4c2ce', '#e2e8ee'], storm: ['#47536b', '#8794aa']
  };
  var GROUND = {
    sunny: ['#7fd46c', '#63bd55', '#e9764c', '#dd6a41'], rain: ['#67b660', '#529f4f', '#c9623f', '#bd5937'], snow: ['#f1f6fb', '#dbe6f0', '#e79273', '#dc8767'],
    wind: ['#7fd46c', '#63bd55', '#e9764c', '#dd6a41'], heat: ['#c7d268', '#aab852', '#f08350', '#e37645'], fog: ['#8fc98a', '#78b377', '#d9795a', '#cd6f51'],
    storm: ['#58a257', '#468c47', '#b85a3b', '#ac5133']
  };
  var HILL = { sunny: ['#9be08a', '#7fcf74'], rain: ['#86bd8a', '#6ea876'], snow: ['#f4f8fc', '#e2ebf3'], wind: ['#9be08a', '#7fcf74'], heat: ['#d9d77e', '#c3c468'], fog: ['#b9d3bd', '#a3c2ab'], storm: ['#6c9a7a', '#587f68'] };

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function hexMix(a, b, k) {
    var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
    var r = Math.round((x >> 16) + ((y >> 16) - (x >> 16)) * k), g = Math.round(((x >> 8) & 255) + (((y >> 8) & 255) - ((x >> 8) & 255)) * k), bl = Math.round((x & 255) + ((y & 255) - (x & 255)) * k);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
  }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function ell(x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, TAU); }
  function sxOf(x) { return (x - view.camX) * view.ppm; }
  function laneY(i) { return L.trackTop + L.laneH * (i + 0.82); }
  function laneScale(i) { return n > 1 ? 0.92 + 0.16 * (i / (n - 1)) : 1; }
  function fxMap(r) { var m = {}; for (var j = 0; j < r.fx.length; j++) m[r.fx[j].fx] = r.fx[j]; return m; }
  function prog(e) { return 1 - clamp(e.t / (e.dur || 1), 0, 1); }

  var R = {};

  R.init = function (canvas, theRace) {
    cv = canvas; c = cv.getContext('2d');
    race = theRace; n = race.racers.length;
    RS = race.racers.map(function (r, i) {
      return { phase: hash(i + race.seed % 97) * TAU, pops: [], spray: 0, burst: 0, hx: 0, hy: 0, top: 0, s: 1, sx: 0, fy: 0, lift: 0, dustT: 0, fxT: 0, cheerT: 0, tearT: 0, vis: true };
    });
    parts = []; projs = []; bolts = []; ufos = []; twisters = []; rings = []; weatherP = [];
    banner = null; flashA = 0; clock = 0; excite = 0; gustDir = 0; gustT = 0; follow = -1; nightT = 0; balls = [];
    sky.cur = sky.prev = race.weather.id; sky.mix = 1;
    mode = 'countdown'; cd = 3.4; goT = 0;
    R.resize();
    view.viewM = W / L.maxPpm; view.camX = -view.viewM * 0.42; view.ppm = W / view.viewM;
  };

  R.resize = function () {
    if (!cv) return;
    var rect = cv.getBoundingClientRect();
    W = Math.max(280, Math.round(rect.width)); H = Math.max(200, Math.round(rect.height));
    DPR = Math.min(2, root.devicePixelRatio || 1);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    L.narrow = W < 620;
    L.hud = L.narrow ? 66 : 50;
    var skyFrac = clamp(0.36 - 0.012 * Math.max(0, n - 8), 0.2, 0.36);
    L.trackTop = Math.round(Math.max(L.hud + H * (n > 8 ? 0.12 : 0.2), H * skyFrac));
    L.botH = Math.round(H * (n > 12 ? 0.05 : 0.075));
    L.trackH = H - L.trackTop - L.botH;
    L.laneH = L.trackH / n;
    L.standH = clamp(L.trackTop - L.hud - 6, 30, 120);
    var overlap = n <= 8 ? 1.8 : Math.min(3.0, 1.8 + (n - 8) * 0.09);   // 레인이 많을수록 동물이 위 레인과 더 겹침
    L.maxS = clamp(L.laneH * overlap / 100, 0.36, 1.25);       // 동물 최대 배율 (키 100 기준)
    L.maxPpm = L.maxS * 100 / 2.35;
    L.minPpm = Math.min(L.maxPpm, L.narrow ? 15 : 21);
    view.ppm = W / view.viewM;
  };

  R.setFollow = function (i) { follow = i; };
  R.getFollow = function () { return follow; };
  R.mode = function () { return mode; };
  R.setMode = function (m) { mode = m; };

  // 카운트다운 진행 — true 를 돌려주면 출발
  R.tickCountdown = function (dt) {
    var before = Math.ceil(cd);
    cd -= dt;
    var after = Math.ceil(cd);
    if (cd <= 0) { mode = 'run'; goT = 0.9; return 'go'; }
    if (after !== before && after >= 1 && after <= 3) return 'beep';
    return null;
  };

  // ───────────── 경주가 보낸 알림 받기 ─────────────
  R.handle = function (ev) {
    for (var j = 0; j < ev.length; j++) {
      var e = ev[j], st;
      switch (e.k) {
        case 'pop':
          st = RS[e.r];
          if (n > 12 && e.cls !== 'skill') break;      // 참가가 많으면 스킬 이름만 띄운다
          st.pops.push({ text: e.text, cls: e.cls, age: 0 });
          if (st.pops.length > 3) st.pops.shift();
          break;
        case 'skill':
          st = RS[e.r]; st.burst = 1;
          if (race.racers[e.r].a.id === 'elephant') st.spray = 0.9;
          rings.push({ r: e.r, age: 0, dur: 0.5, col: '#ffd23f' });
          break;
        case 'banner':
          banner = { id: e.id, title: e.title, sub: e.sub, age: 0, dur: e.dur || 2.6 };
          if (e.id === 'crowd') excite = 3.2;
          if (e.id === 'snack') spawnSnacks();
          if (e.id === 'star') spawnShootingStar();
          break;
        case 'proj':
          projs.push({ kind: e.kind, from: e.from, to: e.to, age: 0, dur: e.kind === 'water' ? 0.7 : (e.kind === 'magnet' ? 0.8 : 0.4) });
          break;
        case 'lightning':
          bolts.push({ r: e.r, age: 0, seed: Math.random() * 100 }); flashA = 0.8;
          break;
        case 'ufo':
          ufos.push({ r: e.r, age: 0 });
          break;
        case 'tornado':
          e.to.forEach(function (ti, q) { twisters.push({ from: e.from, to: ti, age: -q * 0.08, dur: 1.1 }); });
          break;
        case 'roar':
          for (var q = 0; q < 3; q++) rings.push({ r: e.r, age: -q * 0.12, dur: 0.7, col: '#ff8f5a', big: true });
          break;
        case 'stink':
          RS[e.r].fxT = 2.0;
          break;
        case 'swap':
          rings.push({ r: e.a, age: 0, dur: 0.6, col: '#b98cff', big: true });
          rings.push({ r: e.b, age: 0, dur: 0.6, col: '#b98cff', big: true });
          break;
        case 'buddy':
          spawnHearts(e.a); spawnHearts(e.b);
          break;
        case 'gust':
          gustDir = e.dir; gustT = 3;
          break;
        case 'night': nightT = 2.4; break;
        case 'howl': for (var q2 = 0; q2 < 3; q2++) rings.push({ r: e.r, age: -q2 * 0.12, dur: 0.7, col: '#8fb8ff', big: true }); break;
        case 'sonar': for (var q3 = 0; q3 < 4; q3++) rings.push({ r: e.r, age: -q3 * 0.1, dur: 0.8, col: '#b98cff', big: true }); break;
        case 'slowmo': rings.push({ r: e.r, age: 0, dur: 0.9, col: '#9ad1c9', big: true }); break;
        case 'charm': RS[e.r].cheerT = 0.9; spawnHearts(e.r); break;
        case 'tears': RS[e.r].tearT = 1.2; break;
        case 'kick': rings.push({ r: e.b, age: 0, dur: 0.35, col: '#ffe14d' }); break;
        case 'tongue': projs.push({ kind: 'tongue', from: e.a, to: e.b, age: 0, dur: 0.3 }); break;
        case 'ball': balls.push({ from: e.from, to: e.to, age: 0 }); break;
        case 'finish':
          if (e.place === 1) {
            excite = 6;
            banner = { id: 'star', title: '1등 골인!', sub: race.racers[e.r].name + ' (' + race.racers[e.r].a.name + ')', age: 0, dur: 3.6 };
            for (var k = 0; k < 110; k++) parts.push({ kind: 'conf', scr: true, x: Math.random() * W, y: -10 - Math.random() * H * 0.4, vx: (Math.random() - 0.5) * 60, vy: 90 + Math.random() * 160, life: 0, max: 3.6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10, col: LC[k % 8], size: 5 + Math.random() * 5 });
          }
          break;
      }
    }
  };

  function spawnSnacks() {
    for (var k = 0; k < 16; k++) parts.push({ kind: 'snack', scr: true, x: Math.random() * W, y: -20 - Math.random() * 120, vx: -30, vy: 200 + Math.random() * 140, life: 0, max: 2.2, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 6, size: 22 + Math.random() * 10, gy: L.trackTop + Math.random() * L.trackH });
  }
  function spawnShootingStar() {
    parts.push({ kind: 'shoot', scr: true, x: W * 0.9, y: -10, vx: -W * 0.7, vy: L.trackTop * 0.9, life: 0, max: 1.0, size: 16 });
  }
  function spawnHearts(i) {
    var st = RS[i];
    for (var k = 0; k < 5; k++) parts.push({ kind: 'heart', scr: true, x: st.hx + (Math.random() - 0.5) * 30, y: st.top, vx: (Math.random() - 0.5) * 20, vy: -40 - Math.random() * 30, life: -k * 0.08, max: 1.0, size: 9 });
  }

  // ───────────── 카메라 ─────────────
  function updateCamera(dt) {
    var rs = race.racers, minV = W / L.maxPpm, maxV = W / L.minPpm, tv, tc, j;
    if (mode === 'countdown') { tv = minV; tc = -tv * 0.42; }
    else if (follow >= 0 && !rs[follow].finished) { tv = clamp(minV * 1.1, minV, maxV); tc = rs[follow].x - tv * 0.5; }
    else {
      var lead = -1e9, tail = 1e9, cnt = 0;
      for (j = 0; j < rs.length; j++) if (!rs[j].finished) { cnt++; if (rs[j].x > lead) lead = rs[j].x; if (rs[j].x < tail) tail = rs[j].x; }
      if (race.finished > 0) {
        // 누군가 골인한 뒤 : 결승선을 비추고, 뒤따라오는 동물이 가까우면 같이 잡는다
        tv = minV * 1.15;
        if (cnt) tv = clamp((S.LEN + 10 - Math.max(tail, S.LEN - maxV * 0.75)) / 0.86, minV, maxV);
        tc = S.LEN + 12 - tv * 0.96;
      } else {
        var span = lead - tail;
        tv = clamp((span + 11) / 0.78, minV, maxV);
        tc = lead - tv * 0.8;
      }
    }
    view.viewM += (tv - view.viewM) * (1 - Math.exp(-dt * 2.2));
    view.camX += (tc - view.camX) * (1 - Math.exp(-dt * 4));
    view.ppm = W / view.viewM;
    sA = Math.min(view.ppm * 2.35 / 100, L.maxS);
  }

  // ───────────── 배경 ─────────────
  function drawSky() {
    var a = SKY[sky.prev], b = SKY[sky.cur], m = sky.mix;
    var g = c.createLinearGradient(0, 0, 0, L.trackTop);
    g.addColorStop(0, hexMix(a[0], b[0], m)); g.addColorStop(1, hexMix(a[1], b[1], m));
    c.fillStyle = g; c.fillRect(0, 0, W, L.trackTop + 2);
    var id = sky.cur, j;
    // 해
    if (id === 'sunny' || id === 'wind' || id === 'heat') {
      var sr = (id === 'heat' ? 34 : 24) * (L.narrow ? 0.7 : 1), sxp = W * 0.84, syp = L.hud + sr * 0.6;
      var rg = c.createRadialGradient(sxp, syp, sr * 0.6, sxp, syp, sr * 2.6);
      rg.addColorStop(0, id === 'heat' ? 'rgba(255,120,40,.5)' : 'rgba(255,240,170,.6)'); rg.addColorStop(1, 'rgba(255,240,170,0)');
      c.fillStyle = rg; c.fillRect(sxp - sr * 3, syp - sr * 3, sr * 6, sr * 6);
      ell(sxp, syp, sr, sr); c.fillStyle = id === 'heat' ? '#ff7a2e' : '#ffd95a'; c.fill();
      c.lineWidth = 2.4; c.strokeStyle = id === 'heat' ? '#e0531a' : '#f0b429'; c.stroke();
    }
    // 구름
    var ccol = (id === 'rain' || id === 'storm') ? (id === 'storm' ? '#5d6880' : '#93a3b8') : (id === 'heat' ? '#fff3d6' : '#ffffff');
    var cn = (id === 'rain' || id === 'storm' || id === 'snow' || id === 'fog') ? 9 : 5;
    for (j = 0; j < cn; j++) {
      var span = W + 300;
      var cx = ((hash(j) * span - view.camX * view.ppm * 0.06 - clock * (6 + hash(j + 9) * 8)) % span + span) % span - 150;
      var cy = L.hud + 8 + hash(j + 3) * Math.max(10, L.trackTop - L.hud - L.standH * 0.9);
      c.globalAlpha = 0.9;
      Art.drawCloud(c, cx, cy, (0.7 + hash(j + 5) * 0.9) * (L.narrow ? 0.7 : 1), ccol, 0);
      c.globalAlpha = 1;
    }
    // 언덕
    var hc = [hexMix(HILL[sky.prev][0], HILL[sky.cur][0], m), hexMix(HILL[sky.prev][1], HILL[sky.cur][1], m)];
    for (var layer = 0; layer < 2; layer++) {
      var par = layer ? 0.3 : 0.14, base = L.trackTop - L.standH * (layer ? 0.5 : 0.95), amp = L.standH * (layer ? 0.28 : 0.4);
      var off = view.camX * view.ppm * par;
      c.beginPath(); c.moveTo(0, L.trackTop);
      for (var x = 0; x <= W + 16; x += 16) {
        var wx = (x + off) * (layer ? 0.011 : 0.006);
        c.lineTo(x, base - amp * (Math.sin(wx + layer * 2) * 0.6 + Math.sin(wx * 2.3 + 1.7) * 0.4));
      }
      c.lineTo(W, L.trackTop); c.closePath();
      c.fillStyle = hc[layer]; c.fill();
    }
  }

  var BOARD_TXT = ['힘내라 힘!', '동물 달리기 대회', '달려라 달려~', '끝까지 화이팅', '오늘의 1등은?', '500m 질주'];
  var BOARD_COL = ['#ff8fa3', '#7fb7ff', '#ffd23f', '#8fd46b', '#c79bff', '#ffb26b'];
  function drawStands() {
    var top = L.trackTop, sh = L.standH, ppm = view.ppm, per = 58, len = 44, j, q;
    var k0 = Math.floor((view.camX - len) / per), k1 = Math.ceil((view.camX + view.viewM) / per);
    for (var k = k0; k <= k1; k++) {
      var x0 = sxOf(k * per + 7), w = len * ppm;
      // 관중석 사이 나무
      var tx = sxOf(k * per + 1.5), ts = clamp(sh / 62, 0.5, 1.5);
      Art.drawTree(c, tx, top - 4, ts, sky.cur === 'snow' ? '#dfeaf2' : (k % 2 ? '#5cc26b' : '#6fcf7a'));
      Art.drawTree(c, tx + 3.4 * ppm, top - 4, ts * 0.82, sky.cur === 'snow' ? '#eaf2f8' : '#58b765');
      if (x0 > W || x0 + w < 0) continue;
      var bodyTop = top - sh * 0.8;
      // 관중석 몸체
      Art.roundRect(c, x0, bodyTop, w, sh * 0.8 + 4, 8); c.fillStyle = k % 2 ? '#fff0d4' : '#e3f1ff'; c.fill(); c.lineWidth = 2.4; c.strokeStyle = OL; c.stroke();
      // 관중
      var rows = sh > 70 ? 3 : 2, rad = clamp(0.42 * ppm, 3.5, sh * 0.105), gap = 1.12;
      var cnt = Math.floor((len - 1.2) / gap);
      c.save(); c.beginPath(); c.rect(x0, bodyTop - sh, w, sh * 1.8); c.clip();
      for (var row = rows - 1; row >= 0; row--) {
        var ry = top - 8 - rad - row * (sh * 0.8 - 14 - rad) / rows;
        for (j = 0; j < cnt; j++) {
          var fx = x0 + (0.9 + j * gap + (row % 2) * 0.5) * ppm;
          if (fx < -20 || fx > W + 20) continue;
          Art.drawFan(c, fx, ry, rad, k * 31 + row * 7 + j, clock, excite > 0);
        }
      }
      c.restore();
      // 지붕 (줄무늬 차양)
      var ah = Math.max(8, sh * 0.14), sw = Math.max(14, 2 * ppm);
      c.save(); Art.roundRect(c, x0 - 4, bodyTop - ah, w + 8, ah + 4, 6); c.clip();
      for (q = 0; q * sw < w + 8; q++) { c.fillStyle = q % 2 ? '#ffffff' : (k % 2 ? '#ff7b7b' : '#5aa9f5'); c.fillRect(x0 - 4 + q * sw, bodyTop - ah, sw + 1, ah + 4); }
      c.restore();
      Art.roundRect(c, x0 - 4, bodyTop - ah, w + 8, ah + 4, 6); c.lineWidth = 2.4; c.strokeStyle = OL; c.stroke();
    }
    // 광고판 울타리
    var bh = clamp(sh * 0.2, 9, 20), bper = 12;
    var b0 = Math.floor(view.camX / bper) - 1, b1 = Math.ceil((view.camX + view.viewM) / bper);
    for (var b = b0; b <= b1; b++) {
      var bx = sxOf(b * bper + 0.3), bw = (bper - 0.6) * ppm, idx = ((b % 6) + 6) % 6;
      c.fillStyle = BOARD_COL[idx]; c.fillRect(bx, top - bh, bw, bh);
      c.lineWidth = 2; c.strokeStyle = OL; c.strokeRect(bx, top - bh, bw, bh);
      if (bh >= 12 && bw > 70) {
        c.fillStyle = idx === 2 ? OL : '#fff'; c.font = Math.round(bh * 0.72) + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(BOARD_TXT[idx], bx + bw / 2, top - bh / 2 + 1);
      }
    }
  }

  function drawTrack() {
    var top = L.trackTop, th = L.trackH, lh = L.laneH, ppm = view.ppm, m = sky.mix, j;
    var ga = GROUND[sky.prev], gb = GROUND[sky.cur];
    var t1 = hexMix(ga[2], gb[2], m), t2 = hexMix(ga[3], gb[3], m);
    for (j = 0; j < n; j++) { c.fillStyle = j % 2 ? t2 : t1; c.fillRect(0, top + j * lh, W, lh + 1); }
    // 10m 눈금 · 50m 선
    var m0 = Math.floor(view.camX / 10) * 10, x, sx;
    for (x = m0; x <= view.camX + view.viewM + 10; x += 10) {
      if (x < 0 || x > S.LEN) continue;
      sx = sxOf(x);
      if (x % 50 === 0 && x > 0 && x < S.LEN) { c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(sx - 1.5, top, 3, th); }
      else { c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(sx - 1, top, 2, 6); }
    }
    // 레인 줄
    c.fillStyle = 'rgba(255,255,255,.88)';
    for (j = 0; j <= n; j++) c.fillRect(0, top + j * lh - 1.25, W, 2.5);
    // 출발선과 레인 번호
    sx = sxOf(0);
    if (sx > -200 && sx < W + 50) {
      c.fillStyle = '#fff'; c.fillRect(sx - 0.18 * ppm, top, 0.36 * ppm, th);
      c.font = Math.round(clamp(lh * 0.62, 9, 44)) + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (j = 0; j < n; j++) { c.fillStyle = 'rgba(255,255,255,.82)'; c.fillText(String(j + 1), sx - 2.3 * ppm, top + (j + 0.52) * lh); }
    }
    // 결승선 (체크무늬)
    sx = sxOf(S.LEN);
    if (sx > -100 && sx < W + 100) {
      var cw = Math.max(5, lh / 4), cols = 3;
      for (var cy = 0; cy * cw < th; cy++) for (var cx = 0; cx < cols; cx++) {
        c.fillStyle = (cx + cy) % 2 ? '#fff' : '#2b2018';
        c.fillRect(sx + cx * cw, top + cy * cw, cw, Math.min(cw, th - cy * cw));
      }
      c.lineWidth = 2; c.strokeStyle = OL; c.strokeRect(sx, top, cols * cw, th);
    }
    // 미끌미끌 구간
    race.objects.forEach(function (o) {
      if (o.type !== 'slick') return;
      var a = sxOf(o.x), b = sxOf(o.x1);
      if (b < -10 || a > W + 10) return;
      var g = c.createLinearGradient(a, 0, b, 0);
      var sc0 = o.ink ? 'rgba(52,40,78,' : (o.mud ? 'rgba(120,80,50,' : 'rgba(200,240,255,');
      var sa0 = o.ink ? '.7)' : (o.mud ? '.72)' : '.62)');
      g.addColorStop(0, sc0 + '0)'); g.addColorStop(0.15, sc0 + sa0); g.addColorStop(0.85, sc0 + sa0); g.addColorStop(1, sc0 + '0)');
      c.fillStyle = g; c.fillRect(a, top, b - a, th);
      if (o.ink) {     // 먹물 : 동글동글한 얼룩
        c.fillStyle = 'rgba(30,22,48,.6)';
        for (var q0 = 0; q0 < n * 2; q0++) {
          ell(a + (b - a) * (0.12 + 0.76 * hash(q0 + o.id * 5)), top + (q0 + 0.5) * lh / 2, 5 + 7 * hash(q0 * 3 + o.id), 2.5 + 3 * hash(q0 * 7 + o.id));
          c.fill();
        }
        return;
      }
      c.strokeStyle = o.mud ? 'rgba(80,50,30,.55)' : 'rgba(255,255,255,.8)'; c.lineWidth = 2; c.lineCap = 'round';
      for (var q = 0; q < n * 2; q++) {
        var qx = a + (b - a) * (0.15 + 0.7 * hash(q + o.id * 3)), qy = top + (q + 0.5) * lh / 2;
        c.beginPath(); c.moveTo(qx - 8, qy + 3); c.lineTo(qx + 8, qy - 3); c.stroke();
      }
    });
  }

  function drawSigns() {
    // 거리 표지판 (트랙 위쪽 가장자리)
    var top = L.trackTop, ppm = view.ppm, x, sx;
    var fs = clamp(L.standH * 0.17, 10, 15);
    for (x = Math.floor(view.camX / 50) * 50; x <= view.camX + view.viewM + 50; x += 50) {
      if (x <= 0 || x > S.LEN) continue;
      sx = sxOf(x);
      var txt = x === S.LEN ? 'FINISH' : x + 'm', bw = fs * (x === S.LEN ? 4.6 : 3.3), bh = fs * 1.7, by = top - bh - fs * 1.6;
      c.fillStyle = OL; c.fillRect(sx - 1.5, by + bh - 2, 3, fs * 1.7);
      Art.roundRect(c, sx - bw / 2, by, bw, bh, 5); c.fillStyle = x === S.LEN ? '#ff5a5f' : '#fff'; c.fill(); c.lineWidth = 2.2; c.strokeStyle = OL; c.stroke();
      c.fillStyle = x === S.LEN ? '#fff' : OL; c.font = Math.round(fs) + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(txt, sx, by + bh / 2 + 1);
      if (x === S.LEN) {   // 결승선 풍선
        for (var q = 0; q < 3; q++) {
          var bx = sx - bw / 2 + 8 + q * (bw - 16) / 2, byy = by - 14 - Math.sin(clock * 2 + q) * 3;
          c.beginPath(); c.moveTo(bx, byy + 9); c.lineTo(bx, by); c.lineWidth = 1; c.strokeStyle = OL; c.stroke();
          ell(bx, byy, 7, 9); c.fillStyle = [LC[0], LC[2], LC[5]][q]; c.fill(); c.lineWidth = 1.8; c.strokeStyle = OL; c.stroke();
        }
      }
    }
  }

  function drawBottom() {
    var y0 = L.trackTop + L.trackH, m = sky.mix;
    var g1 = hexMix(GROUND[sky.prev][0], GROUND[sky.cur][0], m), g2 = hexMix(GROUND[sky.prev][1], GROUND[sky.cur][1], m);
    c.fillStyle = g1; c.fillRect(0, y0, W, H - y0);
    c.fillStyle = g2; c.fillRect(0, y0, W, 4);
    // 꽃과 풀
    var per = 2.6, k0 = Math.floor(view.camX / per) - 1, k1 = Math.ceil((view.camX + view.viewM) / per) + 1;
    for (var k = k0; k <= k1; k++) {
      var fx = sxOf((k + hash(k) * 0.8) * per), fy = y0 + 8 + hash(k + 50) * Math.max(4, H - y0 - 16), kind = Math.floor(hash(k + 20) * 4);
      if (kind < 2) {
        var col = ['#ffffff', '#ffd23f', '#ff8fa3', '#c79bff'][Math.floor(hash(k + 30) * 4)];
        for (var p = 0; p < 5; p++) { ell(fx + Math.cos(p * 1.257) * 3.4, fy + Math.sin(p * 1.257) * 3.4, 2.6, 2.6); c.fillStyle = col; c.fill(); }
        ell(fx, fy, 2, 2); c.fillStyle = '#ffb02e'; c.fill();
      } else {
        c.beginPath(); c.moveTo(fx - 5, fy + 4); c.lineTo(fx - 3, fy - 4); c.lineTo(fx, fy + 3); c.lineTo(fx + 2, fy - 6); c.lineTo(fx + 5, fy + 4);
        c.lineWidth = 2; c.strokeStyle = g2; c.lineJoin = 'round'; c.stroke();
      }
    }
  }

  // ───────────── 트랙 위 물건 (레인별) ─────────────
  function drawLaneObjects(i) {
    var objs = race.objects, fy = laneY(i), s = sA * laneScale(i);
    for (var j = 0; j < objs.length; j++) {
      var o = objs[j], sx;
      if (o.type === 'hurdles') {
        sx = sxOf(o.x);
        if (sx < -40 || sx > W + 40) continue;
        var br = o.broken[i + 1] ? clamp((race.t - o.broken[i + 1]) / 0.25, 0, 1) : 0;
        if (o.log) {   // 통나무 댐
          if (sxOf(o.x) > -40) {
            c.save(); c.translate(sx, fy + 2 * s); if (br) { c.translate(10 * s * br, 0); c.rotate(0.9 * br); }
            for (var lg = 0; lg < 2; lg++) {
              Art.roundRect(c, -7 * s, (-13 - lg * 11) * s, 14 * s, 11 * s, 4 * s); c.fillStyle = lg ? '#b98450' : '#a06c46'; c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
              ell(0, (-7.5 - lg * 11) * s, 3.4 * s, 3.4 * s); c.fillStyle = '#e2c49a'; c.fill(); c.lineWidth = 1.2; c.stroke();
            }
            c.restore();
          }
        } else Art.drawHurdle(c, sx, fy + 2 * s, s * 1.25, br);
        continue;
      }
      if (o.lane !== i + 1 || o.gone) continue;
      sx = sxOf(o.x);
      if (sx < -60 || sx > W + 60) continue;
      if (o.type === 'box') {
        if (o.taken) {
          var k = (race.t - o.takenAt) / 0.3;
          if (k < 1) { c.globalAlpha = 1 - k; Art.drawItemBox(c, sx, fy - 16 * s - k * 30 * s, s * 46 * (1 + k * 0.6), clock + o.id); c.globalAlpha = 1; }
        } else {
          ell(sx, fy + 2 * s, 13 * s, 3.5 * s); c.fillStyle = 'rgba(60,30,20,.16)'; c.fill();
          Art.drawItemBox(c, sx, fy - 16 * s, s * 46, clock + o.id * 0.7);
        }
      } else if (o.type === 'banana') {
        if (o.egg) { ell(sx, fy - 7 * s, 7 * s, 9 * s); c.fillStyle = '#fffaf0'; c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke(); ell(sx - 2 * s, fy - 10 * s, 2 * s, 3 * s); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill(); }
        else Art.drawPeel(c, sx, fy - 2 * s, s * 1.15);
      } else if (o.type === 'mole') {
        var up = clamp((race.t - o.born) / 0.35, 0, 1);
        up = up * (1 + 0.25 * Math.sin(up * PI));
        Art.drawMole(c, sx, fy + 1 * s, s * 1.35, Math.min(1, up), !!o.squash);
      }
    }
  }

  // ───────────── 동물 ─────────────
  function drawRacer(i) {
    var r = race.racers[i], st = RS[i];
    var sx = sxOf(r.x), fy = laneY(i);
    st.vis = sx > -90 && sx < W + 90;
    st.sx = sx; st.fy = fy;
    if (!st.vis) return;
    var s = sA * laneScale(i);
    var has = fxMap(r);
    var o = { x: sx, y: fy, s: s, t: clock + i * 0.41, phase: st.phase, num: r.lane, color: LC[i] };
    var pose = 'run', lift = 0, k, e;

    if (mode === 'countdown' || (race.t < r.startDelay && !r.finished)) pose = 'ready';
    else if (r.finished) {
      if (r.v > 0.8) { pose = 'run'; }
      else pose = r.place === 1 ? 'cheer' : (r.place === n && n > 2 ? 'sad' : (r.place <= 3 ? 'cheer' : 'idle'));
    }
    else if (has.lift) { pose = 'lift'; k = prog(has.lift); lift = (k < 0.25 ? k / 0.25 : (k > 0.82 ? (1 - k) / 0.18 : 1)) * s * 78; }
    else if (has.sleep) pose = 'sleep';
    else if (has.eat) pose = 'eat';
    else if (has.spin) pose = 'spin';
    else if (has.trip) pose = 'trip';
    else if (has.zap) pose = 'zap';
    else if (has.sting) { pose = 'zap'; lift = Math.abs(Math.sin(clock * 16)) * s * 14; }
    else if (has.ice) pose = 'idle';
    else if (has.pity) pose = 'sad';
    else if (has.charm) { pose = 'idle'; o.eyes = 'happy'; o.mouth = 'open'; }
    else if (has.bonk2) pose = 'dizzy';
    else if (has.cling) { pose = 'jump'; lift = s * 16; o.prog = 0.5; }
    else if (has.shell) pose = Art.SPEC[r.a.id].shell ? 'shell' : 'roll';
    else if (has.wheel) { pose = 'run'; o.boost = true; }
    else if (has.roll) pose = 'roll';
    else if (has.slide) pose = 'slide';
    else if (has.jump) { pose = 'jump'; k = prog(has.jump); lift = Math.sin(PI * k) * s * 120; o.prog = k; }
    else if (has.fly) { pose = 'fly'; k = prog(has.fly); lift = clamp(k * 7, 0, 1) * clamp((1 - k) * 7, 0, 1) * s * 44; }
    else {
      pose = st.spray > 0 ? 'spray' : 'run';
      o.hop = !!has.hop;
      for (k = 0; k < r.fx.length; k++) if (r.fx[k].kind === 'boost') o.boost = true;
      if (has.scared) { o.eyes = 'wide'; o.mouth = 'o'; }
      else if (has.stink) { o.eyes = 'x'; o.mouth = 'wavy'; }
      else if (has.pie || has.ink) { o.eyes = 'closed'; o.mouth = 'o'; }
      else if (has.tired || has.hot) { o.eyes = 'sad'; o.mouth = 'open'; }
      else if (has.wet || has.puddle) { o.eyes = 'closed'; o.mouth = 'wavy'; }
      else if (has.lost) { o.eyes = 'wide'; o.mouth = 'flat'; }
      else if (has.bees) { o.eyes = 'wide'; o.mouth = 'open'; }
      else if (has.bonk) { o.eyes = 'x'; o.mouth = 'o'; }
      else if (has.slowmo) { o.eyes = 'closed'; o.mouth = 'flat'; }
      if (st.cheerT > 0 && !r.finished) pose = 'cheer';
    }
    if (pose === 'run' && r.hop && race.t - r.hop < 0.5) { k = (race.t - r.hop) / 0.5; pose = 'jump'; lift = Math.sin(PI * k) * s * 46; o.prog = k; }

    if (has.giant) { e = has.giant; k = prog(e); s *= 1 + 0.5 * clamp(k * 8, 0, 1) * clamp((1 - k) * 8, 0, 1); }
    if (has.tiny) { e = has.tiny; k = prog(e); s *= 1 - 0.3 * clamp(k * 8, 0, 1) * clamp((1 - k) * 8, 0, 1); }
    o.s = s; o.y = fy - lift; o.pose = pose;
    st.lift = lift;

    // 그림자
    var sh = 1 - Math.min(0.55, lift / (s * 220));
    ell(sx, fy + 2 * s, 30 * s * sh, 6.5 * s * sh); c.fillStyle = 'rgba(60,30,20,.2)'; c.fill();

    // 뒤쪽 효과
    var boostOn = o.boost || has.shell || has.roll || has.slide || has.jump || has.fly || has.burrow;
    if (has.star) {
      var rg = c.createRadialGradient(sx, fy - 46 * s, 8 * s, sx, fy - 46 * s, 74 * s);
      rg.addColorStop(0, 'rgba(255,240,120,.75)'); rg.addColorStop(1, 'rgba(255,240,120,0)');
      c.fillStyle = rg; c.fillRect(sx - 80 * s, fy - 125 * s, 160 * s, 160 * s);
    }
    if (has.rocket || has.fart) {
      var fl = (has.rocket ? 46 : 30) * s * (0.8 + 0.3 * Math.sin(clock * 40));
      c.beginPath(); c.moveTo(sx - 16 * s, fy - 44 * s - lift); c.quadraticCurveTo(sx - 18 * s - fl * 0.6, fy - 34 * s - lift, sx - 18 * s - fl, fy - 32 * s - lift);
      c.quadraticCurveTo(sx - 18 * s - fl * 0.6, fy - 26 * s - lift, sx - 16 * s, fy - 22 * s - lift); c.closePath();
      c.fillStyle = has.rocket ? '#ffb02e' : '#b6e36a'; c.fill(); c.lineWidth = 2; c.strokeStyle = has.rocket ? '#ff5a2e' : '#7bb23a'; c.stroke();
    }
    if (boostOn && pose !== 'ready') {
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineCap = 'round'; c.lineWidth = Math.max(1.5, 2.6 * s);
      for (k = 0; k < 3; k++) {
        var ly = fy - lift - (22 + k * 22) * s, lx = sx - (32 + 10 * hash(k + Math.floor(clock * 14) + i)) * s, ll = (18 + 22 * hash(k * 7 + Math.floor(clock * 14) + i)) * s;
        c.beginPath(); c.moveTo(lx, ly); c.lineTo(lx - ll, ly); c.stroke();
      }
    }

    var a;
    if (has.burrow) {
      // 땅속으로 가는 중 : 흙무더기만 보인다
      ell(sx, fy, 26 * s, 9 * s); c.fillStyle = '#8a5a3a'; c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
      ell(sx - 8 * s, fy - 5 * s, 9 * s, 6 * s); c.fillStyle = '#a06c46'; c.fill(); c.stroke();
      ell(sx + 9 * s, fy - 4 * s, 8 * s, 5 * s); c.fill(); c.stroke();
      a = { hx: sx, hy: fy - 14 * s, top: fy - 24 * s, s: s };
    } else {
      if (has.illusion) {   // 줄무늬 착시 : 잔상
        c.globalAlpha = 0.3;
        Art.drawAnimal(c, r.a.id, { x: sx - 22 * s, y: o.y, s: s, t: o.t, phase: st.phase - 0.9, pose: 'run', color: o.color });
        Art.drawAnimal(c, r.a.id, { x: sx + 20 * s, y: o.y, s: s, t: o.t, phase: st.phase + 0.9, pose: 'run', color: o.color });
        c.globalAlpha = 1;
      }
      a = Art.drawAnimal(c, r.a.id, o);
    }
    st.hx = a.hx; st.hy = a.hy; st.top = a.top; st.s = s;

    // 앞쪽 효과
    if (has.shield) {
      ell(sx + 3 * s, fy - 50 * s - lift, 50 * s, 58 * s); c.fillStyle = 'rgba(150,225,255,.22)'; c.fill();
      c.lineWidth = 2.4; c.strokeStyle = 'rgba(70,165,230,.85)'; c.stroke();
      ell(sx - 20 * s, fy - 84 * s - lift, 10 * s, 5 * s, -0.6); c.fillStyle = 'rgba(255,255,255,.75)'; c.fill();
    }
    if (has.reflect) {     // 뿔 반사 : 금빛 고리
      ell(sx + 3 * s, fy - 50 * s - lift, 52 * s, 60 * s); c.fillStyle = 'rgba(255,225,90,.16)'; c.fill();
      c.lineWidth = 3; c.strokeStyle = 'rgba(240,170,30,.9)'; c.setLineDash([9, 6]); c.lineDashOffset = -clock * 30; c.stroke(); c.setLineDash([]);
    }
    if (has.thorns) {      // 가시 세우기
      c.strokeStyle = '#8a5a3a'; c.lineWidth = 2.6 * s + 0.8; c.lineCap = 'round';
      for (k = 0; k < 12; k++) {
        var ta = k / 12 * TAU + clock * 1.2, t0 = 50 * s, t1 = (60 + 6 * Math.sin(clock * 9 + k)) * s;
        c.beginPath(); c.moveTo(sx + Math.cos(ta) * t0, fy - 48 * s + Math.sin(ta) * t0); c.lineTo(sx + Math.cos(ta) * t1, fy - 48 * s + Math.sin(ta) * t1); c.stroke();
      }
    }
    if (has.wheel) {       // 쳇바퀴
      c.lineWidth = 4 * s + 1; c.strokeStyle = '#9aa7b8';
      ell(sx, fy - 50 * s, 56 * s, 56 * s); c.stroke();
      c.lineWidth = 2 * s + 0.6;
      for (k = 0; k < 6; k++) { var wa2 = k / 6 * TAU + st.phase * 0.5; c.beginPath(); c.moveTo(sx, fy - 50 * s); c.lineTo(sx + Math.cos(wa2) * 56 * s, fy - 50 * s + Math.sin(wa2) * 56 * s); c.stroke(); }
    }
    if (has.ice) {         // 꽁꽁 얼음
      Art.roundRect(c, sx - 34 * s, a.top - 4 * s, 72 * s, fy - a.top + 8 * s, 10 * s);
      c.fillStyle = 'rgba(170,225,255,.5)'; c.fill(); c.lineWidth = 2.4; c.strokeStyle = 'rgba(90,170,230,.95)'; c.stroke();
      c.beginPath(); c.moveTo(sx - 22 * s, a.top + 10 * s); c.lineTo(sx - 10 * s, a.top + 2 * s); c.moveTo(sx - 24 * s, a.top + 24 * s); c.lineTo(sx - 4 * s, a.top + 6 * s);
      c.lineWidth = 2.2; c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineCap = 'round'; c.stroke();
    }
    if (has.charm) {
      for (k = 0; k < 2; k++) { var hxx = a.hx + (k ? 16 : -14) * s, hyy = a.top - 4 * s - Math.abs(Math.sin(clock * 6 + k)) * 6 * s, hs = 6 * s + 2;
        c.fillStyle = '#ff5a7a'; c.beginPath(); c.moveTo(hxx, hyy + hs * 0.6); c.bezierCurveTo(hxx - hs, hyy - hs * 0.2, hxx - hs * 0.5, hyy - hs, hxx, hyy - hs * 0.35); c.bezierCurveTo(hxx + hs * 0.5, hyy - hs, hxx + hs, hyy - hs * 0.2, hxx, hyy + hs * 0.6); c.fill(); c.lineWidth = 1.4; c.strokeStyle = OL; c.stroke(); }
    }
    if (has.pie || has.ink) {     // 얼굴에 묻은 크림 (먹물이면 검게)
      c.fillStyle = has.pie ? '#fffaf0' : 'rgba(44,34,66,.88)'; c.strokeStyle = has.pie ? '#e8d9c0' : '#1c1530'; c.lineWidth = 1.6;
      c.beginPath();
      for (k = 0; k < 9; k++) { var an = k / 9 * TAU, rr = (15 + 5 * hash(k + i)) * s; if (k === 0) c.moveTo(a.hx + 6 * s + Math.cos(an) * rr, a.hy + Math.sin(an) * rr); else c.lineTo(a.hx + 6 * s + Math.cos(an) * rr, a.hy + Math.sin(an) * rr); }
      c.closePath(); c.fill(); c.stroke();
    }
    if (pose === 'spin' || pose === 'trip' || pose === 'dizzy' || has.swapped || has.bonk) {
      for (k = 0; k < 3; k++) { var sa = clock * 7 + k * 2.09; Art.drawStar(c, a.hx + Math.cos(sa) * 22 * s, a.top + 2 * s + Math.sin(sa) * 6 * s, 6.5 * s, sa, '#ffd23f', 1.6); }
    }
    if (pose === 'zap') {
      c.strokeStyle = '#ffe14d'; c.lineWidth = 3 * s + 1; c.lineJoin = 'miter';
      for (k = 0; k < 4; k++) {
        var za = k * 1.57 + Math.floor(clock * 20) * 0.7, zx = sx + Math.cos(za) * 44 * s, zy = fy - 50 * s - lift + Math.sin(za) * 50 * s;
        c.beginPath(); c.moveTo(zx, zy); c.lineTo(zx + 8 * s, zy + 6 * s); c.lineTo(zx + 2 * s, zy + 9 * s); c.lineTo(zx + 10 * s, zy + 16 * s); c.stroke();
      }
    }
    if (has.lost) {
      c.font = Math.round(22 * s + 8) + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineWidth = 4; c.strokeStyle = OL; c.strokeText('?', a.hx + 26 * s, a.top + 4 * s); c.fillStyle = '#fff'; c.fillText('?', a.hx + 26 * s, a.top + 4 * s);
    }
    if (has.stink) {
      c.strokeStyle = '#8fc24a'; c.lineWidth = 2.4 * s + 0.6; c.lineCap = 'round';
      for (k = 0; k < 3; k++) {
        var gx = a.hx - 14 * s + k * 14 * s, gy = a.top - 2 * s;
        c.beginPath(); c.moveTo(gx, gy); c.quadraticCurveTo(gx + 5 * s, gy - 6 * s, gx, gy - 12 * s + Math.sin(clock * 8 + k) * 2); c.quadraticCurveTo(gx - 5 * s, gy - 18 * s, gx, gy - 22 * s); c.stroke();
      }
    }
    if (has.bees || has.sting) {
      for (k = 0; k < 4; k++) Art.drawBee(c, a.hx - (26 + k * 9) * s + Math.sin(clock * 9 + k * 2) * 6 * s, a.hy - 6 * s + Math.cos(clock * 11 + k * 1.3) * 12 * s, s * 0.9, clock + k);
    }
    if (st.burst > 0) {
      c.globalAlpha = st.burst;
      for (k = 0; k < 8; k++) {
        var ba = k / 8 * TAU, b0 = (40 + (1 - st.burst) * 40) * s, b1 = b0 + 14 * s;
        c.beginPath(); c.moveTo(sx + Math.cos(ba) * b0, fy - 48 * s - lift + Math.sin(ba) * b0); c.lineTo(sx + Math.cos(ba) * b1, fy - 48 * s - lift + Math.sin(ba) * b1);
        c.lineWidth = 3.5 * s + 1; c.strokeStyle = '#ffe14d'; c.lineCap = 'round'; c.stroke();
      }
      c.globalAlpha = 1;
    }
  }

  // 달릴 때 나오는 작은 효과 (먼지 · 땀 · 방귀 구름 …)
  function emitRacerParts(dt) {
    for (var i = 0; i < n; i++) {
      var r = race.racers[i], st = RS[i];
      if (!st.vis) continue;
      var has = fxMap(r), s = st.s;
      if (st.cheerT > 0) st.cheerT -= dt;
      if (st.tearT > 0) { st.tearT -= dt; if (Math.random() < dt * 24) parts.push({ kind: 'drop', scr: true, x: st.hx + 10 * s, y: st.hy, vx: -40 + Math.random() * 80, vy: -90, life: 0, max: 0.6, size: 3.4 * s + 1 }); }
      st.dustT -= dt;
      if (st.dustT <= 0 && r.v > 3 && st.lift < 4) {
        st.dustT = 0.1 + Math.random() * 0.08;
        parts.push({ kind: 'dust', x: r.x - 0.45, y: st.fy - 1, vx: -1.2, vy: -10 - Math.random() * 8, life: 0, max: 0.42, size: (3.5 + Math.random() * 3) * s });
      }
      if (st.fxT > 0 || has.fart) {
        st.fxT -= dt;
        if (Math.random() < dt * 22) parts.push({ kind: 'puff', x: r.x - 1.0, y: st.fy - 30 * s, vx: -3 - Math.random() * 2, vy: -8 - Math.random() * 16, life: 0, max: 1.3, size: (9 + Math.random() * 8) * s });
      }
      if ((has.tired || has.hot || has.scared || has.wet || has.puddle) && Math.random() < dt * 9) {
        parts.push({ kind: 'drop', scr: true, x: st.hx + (Math.random() - 0.3) * 30 * s, y: st.hy - 10 * s, vx: -30 - Math.random() * 30, vy: -50, life: 0, max: 0.6, size: 3.2 * s + 1 });
      }
      if (has.sleep && Math.random() < dt * 3.2) parts.push({ kind: 'z', scr: true, x: st.hx + 18 * s, y: st.top + 6 * s, vx: 14, vy: -34, life: 0, max: 1.2, size: 12 * s + 6 });
      if ((has.star || has.cheer || has.snack || has.carrot || has.power || has.buddy) && Math.random() < dt * 12) {
        parts.push({ kind: has.cheer || has.buddy ? 'note' : 'spark', scr: true, x: st.sx + (Math.random() - 0.5) * 50 * s, y: st.fy - st.lift - Math.random() * 90 * s, vx: -40, vy: -20 - Math.random() * 20, life: 0, max: 0.6, size: (5 + Math.random() * 5) * s + 2, col: has.star ? LC[Math.floor(Math.random() * 8)] : '#fff6a8' });
      }
      if ((has.slide || has.splash) && Math.random() < dt * 20) parts.push({ kind: 'drop', scr: true, x: st.sx - 10 * s, y: st.fy - 4, vx: -80 - Math.random() * 60, vy: -60 - Math.random() * 50, life: 0, max: 0.45, size: 3 * s + 1 });
    }
  }

  function drawParts(dt) {
    for (var j = parts.length - 1; j >= 0; j--) {
      var p = parts[j];
      p.life += dt;
      if (p.life < 0) continue;
      if (p.life >= p.max) { parts.splice(j, 1); continue; }
      var k = p.life / p.max, x, y;
      if (p.scr) { p.x += p.vx * dt; p.y += p.vy * dt; x = p.x; y = p.y; }
      else { p.x += p.vx * dt; p.y += p.vy * dt; x = sxOf(p.x); y = p.y; }
      switch (p.kind) {
        case 'dust': ell(x, y, p.size * (0.5 + k), p.size * (0.5 + k) * 0.8); c.fillStyle = 'rgba(255,246,236,' + (0.5 * (1 - k)) + ')'; c.fill(); break;
        case 'puff': ell(x, y, p.size * (0.6 + k * 1.2), p.size * (0.6 + k * 1.2) * 0.85); c.fillStyle = 'rgba(160,210,90,' + (0.6 * (1 - k)) + ')'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = 'rgba(100,150,50,' + (0.5 * (1 - k)) + ')'; c.stroke(); break;
        case 'drop': p.vy += 380 * dt; c.globalAlpha = 1 - k; Art.drawDrop(c, x, y, p.size, '#8fd8ff'); c.globalAlpha = 1; break;
        case 'spark': c.globalAlpha = 1 - k; Art.drawStar(c, x, y, p.size, p.life * 6, p.col, 1.2); c.globalAlpha = 1; break;
        case 'note':
          c.globalAlpha = 1 - k; c.fillStyle = '#ff7fa8'; c.strokeStyle = OL; c.lineWidth = 1.2;
          ell(x, y, p.size * 0.5, p.size * 0.4, -0.3); c.fill(); c.stroke();
          c.beginPath(); c.moveTo(x + p.size * 0.45, y); c.lineTo(x + p.size * 0.45, y - p.size * 1.3); c.lineTo(x + p.size, y - p.size); c.lineWidth = 1.8; c.stroke();
          c.globalAlpha = 1; break;
        case 'heart':
          c.globalAlpha = 1 - k; c.fillStyle = '#ff5a7a';
          c.beginPath(); c.moveTo(x, y + p.size * 0.6); c.bezierCurveTo(x - p.size, y - p.size * 0.2, x - p.size * 0.5, y - p.size, x, y - p.size * 0.35); c.bezierCurveTo(x + p.size * 0.5, y - p.size, x + p.size, y - p.size * 0.2, x, y + p.size * 0.6); c.fill();
          c.lineWidth = 1.4; c.strokeStyle = OL; c.stroke(); c.globalAlpha = 1; break;
        case 'z':
          c.globalAlpha = 1 - k; c.font = Math.round(p.size * (0.7 + k * 0.6)) + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.lineWidth = 3; c.strokeStyle = OL; c.strokeText('Z', x, y); c.fillStyle = '#cfe6ff'; c.fillText('Z', x, y); c.globalAlpha = 1; break;
        case 'conf':
          p.rot += p.vr * dt; p.vx *= 0.99;
          c.save(); c.translate(x, y); c.rotate(p.rot); c.fillStyle = p.col; c.globalAlpha = k > 0.8 ? (1 - k) * 5 : 1; c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); c.restore(); c.globalAlpha = 1; break;
        case 'snack':
          p.rot += p.vr * dt;
          if (y > p.gy) { p.life = p.max; break; }
          c.save(); c.translate(x, y); c.rotate(p.rot); Art.drawItemIcon(c, 'carrot', 0, 0, p.size); c.restore(); break;
        case 'shoot':
          c.strokeStyle = 'rgba(255,245,170,' + (0.8 * (1 - k)) + ')'; c.lineWidth = 5; c.lineCap = 'round';
          c.beginPath(); c.moveTo(x, y); c.lineTo(x - p.vx * 0.12, y - p.vy * 0.12); c.stroke();
          Art.drawStar(c, x, y, p.size, p.life * 9, '#ffe14d', 2); break;
        case 'leaf':
          p.rot += p.vr * dt;
          c.save(); c.translate(x, y); c.rotate(p.rot); ell(0, 0, p.size, p.size * 0.45); c.fillStyle = p.col; c.fill(); c.restore(); break;
      }
    }
  }

  // 날아가는 것들 (바나나 · 파이 · 물줄기 …)
  function drawProjs(dt) {
    var j, k;
    for (j = projs.length - 1; j >= 0; j--) {
      var p = projs[j];
      p.age += dt;
      if (p.age >= p.dur) { projs.splice(j, 1); continue; }
      var a = RS[p.from], b = RS[p.to];
      if (!a || !b) { projs.splice(j, 1); continue; }
      k = p.age / p.dur;
      var ax = a.sx + 14 * a.s, ay = a.fy - 60 * a.s - a.lift, bx = b.hx, by = b.hy;
      if (p.kind === 'banana') { bx = b.sx + 40 * b.s; by = b.fy; }
      var x = ax + (bx - ax) * k, y = ay + (by - ay) * k - Math.sin(PI * k) * 46;
      switch (p.kind) {
        case 'banana': c.save(); c.translate(x, y); c.rotate(p.age * 16); Art.drawItemIcon(c, 'banana', 0, 0, 26 * a.s + 10); c.restore(); break;
        case 'pie': c.save(); c.translate(x, y); c.rotate(p.age * 10); Art.drawItemIcon(c, 'pie', 0, 0, 28 * a.s + 10); c.restore(); break;
        case 'steal': Art.drawItemBox(c, x, y + 14, 22 * b.s + 10, clock); break;
        case 'paw':
          c.save(); c.translate(x, y); ell(0, 0, 9, 8); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
          for (var q = 0; q < 3; q++) { ell(-6 + q * 6, -9, 3, 3.4); c.fillStyle = '#ffb3c4'; c.fill(); c.stroke(); }
          c.restore(); break;
        case 'water':
          for (var w = 0; w < 9; w++) {
            var kk = clamp(k * 1.6 - w * 0.06, 0, 1);
            if (kk <= 0 || kk >= 1) continue;
            var wx = ax + 30 * a.s + (bx - ax - 30 * a.s) * kk, wy = ay + 10 * a.s + (by - ay) * kk - Math.sin(PI * kk) * 40;
            Art.drawDrop(c, wx, wy, 5.5 - w * 0.25, '#7fd0ff');
          }
          break;
        case 'acorn':
          c.save(); c.translate(x, y); c.rotate(p.age * 14);
          ell(0, 1, 5.5, 6.5); c.fillStyle = '#c98a4a'; c.fill(); c.lineWidth = 1.6; c.strokeStyle = OL; c.stroke();
          c.beginPath(); c.arc(0, -2, 6, Math.PI, 0); c.closePath(); c.fillStyle = '#8a5a3a'; c.fill(); c.stroke();
          c.restore(); break;
        case 'egg':
          c.save(); c.translate(x, y); c.rotate(p.age * 10); ell(0, 0, 6, 7.6); c.fillStyle = '#fffaf0'; c.fill(); c.lineWidth = 1.8; c.strokeStyle = OL; c.stroke(); c.restore(); break;
        case 'frost':
          for (var fq = 0; fq < 4; fq++) Art.drawStar(c, x - fq * 9, y + Math.sin(p.age * 30 + fq) * 4, 6 - fq, p.age * 8 + fq, '#d6f2ff', 1.2);
          break;
        case 'spit': Art.drawDrop(c, x, y, 6, '#cfe8a0'); break;
        case 'tongue':
          c.beginPath(); c.moveTo(a.sx + 20 * a.s, a.fy - 62 * a.s - a.lift); c.lineTo(bx - 10 * b.s, b.fy - 40 * b.s);
          c.lineCap = 'round'; c.lineWidth = 7 * a.s + 2.5; c.strokeStyle = OL; c.stroke(); c.lineWidth = 7 * a.s; c.strokeStyle = '#ff7fa0'; c.stroke();
          break;
        case 'magnet':
          c.setLineDash([6, 6]); c.lineDashOffset = -clock * 60; c.strokeStyle = 'rgba(255,90,95,.85)'; c.lineWidth = 3;
          c.beginPath(); c.moveTo(a.sx + 10 * a.s, a.fy - 40 * a.s); c.lineTo(b.sx - 10 * b.s, b.fy - 40 * b.s); c.stroke(); c.setLineDash([]);
          Art.drawItemIcon(c, 'magnet', a.sx + 26 * a.s, a.fy - 44 * a.s, 22 * a.s + 6);
          break;
      }
    }
    // 비치볼 : 던진 동물 → 맨 앞 → 둘째로 통통
    for (j = balls.length - 1; j >= 0; j--) {
      var bl = balls[j]; bl.age += dt;
      var seg = Math.floor(bl.age / 0.4);
      if (seg >= bl.to.length) { balls.splice(j, 1); continue; }
      var bA = RS[seg === 0 ? bl.from : bl.to[seg - 1]], bB = RS[bl.to[seg]], bk = (bl.age - seg * 0.4) / 0.4;
      var ballX = bA.hx + (bB.hx - bA.hx) * bk, ballY = bA.top + (bB.top - bA.top) * bk - Math.sin(PI * bk) * 60, br2 = 11 * bB.s + 4;
      ell(ballX, ballY, br2, br2); c.fillStyle = '#fff'; c.fill();
      c.save(); ell(ballX, ballY, br2, br2); c.clip();
      c.fillStyle = '#ff5a5f'; c.fillRect(ballX - br2, ballY - br2, br2 * 0.7, br2 * 2); c.fillStyle = '#4d8df0'; c.fillRect(ballX + br2 * 0.3, ballY - br2, br2 * 0.7, br2 * 2); c.fillStyle = '#ffd23f'; c.fillRect(ballX - br2 * 0.3, ballY - br2, br2 * 0.6, br2 * 2);
      c.restore();
      ell(ballX, ballY, br2, br2); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
    }
    // 번개
    for (j = bolts.length - 1; j >= 0; j--) {
      var bo = bolts[j]; bo.age += dt;
      if (bo.age > 0.45) { bolts.splice(j, 1); continue; }
      var t = RS[bo.r];
      if (bo.age < 0.3 && Math.floor(bo.age * 30) % 2 === 0) Art.drawBolt(c, t.hx + 20, 0, t.hx, t.hy, 5, bo.seed);
    }
    // UFO
    for (j = ufos.length - 1; j >= 0; j--) {
      var u = ufos[j]; u.age += dt;
      if (u.age > 2.5) { ufos.splice(j, 1); continue; }
      var ut = RS[u.r], us = ut.s * 1.25;
      var ux = ut.sx + (u.age < 0.3 ? (0.3 - u.age) * 900 : (u.age > 1.9 ? (u.age - 1.9) * 1100 : 0));
      var uy = ut.fy - 185 * ut.s + Math.sin(clock * 5) * 3 - (u.age > 1.9 ? (u.age - 1.9) * 200 : 0);
      if (u.age > 0.3 && u.age < 1.85) Art.drawBeam(c, ux, uy, ut.fy, 34 * ut.s, clock);
      Art.drawUFO(c, ux, uy, us, clock);
    }
    // 회오리
    for (j = twisters.length - 1; j >= 0; j--) {
      var tw = twisters[j]; tw.age += dt;
      if (tw.age < 0) continue;
      if (tw.age > tw.dur) { twisters.splice(j, 1); continue; }
      var ta = RS[tw.from], tb = RS[tw.to]; k = clamp(tw.age / 0.45, 0, 1);
      Art.drawTornado(c, ta.sx + (tb.sx - ta.sx) * k, ta.fy + (tb.fy - ta.fy) * k + 4, tb.s * 1.5, clock);
    }
    // 퍼지는 고리 (스킬 · 포효 · 포탈)
    for (j = rings.length - 1; j >= 0; j--) {
      var rg = rings[j]; rg.age += dt;
      if (rg.age < 0) continue;
      if (rg.age > rg.dur) { rings.splice(j, 1); continue; }
      var rt = RS[rg.r]; k = rg.age / rg.dur;
      var rad = (rg.big ? 30 + k * 150 : 20 + k * 70) * rt.s;
      ell(rt.sx, rt.fy - 46 * rt.s - rt.lift, rad, rad * 0.8);
      c.lineWidth = (rg.big ? 6 : 4) * (1 - k) + 1; c.strokeStyle = rg.col; c.globalAlpha = 1 - k; c.stroke(); c.globalAlpha = 1;
    }
  }

  // ───────────── 이름표 · 말풍선 ─────────────
  var faceCache = {};
  R.faceCanvas = function (id, size) {
    var key = id + '_' + size;
    if (faceCache[key]) return faceCache[key];
    var f = document.createElement('canvas'), d = Math.min(2, root.devicePixelRatio || 1);
    f.width = f.height = Math.round(size * d);
    var fc = f.getContext('2d'); fc.scale(d, d);
    Art.drawFace(fc, id, size / 2, size / 2 + size * 0.06, size * 0.8, 1);
    faceCache[key] = f;
    return f;
  };

  function drawTags(dt) {
    var fs = clamp(Math.round(11 + sA * 5) - (n > 12 ? 2 : (n > 8 ? 1 : 0)), 9, 16), j, k;
    c.textBaseline = 'middle';
    for (var i = 0; i < n; i++) {
      var r = race.racers[i], st = RS[i];
      if (!st.vis) {
        // 화면 왼쪽 밖 : 가장자리에 작은 표시
        if (st.sx <= -90 && mode !== 'countdown') {
          var ey = st.fy - L.laneH * 0.45, gapM = Math.round(view.camX - r.x);
          c.font = '12px ' + FONT;
          var etxt = '◀ ' + r.lane + '번 ' + Math.max(1, gapM) + 'm', ew = c.measureText(etxt).width + 14;
          Art.roundRect(c, 4, ey - 10, ew, 20, 10); c.fillStyle = LC[i]; c.fill(); c.lineWidth = 1.6; c.strokeStyle = '#fff'; c.stroke();
          c.fillStyle = LT[i]; c.textAlign = 'left'; c.fillText(etxt, 11, ey + 1);
        }
        if (st.sx >= W + 90 && mode !== 'countdown') {
          var ey2 = st.fy - L.laneH * 0.45, gap2 = Math.round(r.x - view.camX - view.viewM);
          c.font = '12px ' + FONT;
          var etxt2 = r.lane + '번 ' + Math.max(1, gap2) + 'm ▶', ew2 = c.measureText(etxt2).width + 14;
          Art.roundRect(c, W - ew2 - 4, ey2 - 10, ew2, 20, 10); c.fillStyle = LC[i]; c.fill(); c.lineWidth = 1.6; c.strokeStyle = '#fff'; c.stroke();
          c.fillStyle = LT[i]; c.textAlign = 'left'; c.fillText(etxt2, W - ew2 + 3, ey2 + 1);
        }
        st.pops.length = 0;
        continue;
      }
      c.font = fs + 'px ' + FONT;
      var name = r.name, tw = c.measureText(name).width, chip = fs + 4, w = tw + chip + 14, h = fs + 8;
      var x = clamp(st.hx - w / 2, 3, W - w - 3), y = Math.max(L.hud + 2, st.top - h - 5);
      if (follow === i) { Art.roundRect(c, x - 3, y - 3, w + 6, h + 6, h / 2 + 3); c.fillStyle = '#fff'; c.fill(); }
      Art.roundRect(c, x, y, w, h, h / 2); c.fillStyle = LC[i]; c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
      ell(x + h / 2, y + h / 2, chip / 2, chip / 2); c.fillStyle = '#fff'; c.fill();
      c.fillStyle = OL; c.textAlign = 'center'; c.font = (fs - 1) + 'px ' + FONT; c.fillText(String(r.lane), x + h / 2, y + h / 2 + 1);
      c.font = fs + 'px ' + FONT; c.fillStyle = LT[i]; c.textAlign = 'left'; c.fillText(name, x + chip + 7, y + h / 2 + 1);
      // 들고 있는 아이템
      if (r.item) {
        var ir = h * 0.72, ix = x - ir - 2, iy = y + h / 2;
        if (ix < ir + 2) ix = x + w + ir + 2;
        ell(ix, iy, ir, ir); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
        Art.drawItemIcon(c, r.item, ix, iy, ir * 1.5);
      }
      // 말풍선 글자
      for (j = st.pops.length - 1; j >= 0; j--) {
        var p = st.pops[j]; p.age += dt;
        if (p.age > 1.25) { st.pops.splice(j, 1); continue; }
      }
      for (j = 0; j < st.pops.length; j++) {
        p = st.pops[j]; k = p.age / 1.25;
        var big = p.cls === 'skill', pf = Math.round((big ? fs + 6 : fs + 1) * (p.age < 0.12 ? 0.6 + p.age / 0.12 * 0.5 : 1));
        c.font = pf + 'px ' + FONT; c.textAlign = 'center';
        var px = clamp(st.hx, 40, W - 40), py = y - 10 - (st.pops.length - 1 - j) * (fs + 6) - k * 16;
        c.globalAlpha = k > 0.75 ? (1 - k) * 4 : 1;
        c.lineWidth = big ? 5 : 4; c.strokeStyle = OL; c.lineJoin = 'round'; c.strokeText(p.text, px, py);
        c.fillStyle = big ? '#ffe14d' : (p.cls === 'bad' ? '#ffb0b0' : (p.cls === 'good' ? '#c8ffab' : '#ffffff'));
        c.fillText(p.text, px, py);
        c.globalAlpha = 1;
      }
    }
  }

  // ───────────── 날씨 효과 ─────────────
  function drawWeather(dt) {
    var id = sky.cur, j, p, want = 0, kind = null;
    if (id === 'rain' || id === 'storm') { want = id === 'storm' ? 150 : 110; kind = 'rain'; }
    else if (id === 'snow') { want = 90; kind = 'snow'; }
    if (L.narrow) want = Math.round(want * 0.55);
    if (kind && (!weatherP.length || weatherP.kind !== kind)) { weatherP = []; weatherP.kind = kind; }
    if (!kind && weatherP.length) weatherP = [];
    while (kind && weatherP.length < want) weatherP.push({ x: Math.random() * (W + 200) - 100, y: Math.random() * H, v: 0.6 + Math.random() * 0.8, ph: Math.random() * 6 });
    if (kind === 'rain') {
      c.strokeStyle = 'rgba(215,235,255,.6)'; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath();
      for (j = 0; j < weatherP.length; j++) {
        p = weatherP[j]; p.y += 760 * p.v * dt; p.x -= 240 * p.v * dt;
        if (p.y > H) { p.y = -20; p.x = Math.random() * (W + 300); }
        c.moveTo(p.x, p.y); c.lineTo(p.x - 5, p.y + 16);
      }
      c.stroke();
      if (id === 'storm') { c.fillStyle = 'rgba(20,25,50,.16)'; c.fillRect(0, 0, W, H); }
    } else if (kind === 'snow') {
      c.fillStyle = 'rgba(255,255,255,.92)';
      for (j = 0; j < weatherP.length; j++) {
        p = weatherP[j]; p.y += 70 * p.v * dt; p.x += (Math.sin(clock * 1.5 + p.ph) * 22 - 40) * dt;
        if (p.y > H) { p.y = -10; p.x = Math.random() * (W + 200); }
        ell(p.x, p.y, 2 + p.v * 1.6, 2 + p.v * 1.6); c.fill();
      }
    }
    if (id === 'fog') {
      for (j = 0; j < 6; j++) {
        var span = W + 500, fx = ((hash(j + 40) * span + clock * (14 + j * 5)) % span) - 250, fy = L.trackTop - 30 + hash(j + 60) * (L.trackH + 40);
        var g = c.createRadialGradient(fx, fy, 10, fx, fy, 260);
        g.addColorStop(0, 'rgba(240,245,250,.3)'); g.addColorStop(1, 'rgba(240,245,250,0)');
        c.fillStyle = g; c.fillRect(fx - 260, fy - 120, 520, 240);
      }
      c.fillStyle = 'rgba(235,240,246,.22)'; c.fillRect(0, 0, W, H);
    }
    if (id === 'heat') {
      var hg = c.createLinearGradient(0, 0, 0, H);
      hg.addColorStop(0, 'rgba(255,150,60,.16)'); hg.addColorStop(1, 'rgba(255,150,60,.03)');
      c.fillStyle = hg; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 2; c.lineCap = 'round';
      for (j = 0; j < 7; j++) {
        var hx = ((hash(j + 80) * W + clock * 12) % W), hy = L.trackTop + 6 + hash(j + 90) * (L.trackH * 0.3);
        c.beginPath(); c.moveTo(hx, hy);
        for (var q = 1; q <= 4; q++) c.lineTo(hx + q * 9, hy + Math.sin(clock * 5 + j + q * 1.6) * 3);
        c.stroke();
      }
    }
    if (id === 'wind' || gustT > 0) {
      if (gustT > 0) gustT -= dt;
      var act = id === 'wind' && race.weather.gust ? (race.weather.gust > 0 ? 1 : -1) : 0;
      if (act && Math.random() < dt * 26) {
        parts.push({ kind: 'leaf', scr: true, x: act > 0 ? -10 : W + 10, y: L.hud + Math.random() * (H - L.hud), vx: act * (420 + Math.random() * 260), vy: (Math.random() - 0.5) * 60, life: 0, max: 2.2, rot: Math.random() * 6, vr: 9, size: 4 + Math.random() * 4, col: Math.random() < 0.5 ? '#8fd46b' : '#ffd08a' });
      }
      if (act) {
        c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2.4; c.lineCap = 'round';
        for (j = 0; j < 9; j++) {
          var wy = L.hud + 20 + hash(j + 11) * (H - L.hud - 40), wl = 60 + hash(j + 5) * 90;
          var wx = ((hash(j) * (W + 300) + act * clock * (520 + j * 40)) % (W + 300) + (W + 300)) % (W + 300) - 150;
          c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx - act * wl, wy); c.stroke();
        }
      }
    }
    if (nightT > 0) {
      nightT -= dt;
      var na = Math.min(1, nightT / 0.4, (2.4 - nightT) / 0.3);
      c.fillStyle = 'rgba(15,20,50,' + (0.55 * clamp(na, 0, 1)) + ')'; c.fillRect(0, 0, W, H);
      for (j = 0; j < 14; j++) Art.drawStar(c, hash(j + 200) * W, hash(j + 300) * L.trackTop, 3 + hash(j) * 3, clock + j, 'rgba(255,245,170,' + (0.9 * clamp(na, 0, 1)) + ')', 0);
    }
    if (flashA > 0) { c.fillStyle = 'rgba(255,255,240,' + (flashA * 0.6) + ')'; c.fillRect(0, 0, W, H); flashA -= dt * 2.6; }
  }

  // ───────────── 위쪽 표시 (날씨 · 거리 · 시간) ─────────────
  function pill(x, y, w, h) { Art.roundRect(c, x, y, w, h, h / 2); c.fillStyle = 'rgba(255,252,244,.94)'; c.fill(); c.lineWidth = 2.2; c.strokeStyle = OL; c.stroke(); }
  function drawHud() {
    var h = L.narrow ? 26 : 32, y = 6, w = race.weather, fs = L.narrow ? 13 : 15;
    c.font = fs + 'px ' + FONT; c.textBaseline = 'middle';
    var wtxt = w.name, ww = c.measureText(wtxt).width + h + 16;
    pill(6, y, ww, h);
    Art.drawWeatherIcon(c, w.id, 6 + h / 2 + 3, y + h / 2, h * 0.86, clock);
    c.fillStyle = OL; c.textAlign = 'left'; c.fillText(wtxt, 6 + h + 6, y + h / 2 + 1);
    // 시간
    var tt = mode === 'countdown' ? 0 : race.t, ts = tt.toFixed(1) + '초';
    var tw = c.measureText('000.0초').width + 22;
    pill(W - tw - 6, y, tw, h);
    c.textAlign = 'center'; c.fillStyle = OL; c.fillText(ts, W - tw / 2 - 6, y + h / 2 + 1);
    // 거리 막대
    var mx0, mx1, my;
    if (L.narrow) { mx0 = 16; mx1 = W - 22; my = y + h + 16; }
    else { mx0 = ww + 30; mx1 = W - tw - 34; my = y + h / 2; }
    var bw = mx1 - mx0;
    Art.roundRect(c, mx0 - 9, my - 6, bw + 18, 12, 6); c.fillStyle = 'rgba(255,252,244,.94)'; c.fill(); c.lineWidth = 2.2; c.strokeStyle = OL; c.stroke();
    c.fillStyle = 'rgba(74,50,38,.45)';
    for (var q = 1; q < 5; q++) c.fillRect(mx0 + bw * q / 5 - 1, my - 4, 2, 8);
    // 결승 깃발
    c.fillStyle = OL; c.fillRect(mx1 + 1, my - 14, 2, 20);
    for (var fy = 0; fy < 2; fy++) for (var fx = 0; fx < 3; fx++) { c.fillStyle = (fx + fy) % 2 ? '#fff' : '#2b2018'; c.fillRect(mx1 + 3 + fx * 4, my - 14 + fy * 4, 4, 4); }
    c.strokeStyle = OL; c.lineWidth = 1; c.strokeRect(mx1 + 3, my - 14, 12, 8);
    // 동물 점 (꼴찌부터 그려서 선두가 위에)
    var ord = race.order.slice().reverse(), rad = (L.narrow ? 8 : 9.5) * (n > 12 ? 0.72 : 1);
    for (var j = 0; j < ord.length; j++) {
      var r = ord[j], px = mx0 + bw * clamp(r.x / S.LEN, 0, 1), py = my + (r.i % 2 ? 3 : -3);
      ell(px, py, rad, rad); c.fillStyle = LC[r.i]; c.fill(); c.lineWidth = follow === r.i ? 3 : 1.8; c.strokeStyle = follow === r.i ? '#fff' : OL; c.stroke();
      c.fillStyle = LT[r.i]; c.font = Math.round((L.narrow ? 10 : 12) * (n > 12 ? 0.8 : 1)) + 'px ' + FONT; c.textAlign = 'center'; c.fillText(String(r.lane), px, py + 1);
    }
  }

  function drawBanner(dt) {
    if (!banner) return;
    banner.age += dt;
    if (banner.age > banner.dur) { banner = null; return; }
    var k = banner.age, sc = k < 0.22 ? 0.5 + (k / 0.22) * 0.6 : (k < 0.34 ? 1.1 - (k - 0.22) / 0.12 * 0.1 : 1);
    var al = banner.age > banner.dur - 0.35 ? (banner.dur - banner.age) / 0.35 : 1;
    var f1 = L.narrow ? 19 : 26, f2 = L.narrow ? 12 : 15, ic = L.narrow ? 34 : 46;
    c.font = f1 + 'px ' + FONT; var w1 = c.measureText(banner.title).width;
    c.font = f2 + 'px ' + FONT; var w2 = c.measureText(banner.sub).width;
    var w = Math.max(w1, w2) + ic + 44, h = f1 + f2 + 24, x = W / 2, y = L.hud + 8 + h / 2;
    c.save(); c.globalAlpha = al; c.translate(x, y); c.scale(sc, sc);
    Art.roundRect(c, -w / 2, -h / 2, w, h, 18); c.fillStyle = '#fff8e2'; c.fill(); c.lineWidth = 3.5; c.strokeStyle = OL; c.stroke();
    Art.roundRect(c, -w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 13); c.lineWidth = 2; c.strokeStyle = '#ffb02e'; c.setLineDash([7, 6]); c.stroke(); c.setLineDash([]);
    Art.drawEventIcon(c, banner.id, -w / 2 + 16 + ic / 2, 0, ic, clock);
    c.textAlign = 'left'; c.textBaseline = 'middle';
    c.font = f1 + 'px ' + FONT; c.fillStyle = '#ff5a3c'; c.fillText(banner.title, -w / 2 + ic + 26, -f2 / 2 - 1);
    c.font = f2 + 'px ' + FONT; c.fillStyle = OL; c.fillText(banner.sub, -w / 2 + ic + 26, f1 / 2 + 3);
    c.restore();
  }

  function drawCountdown() {
    var txt = null, k = 0;
    if (mode === 'countdown') {
      if (cd > 3) { txt = '준비!'; k = 0.5; }
      else { txt = String(Math.ceil(cd)); k = cd - Math.floor(cd); if (cd === Math.floor(cd)) k = 1; }
    } else if (goT > 0) { txt = '출발!'; k = goT / 0.9; }
    if (!txt) return;
    var size = Math.min(W * 0.22, H * 0.34) * (0.75 + 0.35 * k);
    c.save(); c.globalAlpha = Math.min(1, k * 2.5);
    c.font = Math.round(size) + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.lineWidth = size * 0.16; c.strokeStyle = OL; c.strokeText(txt, W / 2, H * 0.5);
    c.lineWidth = size * 0.07; c.strokeStyle = '#fff'; c.strokeText(txt, W / 2, H * 0.5);
    c.fillStyle = txt === '출발!' ? '#ff5a3c' : '#ffd23f'; c.fillText(txt, W / 2, H * 0.5);
    c.restore();
  }

  // ───────────── 한 장 그리기 ─────────────
  R.frame = function (dt, simDt) {
    clock += dt;
    if (goT > 0) goT -= dt;
    if (excite > 0) excite -= dt;
    if (race.weather.id !== sky.cur) { sky.prev = sky.cur; sky.cur = race.weather.id; sky.mix = 0; }
    if (sky.mix < 1) sky.mix = Math.min(1, sky.mix + dt * 0.9);
    var i;
    for (i = 0; i < n; i++) {
      var r = race.racers[i], st = RS[i];
      st.phase += r.v * simDt * 2.5 / Math.sqrt(Art.SPEC[r.a.id].size);
      if (st.spray > 0) st.spray -= dt;
      if (st.burst > 0) st.burst = Math.max(0, st.burst - dt * 2.2);
    }
    updateCamera(Math.max(dt, simDt || 0));

    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    c.clearRect(0, 0, W, H);
    drawSky();
    drawStands();
    drawTrack();
    drawSigns();
    for (i = 0; i < n; i++) { drawLaneObjects(i); drawRacer(i); }
    drawBottom();
    emitRacerParts(dt);
    drawParts(dt);
    drawProjs(dt);
    drawTags(dt);
    drawWeather(dt);
    drawHud();
    drawBanner(dt);
    drawCountdown();
  };

  R.clock = function () { return clock; };
  root.Render = R;
})(window);
