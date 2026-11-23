/* 동물 달리기 500m — 화면 흐름 (이름 넣기 → 출전 동물 → 경주 → 결과) */
(function () {
  'use strict';
  var S = window.RaceSim, Art = window.Art, Sfx = window.Sfx, Render = window.Render;
  var LC = Art.LANE_COLORS, LT = Art.LANE_TEXT, OL = Art.OL;
  var FONT = '"Jua", "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
  var KEY = 'animalRace.v1', STEP = 1 / 60;
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }

  var MAXN = Art.MAX_LANES || 22;
  var G = { screen: 'setup', n: 8, names: [], pace: 1, sound: true, race: null, speedMul: 1, resultShown: false };
  for (var gi = 0; gi < MAXN; gi++) G.names.push('');
  var acc = 0, doneAt = 0, lastTs = 0, rankRows = [], rankT = 0, cardCtx = [], heroPick = null, podium = null;

  // ───────────── 저장 (이 브라우저에만) ─────────────
  function loadState() {
    try {
      var j = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (j && typeof j === 'object') {
        if (j.n >= 2 && j.n <= MAXN) G.n = j.n | 0;
        if (Array.isArray(j.names)) for (var i = 0; i < MAXN; i++) G.names[i] = typeof j.names[i] === 'string' ? j.names[i].slice(0, 10) : '';
        if (j.pace === 1 || j.pace === 1.6 || j.pace === 2.6) G.pace = j.pace;
        if (j.sound === false) G.sound = false;
      }
    } catch (e) { /* 저장소를 못 쓰는 환경이면 그냥 기본값 */ }
  }
  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify({ n: G.n, names: G.names, pace: G.pace, sound: G.sound })); } catch (e) { /* 무시 */ }
  }

  function show(screen) {
    G.screen = screen;
    ['setup', 'lineup', 'race'].forEach(function (s) { $('scr-' + s).classList.toggle('on', s === screen); });
    window.scrollTo(0, 0);
  }

  // 작은 그림을 <img> 로 (순위표 · 도감)
  var urlCache = {};
  function iconURL(kind, id, size) {
    var key = kind + ':' + id + ':' + size;
    if (urlCache[key]) return urlCache[key];
    var cv = document.createElement('canvas'), d = 2;
    cv.width = cv.height = size * d;
    var c = cv.getContext('2d'); c.scale(d, d);
    if (kind === 'face') Art.drawFace(c, id, size / 2, size / 2 + size * 0.06, size * 0.8, 1);
    else if (kind === 'item') Art.drawItemIcon(c, id, size / 2, size / 2, size * 0.86);
    else if (kind === 'wx') Art.drawWeatherIcon(c, id, size / 2, size / 2, size * 0.86, 1.3);
    else if (kind === 'ev') Art.drawEventIcon(c, id, size / 2, size / 2, size * 0.8, 1.3);
    urlCache[key] = cv.toDataURL('image/png');
    return urlCache[key];
  }
  function chip(i, small) {
    var c = el('span', 'chip' + (small ? ' s' : ''), String(i + 1));
    c.style.setProperty('--lane', LC[i]); c.style.setProperty('--lane-text', LT[i]);
    return c;
  }

  // ───────────── 1. 이름 넣기 ─────────────
  function buildSetup() {
    var box = $('names');
    box.textContent = '';
    for (var i = 0; i < MAXN; i++) (function (i) {
      var row = el('label', 'name-row');
      row.appendChild(chip(i));
      var inp = el('input');
      inp.type = 'text'; inp.maxLength = 10; inp.autocomplete = 'off'; inp.spellcheck = false;
      inp.placeholder = (i + 1) + '번 레인 이름'; inp.value = G.names[i] || '';
      inp.setAttribute('aria-label', (i + 1) + '번 레인 이름');
      inp.setAttribute('enterkeyhint', 'next');
      inp.addEventListener('input', function () { G.names[i] = inp.value; saveState(); });
      inp.addEventListener('keydown', function (ev) {
        if (ev.key !== 'Enter' || ev.isComposing) return;
        ev.preventDefault();
        var all = box.querySelectorAll('input'), nx = all[i + 1];
        if (nx && i + 1 < G.n) nx.focus(); else $('btn-draw').focus();
      });
      // 이름 여러 개를 한꺼번에 붙여 넣기 (줄바꿈 · 쉼표 · 탭으로 구분)
      inp.addEventListener('paste', function (ev) {
        var txt = (ev.clipboardData || window.clipboardData).getData('text') || '';
        var parts = txt.split(/[\n\r,\t;]+/).map(function (x) { return x.trim(); }).filter(function (x) { return x; });
        if (parts.length < 2) return;
        ev.preventDefault();
        for (var k = 0; k < parts.length && i + k < MAXN; k++) G.names[i + k] = parts[k].slice(0, 10);
        G.n = Math.max(G.n, Math.min(MAXN, i + parts.length));
        syncInputs(); applyCount(); saveState(); Sfx.play('item');
      });
      row.appendChild(inp);
      box.appendChild(row);
    })(i);
    $('sel-pace').value = String(G.pace);
    var rng = $('rng-count');
    rng.max = String(MAXN);
    rng.addEventListener('input', function () { setCount(parseInt(rng.value, 10)); });
    $('btn-minus').addEventListener('click', function () { setCount(G.n - 1); Sfx.play('click'); });
    $('btn-plus').addEventListener('click', function () { setCount(G.n + 1); Sfx.play('click'); });
    applyCount();
  }
  function setCount(v) {
    if (!(v >= 2)) v = 2;
    if (v > MAXN) v = MAXN;
    G.n = v; applyCount(); saveState();
  }
  function applyCount() {
    var rows = $('names').children;
    for (var i = 0; i < rows.length; i++) rows[i].hidden = i >= G.n;
    $('count-num').textContent = String(G.n);
    $('rng-count').value = String(G.n);
    $('btn-minus').disabled = G.n <= 2;
    $('btn-plus').disabled = G.n >= MAXN;
  }
  function syncInputs() {
    var inputs = $('names').querySelectorAll('input');
    for (var i = 0; i < inputs.length; i++) inputs[i].value = G.names[i] || '';
  }

  // 첫 화면 위쪽 그림 : 동물들이 달려가는 장면
  function drawHero(t) {
    var cv = $('hero'), rect = cv.getBoundingClientRect();
    var W = Math.round(rect.width), H = Math.round(rect.height), d = Math.min(2, window.devicePixelRatio || 1);
    if (!W || !H) return;
    if (cv.width !== Math.round(W * d) || cv.height !== Math.round(H * d)) { cv.width = Math.round(W * d); cv.height = Math.round(H * d); }
    var c = cv.getContext('2d');
    c.setTransform(d, 0, 0, d, 0, 0);
    if (!heroPick) { heroPick = S.ANIMALS.map(function (a) { return a.id; }).sort(function () { return Math.random() - 0.5; }).slice(0, 7); }
    var g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#5fb9ff'); g.addColorStop(1, '#d6f0ff');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    var i, x;
    for (i = 0; i < 5; i++) { x = ((i * 290 + 80 - t * 12) % (W + 300) + (W + 300)) % (W + 300) - 150; Art.drawCloud(c, x, 22 + (i % 3) * 16, 0.8 + (i % 2) * 0.4, '#fff', 0); }
    var ty = H * 0.62;
    c.beginPath(); c.moveTo(0, ty);
    for (x = 0; x <= W + 20; x += 20) c.lineTo(x, ty - 16 - Math.sin((x + t * 20) * 0.008) * 14 - Math.sin((x + t * 20) * 0.021) * 6);
    c.lineTo(W, ty); c.closePath(); c.fillStyle = '#8fdc80'; c.fill();
    for (i = 0; i < 9; i++) { x = ((i * 190 + 40 - t * 60) % (W + 200) + (W + 200)) % (W + 200) - 100; Art.drawTree(c, x, ty + 2, 0.62 + (i % 3) * 0.12, i % 2 ? '#5cc26b' : '#6fcf7a'); }
    c.fillStyle = '#e9764c'; c.fillRect(0, ty, W, H - ty);
    c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(0, ty - 1, W, 3); c.fillRect(0, ty + (H - ty) * 0.5, W, 2.5);
    c.fillStyle = 'rgba(255,255,255,.5)';
    for (i = 0; i < 30; i++) { x = ((i * 90 - t * 240) % (W + 90) + (W + 90)) % (W + 90) - 45; c.fillRect(x, ty + 2, 3, 7); }
    var sc = Math.max(0.5, H / 190), cnt = Math.min(heroPick.length, Math.max(3, Math.floor(W / (150 * sc))));
    for (i = 0; i < cnt; i++) {
      var lane = i % 2, span = W + 240;
      var px = ((i * span / cnt + t * (26 + (i * 7) % 15) + Math.sin(t * 0.7 + i * 2) * 30) % span + span) % span - 120;
      var py = ty + (H - ty) * (lane ? 0.9 : 0.42);
      var s = sc * (lane ? 1.0 : 0.82);
      c.beginPath(); c.ellipse(px, py + 2, 30 * s, 6 * s, 0, 0, 6.3); c.fillStyle = 'rgba(60,30,20,.2)'; c.fill();
      Art.drawAnimal(c, heroPick[i], { x: px, y: py, s: s, t: t + i, phase: t * 11 + i * 1.3, pose: 'run', num: i + 1, color: LC[i % 8], boost: i % 3 === 0 });
    }
  }

  // ───────────── 2. 출전 동물 ─────────────
  function drawLots() {
    var names = [];
    for (var i = 0; i < G.n; i++) names.push((G.names[i] || '').trim().slice(0, 10));
    G.race = S.createRace({ names: names });
    buildLineup();
    show('lineup');
    Sfx.unlock(); Sfx.play('item');
  }
  function buildLineup() {
    var race = G.race, box = $('cards');
    box.textContent = ''; cardCtx = [];
    box.classList.toggle('many', race.racers.length > 8);
    race.racers.forEach(function (r, i) {
      var card = el('div', 'acard');
      card.style.setProperty('--lane', LC[i]); card.style.setProperty('--lane-text', LT[i]);
      var top = el('div', 'acard-top');
      top.appendChild(el('span', 'chip', String(r.lane)));
      top.appendChild(el('strong', 'aname', r.name));
      card.appendChild(top);
      var cv = el('canvas'); cv.setAttribute('aria-hidden', 'true');
      card.appendChild(cv);
      card.appendChild(el('div', 'akind', r.a.name));
      var sk = el('div', 'askill');
      sk.appendChild(el('b', null, r.a.skill.name));
      sk.appendChild(el('span', null, r.a.skill.desc));
      card.appendChild(sk);
      card.appendChild(el('div', 'apassive', r.a.passive));
      box.appendChild(card);
      cardCtx.push({ cv: cv, id: r.a.id, i: i, lane: r.lane });
    });
    $('wx-name').textContent = '날씨 · ' + race.weather.name;
    $('wx-desc').textContent = race.weather.desc + (race.wxChangeAt !== null ? ' 중간에 바뀔지도 몰라요.' : '');
  }
  function drawCards(t) {
    var d = Math.min(2, window.devicePixelRatio || 1);
    for (var k = 0; k < cardCtx.length; k++) {
      var cc = cardCtx[k], rect = cc.cv.getBoundingClientRect();
      var W = Math.round(rect.width), H = Math.round(rect.height);
      if (!W) continue;
      if (cc.cv.width !== Math.round(W * d)) { cc.cv.width = Math.round(W * d); cc.cv.height = Math.round(H * d); }
      var c = cc.cv.getContext('2d');
      c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, W, H);
      var s = W / 132 * 1.0;
      c.beginPath(); c.ellipse(W / 2, H - 9, 34 * s, 7 * s, 0, 0, 6.3); c.fillStyle = 'rgba(74,50,38,.13)'; c.fill();
      var wave = ((t + k * 0.9) % 5) < 0.9;
      var fit = Math.min(s * 1.02, (H - 16) / Art.heightOf(cc.id));   // 키 큰 동물도 칸 안에 들어오게
      Art.drawAnimal(c, cc.id, { x: W / 2 - 4 * fit, y: H - 10, s: fit, t: t + k * 0.5, phase: 0, pose: wave ? 'cheer' : 'idle', num: cc.lane, color: LC[cc.i] });
    }
    var wc = $('wx-icon'), wctx = wc.getContext('2d');
    wctx.setTransform(1, 0, 0, 1, 0, 0); wctx.clearRect(0, 0, 96, 96);
    Art.drawWeatherIcon(wctx, G.race.weather.id, 48, 48, 84, t);
  }

  // ───────────── 3. 경주 ─────────────
  function startRace() {
    Sfx.unlock();
    show('race');
    G.resultShown = false; G.speedMul = 1; acc = 0; doneAt = 0;
    $('btn-speed').textContent = '빠르기 ×1';
    $('btn-skip').hidden = false; $('btn-speed').hidden = false;
    Render.init($('cv'), G.race);
    buildRank();
    $('log').textContent = '';
    addLog('weather', -1, '오늘 날씨는 ' + G.race.weather.name + '. ' + G.race.weather.desc);
  }

  function handle(ev, quiet) {
    if (!quiet) Render.handle(ev);
    for (var j = 0; j < ev.length; j++) {
      var e = ev[j];
      if (e.k === 'log') { if (!quiet || e.cls === 'finish') addLog(e.cls, e.r, e.msg); }
      else if (e.k === 'sfx' && !quiet) Sfx.play(e.id);
    }
  }

  function raceFrame(dt) {
    var race = G.race, mode = Render.mode(), simDt = 0;
    if (mode === 'countdown') {
      var c = Render.tickCountdown(dt);
      if (c === 'beep') Sfx.play('beep');
      else if (c === 'go') { Sfx.play('go'); Sfx.startBgm(G.pace * G.speedMul > 1.5 ? 1.12 : 1); }
    } else if (mode === 'run') {
      // 선두가 결승선 바로 앞이면 잠깐 느린 화면
      var slow = (race.finished === 0 && race.leadX > 491) ? 0.42 : 1;
      acc += dt * G.pace * G.speedMul * slow;
      var steps = 0;
      while (acc >= STEP && steps < 20 && !race.over) {
        race.step(STEP); acc -= STEP; steps++; simDt += STEP;
        if (race.ev.length) handle(race.drain(), false);
      }
      if (steps >= 20) acc = 0;
      if (race.over) { Render.setMode('done'); doneAt = 0; Sfx.stopBgm(); }
    } else if (mode === 'done') {
      doneAt += dt;
      if (doneAt > 1.4 && !G.resultShown) showResult();
    }
    Render.frame(dt, simDt);
    rankT -= dt;
    if (rankT <= 0) { rankT = 0.12; updateRank(); }
  }

  function skipToEnd() {
    var race = G.race, guard = 0;
    if (!race || G.resultShown) return;
    if (Render.mode() === 'countdown') Render.setMode('run');
    while (!race.over && guard++ < 60 * 300) { race.step(STEP); if (race.ev.length) handle(race.drain(), true); }
    Render.setMode('done'); doneAt = 1.0; Sfx.stopBgm();
    updateRank();
  }

  // 실시간 순위
  function buildRank() {
    var ol = $('rank');
    ol.textContent = ''; rankRows = [];
    G.race.racers.forEach(function (r, i) {
      var li = el('li', 'rrow');
      li.tabIndex = 0; li.setAttribute('role', 'button');
      var pos = el('span', 'rpos', String(i + 1));
      var img = el('img'); img.src = iconURL('face', r.a.id, 28); img.alt = '';
      var nm = el('span', 'rname', r.name);
      if (r.named) nm.appendChild(el('small', null, r.a.name));
      var stat = el('span', 'rstat', '0m');
      li.appendChild(pos); li.appendChild(chip(i, true)); li.appendChild(img); li.appendChild(nm); li.appendChild(stat);
      function toggle() {
        Render.setFollow(Render.getFollow() === i ? -1 : i);
        updateRank(); Sfx.play('click');
      }
      li.addEventListener('click', toggle);
      li.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(); } });
      ol.appendChild(li);
      rankRows.push({ li: li, pos: pos, stat: stat, lastPos: -1, lastStat: '' });
    });
    updateRank();
  }
  function updateRank() {
    var race = G.race, ol = $('rank');
    if (!race || !rankRows.length) return;
    var cnt = race.racers.length;
    var rowH = cnt <= 8 ? 34 : (cnt <= 12 ? 30 : (cnt <= 16 ? 26 : 23));
    if (window.innerWidth <= 980 && cnt <= 8) rowH = 30;
    ol.style.setProperty('--row', rowH + 'px');
    ol.classList.toggle('dense', cnt > 12);
    ol.style.height = (cnt * rowH) + 'px';
    var f = Render.getFollow();
    race.order.forEach(function (r, idx) {
      var row = rankRows[r.i];
      if (row.lastPos !== idx) { row.li.style.transform = 'translateY(' + (idx * rowH) + 'px)'; row.pos.textContent = String(idx + 1); row.lastPos = idx; }
      var st = r.finished ? r.finT.toFixed(2) + '초' : Math.floor(Math.max(0, r.x)) + 'm';
      if (st !== row.lastStat) { row.stat.textContent = st; row.lastStat = st; }
      row.li.classList.toggle('fin', r.finished && r.place !== 1);
      row.li.classList.toggle('first', r.finished && r.place === 1);
      row.li.classList.toggle('follow', f === r.i);
    });
  }

  function addLog(cls, ri, msg) {
    var ul = $('log'), li = el('li', cls);
    if (ri >= 0) li.appendChild(chip(ri, true));
    li.appendChild(el('span', null, msg));
    ul.insertBefore(li, ul.firstChild);
    while (ul.children.length > 60) ul.removeChild(ul.lastChild);
  }

  // ───────────── 결과 ─────────────
  function showResult() {
    G.resultShown = true;
    var race = G.race, rs = race.racers.slice().sort(function (a, b) { return a.place - b.place; });
    var n = rs.length, win = rs[0];
    $('res-title').textContent = '우승은 ' + win.name + (win.named ? ' (' + win.a.name + ')' : '') + '!';
    var list = $('res-list');
    list.textContent = '';
    rs.forEach(function (r, k) {
      var li = el('li', k < 3 ? 'p' + (k + 1) : (k === n - 1 && n > 3 ? 'last' : ''));
      li.appendChild(el('span', 'rpos', (k + 1) + '등'));
      li.appendChild(chip(r.i, true));
      var img = el('img'); img.src = iconURL('face', r.a.id, 28); img.alt = '';
      li.appendChild(img);
      var nm = el('span', 'rname', r.name);
      if (r.named) nm.appendChild(el('small', null, r.a.name));
      li.appendChild(nm);
      li.appendChild(el('span', 'rstat', r.finT.toFixed(2) + '초'));
      list.appendChild(li);
    });
    // 재미로 보는 상
    var aw = $('awards');
    aw.textContent = '';
    function best(key, min) {
      var b = null;
      race.racers.forEach(function (r) { if (r.stats[key] >= min && (!b || r.stats[key] > b.stats[key])) b = r; });
      return b;
    }
    function award(title, r, text) {
      if (!r) return;
      var a = el('span', 'award');
      a.appendChild(el('b', null, title));
      a.appendChild(document.createTextNode(r.name + ' ' + text));
      aw.appendChild(a);
    }
    var b;
    b = best('gave', 2); award('방해왕', b, b ? '(' + b.stats.gave + '번 방해)' : '');
    b = best('took', 3); award('불운상', b, b ? '(' + b.stats.took + '번 당함)' : '');
    b = best('helps', 1); award('의리상', b, b ? '(' + b.stats.helps + '번 도움)' : '');
    b = best('blocked', 2); award('철벽상', b, b ? '(' + b.stats.blocked + '번 막음)' : '');
    b = best('leadTime', 8); award('선두 지킴이', b, b ? '(' + Math.round(b.stats.leadTime) + '초 동안 1등)' : '');
    b = best('top', 1); award('최고 속력', b, b ? '(시속 ' + Math.round(b.stats.top * 3.6) + 'km)' : '');
    podium = { t: 0, rs: rs.slice(0, Math.min(3, n)), conf: [] };
    $('result').hidden = false;
    $('btn-skip').hidden = true; $('btn-speed').hidden = true;
    Sfx.play('cheer');
    $('btn-again').focus();
  }

  function drawPodium(dt) {
    if (!podium) return;
    podium.t += dt;
    var cv = $('podium'), rect = cv.getBoundingClientRect();
    var W = Math.round(rect.width), H = Math.round(rect.height), d = Math.min(2, window.devicePixelRatio || 1);
    if (!W || !H) return;
    if (cv.width !== Math.round(W * d) || cv.height !== Math.round(H * d)) { cv.width = Math.round(W * d); cv.height = Math.round(H * d); }
    var c = cv.getContext('2d');
    c.setTransform(d, 0, 0, d, 0, 0);
    var g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#6fc2ff'); g.addColorStop(1, '#dff3ff');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // 햇살
    c.save(); c.translate(W / 2, H * 0.72); c.rotate(podium.t * 0.15);
    for (var q = 0; q < 12; q++) { c.rotate(Math.PI / 6); c.beginPath(); c.moveTo(0, 0); c.lineTo(-40, -W); c.lineTo(40, -W); c.closePath(); c.fillStyle = 'rgba(255,255,255,.16)'; c.fill(); }
    c.restore();
    c.fillStyle = '#7fd46c'; c.fillRect(0, H - 22, W, 22);
    c.fillStyle = '#63bd55'; c.fillRect(0, H - 22, W, 3);
    var pw = Math.min(150, W / 3.4), base = H - 16, t = podium.t;
    var slots = [{ k: 0, x: W / 2, h: H * 0.34, col: '#ffd23f' }, { k: 1, x: W / 2 - pw - 6, h: H * 0.24, col: '#cfd8e3' }, { k: 2, x: W / 2 + pw + 6, h: H * 0.17, col: '#e0a25a' }];
    var sc = Math.min(1.05, H / 230);
    slots.forEach(function (sl) {
      var r = podium.rs[sl.k];
      if (!r) return;
      Art.drawPodium(c, sl.x, base, pw, sl.h, sl.k + 1, sl.col);
      var ps = Math.min(sc * (sl.k === 0 ? 0.98 : 0.84), (base - sl.h - 30) / Art.heightOf(r.a.id));
      var a = Art.drawAnimal(c, r.a.id, { x: sl.x - 4, y: base - sl.h, s: ps, t: t + sl.k * 0.3, phase: 0, pose: sl.k === 0 ? 'cheer' : (((t + sl.k) % 3) < 1.2 ? 'cheer' : 'idle'), num: r.lane, color: LC[r.i] });
      // 이름표
      c.font = '15px ' + FONT;
      var tw = c.measureText(r.name).width + 20, tx = sl.x - tw / 2, ty = Math.max(4, a.top - 28);
      Art.roundRect(c, tx, ty, tw, 22, 11); c.fillStyle = LC[r.i]; c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
      c.fillStyle = LT[r.i]; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(r.name, sl.x, ty + 12);
      if (sl.k === 0) Art.drawStar(c, sl.x + tw / 2 + 12, ty + 10, 11, Math.sin(t * 3) * 0.3, '#ffd23f', 2);
    });
    // 색종이
    if (podium.conf.length < 70 && Math.random() < 0.9) podium.conf.push({ x: Math.random() * W, y: -8, vx: (Math.random() - 0.5) * 40, vy: 50 + Math.random() * 80, r: Math.random() * 6, vr: (Math.random() - 0.5) * 8, col: LC[Math.floor(Math.random() * 8)], s: 5 + Math.random() * 4 });
    for (var j = podium.conf.length - 1; j >= 0; j--) {
      var p = podium.conf[j];
      p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      if (p.y > H + 10) { podium.conf.splice(j, 1); continue; }
      c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.col; c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore();
    }
  }

  function closeResult() { $('result').hidden = true; podium = null; }

  function resultText() {
    var race = G.race, rs = race.racers.slice().sort(function (a, b) { return a.place - b.place; });
    var lines = ['동물 달리기 500m 결과 (날씨: ' + race.weather.name + ')'];
    rs.forEach(function (r, k) { lines.push((k + 1) + '등 ' + r.name + (r.named ? ' (' + r.a.name + ')' : '') + ' ' + r.finT.toFixed(2) + '초'); });
    return lines.join('\n');
  }
  function copyResult() {
    var txt = resultText(), btn = $('btn-copy');
    function ok() { btn.textContent = '복사했어요'; setTimeout(function () { btn.textContent = '결과 복사'; }, 1600); }
    function fallback() {
      var ta = el('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) { btn.textContent = '복사 실패'; }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, fallback);
    else fallback();
  }

  // ───────────── 도감 ─────────────
  var guideBuilt = false;
  function buildGuide() {
    if (guideBuilt) return;
    guideBuilt = true;
    function item(box, url, title, tag, desc, small) {
      var d = el('div', 'g-item'), img = el('img'); img.src = url; img.alt = '';
      d.appendChild(img);
      var tx = el('div');
      tx.appendChild(el('b', null, title));
      if (tag) tx.appendChild(el('em', null, tag));
      tx.appendChild(el('span', null, ' ' + desc));
      if (small) tx.appendChild(el('small', null, small));
      d.appendChild(tx); box.appendChild(d);
    }
    $('g-animals-title').textContent = '동물 ' + S.ANIMALS.length + '종과 스킬';
    var a = $('g-animals');
    S.ANIMALS.forEach(function (an) { item(a, iconURL('face', an.id, 46), an.name, an.skill.name, an.skill.desc, an.passive); });
    var it = $('g-items');
    Object.keys(S.ITEMS).forEach(function (id) { item(it, iconURL('item', id, 34), S.ITEMS[id].name, null, S.ITEMS[id].desc); });
    var w = $('g-weather');
    Object.keys(S.WEATHERS).forEach(function (id) { item(w, iconURL('wx', id, 34), S.WEATHERS[id].name, null, S.WEATHERS[id].desc); });
    var ev = $('g-events');
    [['bees', '벌떼 출현', '쫓기는 동물은 깜짝 놀라 빨라지고, 쏘이면 잠깐 멈춰요.'], ['moles', '두더지 출현', '레인에 불쑥 나타나요. 걸리면 꽈당!'],
     ['snack', '하늘에서 간식', '받아 먹은 동물은 힘이 나요.'], ['crowd', '관중석의 응원', '뒤처진 동물들이 힘을 내 추격해요.'],
     ['ufo', 'UFO 출현', '1등을 잠깐 들어 올렸다 내려놓아요.'], ['hurdles', '허들 구간', '날렵한 동물은 폴짝, 아니면 걸려 넘어져요.'],
     ['slick', '미끌미끌 구간', '미끄러져 빙그르르. 펭귄만 신나요.'], ['star', '별똥별', '별을 잡은 동물은 잠깐 무적 질주.'],
     ['lace', '신발 끈', '앞서 달리던 동물이 끈을 밟고 넘어져요.']].forEach(function (e) { item(ev, iconURL('ev', e[0], 34), e[1], null, e[2]); });
  }

  // ───────────── 버튼 연결 ─────────────
  function wire() {
    $('btn-draw').addEventListener('click', drawLots);
    $('btn-redraw').addEventListener('click', drawLots);
    $('btn-back').addEventListener('click', function () { show('setup'); Sfx.play('click'); });
    $('btn-go').addEventListener('click', startRace);
    $('btn-shuffle').addEventListener('click', function () {
      var arr = G.names.slice(0, G.n);
      for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
      for (i = 0; i < arr.length; i++) G.names[i] = arr[i];
      syncInputs(); saveState(); Sfx.play('swap');
    });
    $('btn-clear').addEventListener('click', function () {
      for (var i = 0; i < MAXN; i++) G.names[i] = '';
      syncInputs(); saveState(); Sfx.play('click');
      var first = $('names').querySelector('input'); if (first) first.focus();
    });
    $('sel-pace').addEventListener('change', function () { G.pace = parseFloat(this.value) || 1; saveState(); });
    $('btn-sound').addEventListener('click', function () {
      G.sound = !G.sound; Sfx.setOn(G.sound); applySound(); saveState();
      if (G.sound) { Sfx.unlock(); Sfx.play('click'); if (G.screen === 'race' && Render.mode() === 'run') Sfx.startBgm(1); }
    });
    $('btn-speed').addEventListener('click', function () {
      G.speedMul = G.speedMul === 1 ? 2 : (G.speedMul === 2 ? 3 : 1);
      this.textContent = '빠르기 ×' + G.speedMul;
      Sfx.setBgmRate(G.speedMul > 1 ? 1.15 : 1); Sfx.play('click');
    });
    $('btn-skip').addEventListener('click', skipToEnd);
    $('btn-again').addEventListener('click', function () { closeResult(); drawLots(); });
    $('btn-names').addEventListener('click', function () { closeResult(); show('setup'); });
    $('btn-copy').addEventListener('click', copyResult);
    $('btn-guide').addEventListener('click', function () { buildGuide(); $('guide').hidden = false; $('btn-guide-close').focus(); Sfx.play('click'); });
    $('btn-guide-close').addEventListener('click', function () { $('guide').hidden = true; });
    $('guide').addEventListener('click', function (ev) { if (ev.target === this) this.hidden = true; });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') $('guide').hidden = true; });
    window.addEventListener('resize', function () { if (G.screen === 'race') { Render.resize(); updateRank(); } });
    document.addEventListener('visibilitychange', function () { if (document.hidden) Sfx.stopBgm(); else if (G.screen === 'race' && Render.mode() === 'run') Sfx.startBgm(1); });
  }
  function applySound() {
    var b = $('btn-sound');
    b.textContent = G.sound ? '소리 켬' : '소리 끔';
    b.setAttribute('aria-pressed', G.sound ? 'true' : 'false');
  }

  // ───────────── 돌리기 ─────────────
  function tick(ts) {
    var dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
    lastTs = ts;
    var t = ts / 1000;
    try {
      if (G.screen === 'setup') drawHero(t);
      else if (G.screen === 'lineup') drawCards(t);
      else if (G.screen === 'race') { raceFrame(dt); if (!$('result').hidden) drawPodium(dt); }
    } catch (e) {
      if (!tick.err) { tick.err = true; console.error(e); }
    }
    requestAnimationFrame(tick);
  }

  loadState();
  Sfx.setOn(G.sound);
  buildSetup();
  applySound();
  wire();
  requestAnimationFrame(tick);

  // 시험용 손잡이
  window.__race = { G: G, skip: skipToEnd };
})();
