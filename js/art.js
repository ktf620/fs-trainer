/* 동물 달리기 500m — 그림 (동물 캐릭터)
   전부 캔버스에 직접 그린다. 그림 파일 없음. 캐릭터는 이 게임용으로 새로 디자인한 것. */
(function (root) {
  'use strict';

  var TAU = Math.PI * 2, PI = Math.PI;
  var OL = '#4a3226';       // 외곽선 색
  var LW = 2.6;             // 외곽선 굵기 (캐릭터 단위)

  var Art = {};
  Art.OL = OL;
  // 레인 색 22개 (참가 22명까지) — 9번부터는 앞의 8색과 겹치지 않는 색
  Art.LANE_COLORS = ['#ff5a5f', '#ff9f1c', '#f6c915', '#3ecf8e', '#19b8c9', '#4d8df0', '#9b5de5', '#f062b0',
    '#a0522d', '#8fd14f', '#0f7c6c', '#1f4fa8', '#c2185b', '#7a8a99', '#ffb3a7', '#6a3fb5', '#2e8b3d', '#d4a017', '#5ec8ff', '#e07a5f', '#b388eb', '#3b3442'];
  Art.LANE_TEXT = ['#fff', '#fff', '#4a3226', '#fff', '#fff', '#fff', '#fff', '#fff',
    '#fff', '#4a3226', '#fff', '#fff', '#fff', '#fff', '#4a3226', '#fff', '#fff', '#fff', '#4a3226', '#fff', '#fff', '#fff'];
  Art.MAX_LANES = 22;

  // ───────────── 그리기 도구 ─────────────
  function ell(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, TAU); }
  function paint(c, fill, lw, stroke) {
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (lw !== 0) { c.lineWidth = lw || LW; c.strokeStyle = stroke || OL; c.lineJoin = 'round'; c.stroke(); }
  }
  // 외곽선이 있는 굵은 선 (팔다리)
  function limb(c, pts, w, col) {
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(pts[0], pts[1]);
    for (var i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.lineWidth = w + LW * 2; c.strokeStyle = OL; c.stroke();
    c.lineWidth = w; c.strokeStyle = col; c.stroke();
  }
  function curve(c, x0, y0, cx, cy, x1, y1, w, col) {
    c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(cx, cy, x1, y1);
    c.lineWidth = w + LW * 2; c.strokeStyle = OL; c.stroke();
    c.lineWidth = w; c.strokeStyle = col; c.stroke();
  }
  function shade(hex, k) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    if (k < 0) { r = Math.round(r * (1 + k)); g = Math.round(g * (1 + k)); b = Math.round(b * (1 + k)); }
    else { r = Math.round(r + (255 - r) * k); g = Math.round(g + (255 - g) * k); b = Math.round(b + (255 - b) * k); }
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  Art.shade = shade;
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  // ───────────── 동물별 생김새 ─────────────
  // fur 몸 색 · fur2 주둥이/배 색 · inner 귀 안쪽 · size 전체 크기 · leg 다리 길이 · brx/bry 몸통 · hr 머리 크기 배율
  var SPEC = {
    rabbit:   { fur: '#fff4e3', fur2: '#ffffff', inner: '#ffb3c4', nose: '#ff7f9d', ear: 'long', tail: 'puff', snout: { x: 14, y: 9, rx: 11, ry: 8, out: false }, size: 0.95, teeth: true },
    turtle:   { fur: '#8fd46b', fur2: '#d6f2a8', inner: '#8fd46b', nose: null, ear: 'none', tail: 'tiny', snout: null, size: 0.92, leg: 7, hr: 0.9, shell: '#c48a4a', shell2: '#93602c' },
    cheetah:  { fur: '#ffcc55', fur2: '#fff4d6', inner: '#f2a35e', nose: '#3b2a20', ear: 'round-s', tail: 'long', tailTip: '#4a3226', snout: { x: 15, y: 9, rx: 11, ry: 8, out: true }, size: 1.04, spots: '#7a4a22', leg: 11 },
    fox:      { fur: '#ff8b3d', fur2: '#fff6ea', inner: '#ffd9b8', nose: '#3b2a20', ear: 'point', earTip: '#5a3524', tail: 'bushy', tailTip: '#fff6ea', snout: { x: 17, y: 9, rx: 12, ry: 7.2, out: true }, size: 1.0, sock: '#5a3524', cheek: true },
    bear:     { fur: '#b07a45', fur2: '#f0d2a6', inner: '#8a5a30', nose: '#3b2a20', ear: 'round', tail: 'stub', snout: { x: 15, y: 9, rx: 11, ry: 8.6, out: true }, size: 1.13, brx: 17, bry: 18.5, lw: 8.6 },
    penguin:  { dark: true, fur: '#3c4963', fur2: '#ffffff', inner: '#3c4963', nose: null, ear: 'none', tail: 'wedge', snout: null, size: 0.9, leg: 6, brx: 16.5, bry: 18, beak: '#ffa92e', feet: '#ffa92e', belly: '#ffffff', penguinFace: true, wing: true },
    elephant: { fur: '#a9bcd3', fur2: '#c7d6e6', inner: '#f5b9c9', nose: null, ear: 'fan', tail: 'tuft', snout: null, size: 1.18, brx: 18, bry: 19, lw: 9.4, trunk: true },
    kangaroo: { fur: '#d99a5b', fur2: '#f8dfc0', inner: '#f2b6a0', nose: '#3b2a20', ear: 'tall', tail: 'thick', snout: { x: 17, y: 8, rx: 12.5, ry: 8, out: true }, size: 1.08, leg: 11.5, bigFeet: true, belly: '#f8dfc0' },
    skunk:    { dark: true, sclera: true, fur: '#3b3442', fur2: '#ffffff', inner: '#ff9eb5', nose: '#ff7f9d', ear: 'round-s', tail: 'skunk', snout: { x: 15, y: 9, rx: 10.5, ry: 7.5, out: true }, size: 0.93, stripe: true },
    pig:      { fur: '#ffb6c4', fur2: '#ff8fab', inner: '#ff8fab', nose: null, ear: 'pig', tail: 'curl', snout: { x: 20, y: 8, rx: 8, ry: 8.6, out: true, disc: true }, size: 1.0, brx: 17.5, bry: 18 },
    dog:      { fur: '#f2a64b', fur2: '#fff7e8', inner: '#ffd9b8', nose: '#3b2a20', ear: 'point-s', tail: 'curlup', snout: { x: 16, y: 9, rx: 11.5, ry: 7.6, out: true }, size: 0.97, cheek: true, brow: '#fff7e8', tongue: true },
    cat:      { fur: '#9ca6b9', fur2: '#f1f4f9', inner: '#ffb3c4', nose: '#ff7f9d', ear: 'point', tail: 'catup', snout: { x: 13, y: 9, rx: 10, ry: 7, out: false }, size: 0.95, stripes: '#6c7689', whisker: true },
    panda:    { fur: '#ffffff', fur2: '#ffffff', inner: '#3b3442', nose: '#3b3442', ear: 'round', earCol: '#3b3442', tail: 'stub', snout: { x: 14, y: 9, rx: 10.5, ry: 8, out: false }, size: 1.08, brx: 17.5, bry: 18.5, lw: 8.6, limbCol: '#3b3442', patch: true },
    duck:     { fur: '#ffe35a', fur2: '#ffe35a', inner: '#ffe35a', nose: null, ear: 'none', tail: 'duck', snout: null, size: 0.86, leg: 6, beak: '#ff9a2e', feet: '#ff9a2e', tuft: true, wing: true }
    ,
    // ── 새로 들어온 36종 ──
    lion:     { fur: '#f6b84a', fur2: '#fff1cf', inner: '#e89a5a', nose: '#5a3524', ear: 'round-s', tail: 'lion', tailTip: '#8a4f22', snout: { x: 15, y: 9, rx: 11.5, ry: 8.6, out: true }, size: 1.08, mane: '#b5651d', brx: 16.5, bry: 18 },
    tiger:    { fur: '#ff9a3c', fur2: '#fff6ea', inner: '#ffd9b8', nose: '#ff7f9d', ear: 'round-s', tail: 'ring', ring: '#2b2018', ringThin: true, snout: { x: 15, y: 9, rx: 11, ry: 8.2, out: true }, size: 1.06, tstripes: '#2b2018', lowerWhite: true, brow: '#fff6ea' },
    zebra:    { fur: '#ffffff', fur2: '#5b5b68', inner: '#ffb3c4', nose: '#2b2018', ear: 'leaf', tail: 'tuft', snout: { x: 18, y: 9, rx: 13, ry: 9, out: true }, size: 1.03, zstripes: '#2b2018', maneTop: '#2b2018', leg: 11, bodyStripes: '#2b2018' },
    giraffe:  { fur: '#ffd45e', fur2: '#fff0c4', inner: '#f2a35e', nose: '#5a3524', ear: 'leaf', tail: 'lion', tailTip: '#8a4f22', snout: { x: 18, y: 9, rx: 12.5, ry: 8.5, out: true }, size: 1.0, neck: 17, patches: '#c77b30', ossi: '#8a4f22', leg: 12, lashes: true, hr: 0.88 },
    horse:    { fur: '#b9783f', fur2: '#e9c9a2', inner: '#8a5a30', nose: '#3b2a20', ear: 'leaf', tail: 'horse', tailCol: '#5a3524', snout: { x: 18, y: 9, rx: 13, ry: 9, out: true }, size: 1.07, maneTop: '#5a3524', forelock: '#5a3524', leg: 11.5, neck: 4, blaze: true },
    cow:      { fur: '#ffffff', fur2: '#ffc2cf', inner: '#ffc2cf', nose: null, ear: 'side', tail: 'tuft', snout: { x: 17, y: 10, rx: 12.5, ry: 8.4, out: true, nostril: true }, size: 1.08, cowspots: '#3b3442', horn: 'cow', brx: 17.5, bry: 18.5, lw: 8.4 },
    sheep:    { fur: '#fff0dc', fur2: '#fff0dc', inner: '#ffc2cf', nose: '#ff7f9d', ear: 'side', tail: 'puff', snout: { x: 14, y: 9, rx: 10, ry: 7.5, out: false }, size: 0.96, wool: '#ffffff', bodyCol: '#ffffff', woolBody: true },
    goat:     { fur: '#f1ede4', fur2: '#ffffff', inner: '#ffc2cf', nose: '#ff7f9d', ear: 'side', tail: 'stub', snout: { x: 16, y: 9, rx: 11, ry: 8, out: true }, size: 0.98, horn: 'goat', beard: '#e3ddd0' },
    deer:     { fur: '#d28f52', fur2: '#fff1dc', inner: '#f2b6a0', nose: '#3b2a20', ear: 'leaf', tail: 'puff', snout: { x: 17, y: 9, rx: 11.5, ry: 7.6, out: true }, size: 1.02, horn: 'antler', dots: '#fff1dc', leg: 11.5 },
    koala:    { fur: '#a7adb8', fur2: '#e9edf2', inner: '#ffffff', nose: null, ear: 'koala', tail: 'none', snout: { x: 13, y: 10, rx: 10, ry: 7, out: false }, size: 0.98, bigNose: '#4a4050', eyeWide: 3 },
    sloth:    { fur: '#b99a78', fur2: '#f1e2c8', inner: '#b99a78', nose: '#5a3524', ear: 'none', tail: 'none', snout: null, size: 0.98, slothFace: true, sclera: true },
    monkey:   { fur: '#a8703c', fur2: '#f6d7ae', inner: '#f6d7ae', nose: null, ear: 'sideRound', tail: 'monkey', snout: null, size: 0.97, apeFace: true },
    gorilla:  { dark: true, sclera: true, fur: '#4b4f5a', fur2: '#9aa0ad', inner: '#9aa0ad', nose: null, ear: 'sideRound', tail: 'none', snout: null, size: 1.15, apeFace: true, brx: 18, bry: 19, lw: 9.2 },
    hippo:    { fur: '#b49ac0', fur2: '#d5c1de', inner: '#f2b6c8', nose: null, ear: 'round-s', tail: 'tiny', snout: { x: 16, y: 10, rx: 15.5, ry: 10.5, out: true, nostrilTop: true, teeth2: true }, size: 1.13, brx: 18.5, bry: 19, lw: 9.4 },
    rhino:    { fur: '#9aa3ad', fur2: '#b9c1c9', inner: '#f2b6c8', nose: null, ear: 'leaf', tail: 'tuft', snout: { x: 17, y: 10, rx: 13.5, ry: 9.5, out: true, nostril: true }, size: 1.13, brx: 18.5, bry: 19, lw: 9.4, horn: 'rhino' },
    croc:     { fur: '#6fbf5a', fur2: '#e8f2a6', inner: '#6fbf5a', nose: null, ear: 'none', tail: 'croc', snout: { x: 20, y: 9, rx: 18, ry: 7.6, out: true, croc: true }, size: 1.02, belly: '#e8f2a6', eyeBump: true },
    frog:     { fur: '#7ed35f', fur2: '#e2f7b0', inner: '#7ed35f', nose: null, ear: 'none', tail: 'none', snout: null, size: 0.9, leg: 8, belly: '#e2f7b0', eyesTop: true, bigFeet: true, wideMouth: true },
    squirrel: { fur: '#d9853b', fur2: '#fff1dc', inner: '#f2b6a0', nose: '#5a3524', ear: 'point-s', tail: 'squirrel', snout: { x: 14, y: 9, rx: 10.5, ry: 7.6, out: false }, size: 0.9, teeth: true },
    hamster:  { fur: '#f5b66a', fur2: '#fffaf0', inner: '#ffb3c4', nose: '#ff7f9d', ear: 'round-s', tail: 'none', snout: { x: 13, y: 10, rx: 9, ry: 6.5, out: false }, size: 0.86, leg: 7, hamFace: true, hrx: 1.08, brx: 16.5 },
    mouse:    { fur: '#b8bcc8', fur2: '#f1f4f9', inner: '#ffb3c4', nose: '#ff7f9d', ear: 'big', tail: 'thinlong', tailCol: '#ffb3c4', snout: { x: 16, y: 9, rx: 10.5, ry: 7, out: true }, size: 0.84, leg: 7.5, teeth: true },
    hedgehog: { fur: '#f6dfc0', fur2: '#fff4e3', inner: '#f2b6a0', nose: '#3b2a20', ear: 'round-s', tail: 'none', snout: { x: 17, y: 9, rx: 10.5, ry: 7, out: true }, size: 0.86, leg: 7, spikes: '#8a5a3a' },
    raccoon:  { sclera: true, fur: '#9a9aa6', fur2: '#ffffff', inner: '#3b3442', nose: '#3b2a20', ear: 'point-s', tail: 'ring', ring: '#3b3442', snout: { x: 15, y: 9, rx: 10.5, ry: 7.5, out: true }, size: 0.95, mask: '#3b3442', lowerWhite: true },
    otter:    { fur: '#8a5f45', fur2: '#f1dcc0', inner: '#6b4632', nose: '#3b2a20', ear: 'round-s', tail: 'thick', snout: { x: 14, y: 9, rx: 11, ry: 8, out: false }, size: 0.97, whisker: true, belly: '#f1dcc0', tailK: 0.66 },
    beaver:   { fur: '#9a6a42', fur2: '#e2c49a', inner: '#6b4632', nose: '#3b2a20', ear: 'round-s', tail: 'paddle', snout: { x: 14, y: 9, rx: 11, ry: 8, out: false }, size: 0.97, teethBig: true, brx: 16.5 },
    wolf:     { fur: '#8e97a6', fur2: '#f4f6f9', inner: '#d9dde4', nose: '#2b2018', ear: 'point', tail: 'bushy', tailTip: '#f4f6f9', snout: { x: 17, y: 9, rx: 12, ry: 7.4, out: true }, size: 1.05, cheek: true },
    polar:    { fur: '#f7fbff', fur2: '#ffffff', inner: '#dfe8f2', nose: '#2b2018', ear: 'round', tail: 'stub', snout: { x: 15, y: 9, rx: 11, ry: 8.6, out: true }, size: 1.13, brx: 17.5, bry: 18.8, lw: 8.8 },
    seal:     { fur: '#8fa3b8', fur2: '#e6edf4', inner: '#8fa3b8', nose: '#2b2018', ear: 'none', tail: 'flipper', snout: { x: 14, y: 9, rx: 11.5, ry: 8, out: false }, size: 0.95, leg: 6, wing: true, whisker: true, belly: '#e6edf4', feet: '#6f8399' },
    owl:      { fur: '#9b6b43', fur2: '#f3dfc0', inner: '#9b6b43', nose: null, ear: 'tuft', tail: 'wedge', snout: null, size: 0.9, leg: 6, wing: true, beak: '#ffb02e', beakType: 'owl', feet: '#ffb02e', belly: '#f3dfc0', owlDisc: '#f3dfc0', brx: 16.5, bry: 18 },
    chicken:  { fur: '#ffffff', fur2: '#ffffff', inner: '#ffffff', nose: null, ear: 'none', tail: 'feathers', feathers: ['#ffffff', '#f1f1f1', '#ffffff'], snout: null, size: 0.9, leg: 6.5, wing: true, beak: '#ffb02e', beakType: 'cone', feet: '#ffb02e', comb: '#ff4d5e' },
    parrot:   { fur: '#ff5a4d', fur2: '#ffffff', inner: '#ff5a4d', nose: null, ear: 'none', tail: 'feathers', feathers: ['#3d8bff', '#ff5a4d', '#ffd23f'], snout: null, size: 0.9, leg: 6, wing: true, wingCol: '#3ecf8e', beak: '#f3e9d6', beakType: 'hook', feet: '#8a8f9c', eyeRing: true, crest: '#ffd23f' },
    flamingo: { fur: '#ff9ec0', fur2: '#ffffff', inner: '#ff9ec0', nose: null, ear: 'none', tail: 'feathers', feathers: ['#ff7fae', '#ff9ec0', '#ffc0d6'], snout: null, size: 0.96, leg: 13, legW: 4.2, neck: 19, neckW: 6, wing: true, wingCol: '#ff7fae', beak: '#fff6ea', beakType: 'bent', feet: '#ff7fae', limbCol: '#ff8fb8', hr: 0.74, brx: 14, bry: 15 },
    ostrich:  { fur: '#f6cdb4', fur2: '#f6cdb4', inner: '#f6cdb4', nose: null, ear: 'none', tail: 'feathers', feathers: ['#ffffff', '#f1f1f1', '#ffffff'], snout: null, size: 1.02, leg: 14, legW: 5, neck: 15, neckW: 6.5, wing: true, wingCol: '#4a4352', bodyCol: '#3b3442', beak: '#e8b98a', beakType: 'flat', feet: '#f2a79a', limbCol: '#f6b8a8', hr: 0.78, tuftHair: true, lashes: true, brx: 16, bry: 16 },
    camel:    { fur: '#dcae6e', fur2: '#f2d9ae', inner: '#c89250', nose: '#5a3524', ear: 'leaf', tail: 'tuft', snout: { x: 18, y: 10, rx: 13, ry: 9, out: true }, size: 1.08, neck: 7, hump: true, leg: 11.5, hr: 0.92 },
    alpaca:   { fur: '#fff0dc', fur2: '#fffaf2', inner: '#ffc2cf', nose: '#c98a7a', ear: 'leaf', tail: 'puff', snout: { x: 15, y: 10, rx: 9.5, ry: 7, out: true }, size: 0.98, neck: 11, neckW: 13, wool: '#fff0dc', bodyCol: '#fff0dc', woolBody: true, hr: 0.88 },
    bat:      { dark: true, sclera: true, fur: '#5b4a78', fur2: '#8a78a8', inner: '#ff9eb5', nose: '#ff9eb5', ear: 'bat', tail: 'none', snout: { x: 13, y: 9, rx: 9, ry: 6.5, out: false }, size: 0.86, leg: 6.5, wing: true, batWing: true, wingCol: '#463a5e', fang: true },
    redpanda: { fur: '#d9632e', fur2: '#ffffff', inner: '#ffffff', nose: '#3b2a20', ear: 'round', earEdge: '#ffffff', tail: 'ring', ring: '#9a3f1a', snout: { x: 14, y: 9, rx: 10.5, ry: 7.6, out: false }, size: 0.96, limbCol: '#4a2a1e', rpFace: true, brow: '#ffffff' }
  };
  Art.SPEC = SPEC;

  // ───────────── 자세 ─────────────
  function legAng(p, amp) {
    var th = (amp || 0.9) * Math.sin(p);
    var bend = 0.3 + 0.95 * (0.5 + 0.5 * Math.cos(p));
    return [th, th - bend];
  }
  function armAng(p, amp) {
    var up = (amp || 0.95) * Math.sin(p);
    return [up, up + 1.15];
  }
  function makeRig(pose, ph, t, o) {
    var R = { bob: 0, lean: 0.1, rot: 0, pivotY: -40, dx: 0, dy: 0, flipX: 1,
      legN: [0.06, 0.06], legF: [-0.08, -0.08], armN: [0.2, 0.35], armF: [-0.2, -0.05],
      headTilt: 0, eyes: 'open', mouth: 'smile', ear: 0, tail: 0, sit: false, wing: 0, trunkUp: 0 };
    var boost = o.boost ? 1 : 0;
    switch (pose) {
      case 'idle':
        R.bob = Math.sin(t * 3.2) * 0.9; R.lean = 0.02;
        R.ear = Math.sin(t * 2.1) * 0.05; R.tail = Math.sin(t * 4) * 0.25;
        break;
      case 'ready':   // 출발선 준비 자세
        R.lean = 0.3; R.bob = Math.sin(t * 5) * 0.5 + 3;
        R.legN = [0.55, -0.35]; R.legF = [-0.5, -1.2];
        R.armN = [-0.7, 0.3]; R.armF = [0.8, 1.6];
        R.eyes = 'angry'; R.mouth = 'flat'; R.tail = Math.sin(t * 9) * 0.2;
        break;
      case 'cheer':
        R.bob = -Math.abs(Math.sin(t * 7)) * 9; R.lean = 0;
        R.legN = [0.25, 0.1]; R.legF = [-0.25, -0.3];
        R.armN = [-2.3 - Math.sin(t * 14) * 0.25, -2.8 - Math.sin(t * 14) * 0.3];
        R.armF = [2.2 + Math.sin(t * 14 + 1) * 0.25, 2.7 + Math.sin(t * 14 + 1) * 0.3];
        R.eyes = 'happy'; R.mouth = 'open'; R.ear = Math.sin(t * 14) * 0.15; R.tail = Math.sin(t * 16) * 0.5;
        break;
      case 'sad':
        R.bob = Math.sin(t * 2) * 0.6 + 2; R.lean = 0.16; R.headTilt = 0.18;
        R.armN = [0.1, 0.15]; R.armF = [-0.05, 0.0];
        R.eyes = 'sad'; R.mouth = 'frown'; R.ear = 0.25;
        break;
      case 'dizzy':
        R.rot = Math.sin(t * 8) * 0.1; R.lean = 0; R.pivotY = 0;
        R.armN = [0.9 + Math.sin(t * 9) * 0.3, 1.2]; R.armF = [-0.9 - Math.sin(t * 9) * 0.3, -0.6];
        R.legN = [0.2, 0.05]; R.legF = [-0.25, -0.3];
        R.eyes = 'dizzy'; R.mouth = 'wavy'; R.headTilt = Math.sin(t * 6) * 0.12;
        break;
      case 'zap':
        R.lean = 0; R.bob = Math.sin(t * 60) * 1.2;
        R.armN = [1.5, 1.7]; R.armF = [-1.5, -1.7];
        R.legN = [0.5, 0.5]; R.legF = [-0.5, -0.5];
        R.eyes = 'wide'; R.mouth = 'o'; R.ear = Math.sin(t * 50) * 0.2;
        break;
      case 'spin':
        R.flipX = Math.cos(t * 13); R.lean = 0; R.bob = -2;
        R.armN = [1.3, 1.5]; R.armF = [-1.3, -1.5];
        R.legN = [0.4, 0.2]; R.legF = [-0.4, -0.5];
        R.eyes = 'dizzy'; R.mouth = 'o';
        break;
      case 'trip':
        R.rot = 1.38; R.pivotY = -6; R.dy = -9; R.dx = -8; R.lean = 0;
        R.armN = [2.4, 2.7]; R.armF = [2.0, 2.4];
        R.legN = [-0.9 + Math.sin(t * 16) * 0.25, -1.5]; R.legF = [-0.4 - Math.sin(t * 16) * 0.25, -1.1];
        R.eyes = 'x'; R.mouth = 'o';
        break;
      case 'sleep':
        R.sit = true; R.lean = 0.12; R.headTilt = 0.32 + Math.sin(t * 1.6) * 0.05; R.bob = Math.sin(t * 1.6) * 0.8;
        R.legN = [1.45, 1.5]; R.legF = [1.25, 1.35];
        R.armN = [0.35, 0.6]; R.armF = [0.2, 0.4];
        R.eyes = 'closed'; R.mouth = 'o'; R.ear = 0.35;
        break;
      case 'eat':
        R.sit = true; R.lean = 0.02; R.bob = Math.sin(t * 16) * 0.7;
        R.legN = [1.45, 1.5]; R.legF = [1.25, 1.35];
        R.armN = [1.5, 2.6]; R.armF = [1.3, 2.4];
        R.eyes = 'happy'; R.mouth = 'chew'; R.hold = 'bamboo';
        break;
      case 'slide':
        R.rot = 1.42; R.pivotY = -6; R.dy = -10; R.dx = -16; R.lean = 0;
        R.armN = [-0.6, -0.6]; R.armF = [-0.9, -0.9];
        R.legN = [-0.35, -0.35]; R.legF = [-0.6, -0.6];
        R.eyes = 'happy'; R.mouth = 'open'; R.headTilt = -1.0;
        break;
      case 'roll':
        R.rot = t * 13; R.pivotY = -46; R.lean = 0; R.dy = 8;
        R.armN = [0.9, 2.1]; R.armF = [0.6, 1.8];
        R.legN = [1.2, 0.2]; R.legF = [1.0, 0.0];
        R.eyes = 'angry'; R.mouth = 'open';
        break;
      case 'jump':
        R.lean = 0.2; R.rot = -0.1 + 0.25 * (o.prog || 0); R.pivotY = -40;
        R.legN = [1.25, -0.4]; R.legF = [0.9, -0.7];
        R.armN = [2.3, 2.7]; R.armF = [-1.2, -0.6];
        R.eyes = 'happy'; R.mouth = 'open'; R.ear = -0.2; R.tail = -0.4;
        break;
      case 'fly':
        R.rot = 0.5; R.pivotY = -40; R.lean = 0.1; R.bob = Math.sin(t * 9) * 2;
        R.wing = Math.sin(t * 34);
        R.armN = [-1.7 + R.wing * 1.0, -1.9 + R.wing * 1.2]; R.armF = [-1.5 - R.wing * 1.0, -1.7 - R.wing * 1.2];
        R.legN = [-0.9, -1.3]; R.legF = [-1.1, -1.5];
        R.eyes = 'happy'; R.mouth = 'open'; R.headTilt = -0.35;
        break;
      case 'lift':
        R.lean = 0; R.rot = Math.sin(t * 5) * 0.12; R.pivotY = -90;
        R.armN = [0.5 + Math.sin(t * 11) * 0.3, 0.3]; R.armF = [-0.5 - Math.sin(t * 11) * 0.3, -0.3];
        R.legN = [0.25 + Math.sin(t * 9) * 0.35, 0.1]; R.legF = [-0.25 - Math.sin(t * 9) * 0.35, -0.4];
        R.eyes = 'wide'; R.mouth = 'o';
        break;
      case 'spray':   // 코끼리 물대포
        R.trunkUp = 1;
        /* falls through */
      case 'run':
      default:
        var amp = o.hop ? 1.05 : 0.9;
        R.bob = -(o.hop ? 9 : 2.6) * Math.abs(Math.sin(ph));
        R.lean = 0.13 + 0.13 * boost;
        R.legN = legAng(ph, amp); R.legF = legAng(ph + PI, amp);
        R.armN = armAng(ph + PI); R.armF = armAng(ph);
        R.ear = 0.16 * Math.sin(2 * ph - 0.9) + 0.12 * boost;
        R.tail = 0.2 * Math.sin(2 * ph);
        R.headTilt = 0.035 * Math.sin(2 * ph + 0.5);
        R.eyes = boost ? 'angry' : 'open';
        R.mouth = boost ? 'open' : 'smile';
        break;
    }
    if (o.eyes) R.eyes = o.eyes;
    if (o.mouth) R.mouth = o.mouth;
    return R;
  }

  // ───────────── 꼬리 ─────────────
  function drawTail(c, sp, R, bx, by) {
    var w = R.tail;
    c.save();
    c.translate(bx, by);
    c.rotate(w * 0.6);
    switch (sp.tail) {
      case 'puff': ell(c, -4, 0, 6.2, 6.2); paint(c, '#ffffff'); break;
      case 'stub': ell(c, -3, 0, 5, 5); paint(c, sp.earCol || sp.fur); break;
      case 'bushy':
        c.beginPath(); c.moveTo(2, 2); c.bezierCurveTo(-14, 10, -34, 0, -32, -20);
        c.bezierCurveTo(-24, -14, -10, -12, 2, -6); c.closePath(); paint(c, sp.fur);
        c.save(); c.clip();
        ell(c, -32, -17, 11, 10); c.fillStyle = sp.tailTip; c.fill();
        c.restore();
        c.beginPath(); c.moveTo(2, 2); c.bezierCurveTo(-14, 10, -34, 0, -32, -20);
        c.bezierCurveTo(-24, -14, -10, -12, 2, -6); c.closePath(); paint(c, null);
        break;
      case 'skunk':
        c.beginPath(); c.moveTo(3, 3); c.bezierCurveTo(-22, 8, -36, -18, -24, -46);
        c.bezierCurveTo(-18, -58, -4, -56, -4, -44); c.bezierCurveTo(-4, -30, -8, -14, 3, -5); c.closePath(); paint(c, sp.fur);
        c.save(); c.clip();
        c.beginPath(); c.moveTo(-4, 0); c.bezierCurveTo(-22, -4, -26, -26, -14, -52);
        c.lineWidth = 7; c.strokeStyle = '#fff'; c.lineCap = 'round'; c.stroke();
        c.restore();
        break;
      case 'long':
        curve(c, 0, 0, -20, 8, -27, -14, 4.6, sp.fur);
        c.beginPath(); c.moveTo(-26, -9); c.lineTo(-27, -14); c.lineWidth = 4.6; c.strokeStyle = sp.tailTip; c.lineCap = 'round'; c.stroke();
        break;
      case 'catup':
        curve(c, 0, 0, -18, 4, -17, -24, 4.6, sp.fur);
        break;
      case 'tuft':
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-10, 2, -11, 12); c.lineWidth = 2.2; c.strokeStyle = OL; c.lineCap = 'round'; c.stroke();
        ell(c, -11, 13, 2.4, 3.2); paint(c, shade(sp.fur, -0.3), 1.5);
        break;
      case 'curl':
        c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-8, -2, -10, -10, -5, -11); c.bezierCurveTo(-1, -12, -1, -6, -5, -6);
        c.lineCap = 'round'; c.lineWidth = 3.2 + LW * 1.6; c.strokeStyle = OL; c.stroke();
        c.lineWidth = 3.2; c.strokeStyle = sp.fur; c.stroke();
        break;
      case 'curlup':
        c.beginPath(); c.arc(-6, -7, 6.5, 0.3, TAU * 0.86);
        c.lineCap = 'round'; c.lineWidth = 6 + LW * 2; c.strokeStyle = OL; c.stroke();
        c.lineWidth = 6; c.strokeStyle = sp.fur2; c.stroke();
        break;
      case 'thick':
        if (sp.tailK) c.scale(sp.tailK, sp.tailK);
        c.beginPath(); c.moveTo(3, -7); c.quadraticCurveTo(-18, -8, -38, 14); c.quadraticCurveTo(-16, 12, 3, 6); c.closePath(); paint(c, sp.fur);
        break;
      case 'wedge':
        c.beginPath(); c.moveTo(2, -3); c.lineTo(-9, 5); c.lineTo(3, 5); c.closePath(); paint(c, sp.fur);
        break;
      case 'duck':
        c.beginPath(); c.moveTo(2, 4); c.quadraticCurveTo(-8, -2, -11, -12); c.quadraticCurveTo(-3, -8, 4, -6); c.closePath(); paint(c, sp.fur);
        break;
      case 'none': break;
      case 'lion':
        curve(c, 0, 0, -20, 8, -27, -12, 4.2, sp.fur);
        ell(c, -28, -15, 5, 6.5, 0.3); paint(c, sp.tailTip);
        break;
      case 'ring':
        if (sp.ringThin) {
          curve(c, 0, 0, -20, 8, -27, -14, 5, sp.fur);
          c.beginPath(); c.moveTo(-12, 3.5); c.lineTo(-13.5, 0); c.moveTo(-19.5, 1.5); c.lineTo(-22, -1.5); c.moveTo(-24.5, -5); c.lineTo(-28, -6.5);
          c.lineWidth = 2.6; c.strokeStyle = sp.ring; c.lineCap = 'butt'; c.stroke();
        } else {
          c.beginPath(); c.moveTo(2, 2); c.bezierCurveTo(-14, 10, -34, 0, -32, -20); c.bezierCurveTo(-24, -14, -10, -12, 2, -6); c.closePath(); paint(c, sp.fur);
          c.save(); c.clip();
          c.strokeStyle = sp.ring; c.lineWidth = 4.5; c.lineCap = 'butt';
          c.beginPath(); c.moveTo(-9, -12); c.lineTo(-7, 10); c.moveTo(-19, -14); c.lineTo(-18, 10); c.moveTo(-34, -6); c.lineTo(-22, -4); c.moveTo(-36, -17); c.lineTo(-24, -15); c.stroke();
          c.restore();
          c.beginPath(); c.moveTo(2, 2); c.bezierCurveTo(-14, 10, -34, 0, -32, -20); c.bezierCurveTo(-24, -14, -10, -12, 2, -6); c.closePath(); paint(c, null);
        }
        break;
      case 'squirrel':
        c.beginPath(); c.moveTo(3, 3); c.bezierCurveTo(-28, 10, -42, -30, -22, -54); c.bezierCurveTo(-10, -66, 8, -50, -5, -42); c.bezierCurveTo(-18, -34, -10, -16, 3, -7); c.closePath(); paint(c, sp.fur);
        c.beginPath(); c.moveTo(-6, -4); c.bezierCurveTo(-24, -6, -30, -30, -18, -46); c.lineWidth = 4; c.strokeStyle = shade(sp.fur, 0.35); c.lineCap = 'round'; c.stroke();
        break;
      case 'paddle':
        ell(c, -11, 7, 13, 6.5, -0.35); paint(c, '#6b5444');
        c.beginPath(); c.moveTo(-18, 5); c.lineTo(-8, 13); c.moveTo(-12, 1); c.lineTo(-3, 9); c.moveTo(-17, 12); c.lineTo(-6, 3);
        c.lineWidth = 1.1; c.strokeStyle = 'rgba(0,0,0,.28)'; c.stroke();
        break;
      case 'thinlong':
        c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-16, 8, -28, -4, -30, -20);
        c.lineCap = 'round'; c.lineWidth = 2.6 + LW * 1.5; c.strokeStyle = OL; c.stroke();
        c.lineWidth = 2.6; c.strokeStyle = sp.tailCol || sp.fur; c.stroke();
        break;
      case 'monkey':
        c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-18, 8, -30, -8, -24, -24); c.bezierCurveTo(-21, -32, -12, -30, -14, -23); c.bezierCurveTo(-15, -19, -20, -20, -19, -24);
        c.lineCap = 'round'; c.lineWidth = 3.6 + LW * 1.6; c.strokeStyle = OL; c.stroke();
        c.lineWidth = 3.6; c.strokeStyle = sp.fur; c.stroke();
        break;
      case 'croc':
        c.beginPath(); c.moveTo(3, -8); c.quadraticCurveTo(-18, -8, -40, 12); c.quadraticCurveTo(-16, 12, 3, 6); c.closePath(); paint(c, sp.fur);
        c.fillStyle = shade(sp.fur, -0.22); c.strokeStyle = OL; c.lineWidth = 1.4;
        [[-6, -8.5], [-14, -6.5], [-22, -2.5], [-30, 3]].forEach(function (p) { c.beginPath(); c.moveTo(p[0] - 3, p[1] + 2); c.lineTo(p[0], p[1] - 4); c.lineTo(p[0] + 3, p[1] + 1); c.closePath(); c.fill(); c.stroke(); });
        break;
      case 'horse':
        c.beginPath(); c.moveTo(3, -4); c.bezierCurveTo(-14, -8, -26, 6, -20, 28); c.bezierCurveTo(-13, 20, -5, 12, 3, 4); c.closePath(); paint(c, sp.tailCol || sp.fur);
        c.beginPath(); c.moveTo(-6, 2); c.quadraticCurveTo(-16, 8, -17, 22); c.lineWidth = 1.4; c.strokeStyle = 'rgba(255,255,255,.3)'; c.stroke();
        break;
      case 'feathers':
        var fc = sp.feathers || [sp.fur, sp.fur, sp.fur];
        [[-0.75, 1.0, fc[0]], [-0.25, 1.15, fc[1]], [0.25, 0.95, fc[2]]].forEach(function (f) {
          c.save(); c.rotate(f[0] - 0.55); c.scale(f[1], f[1]);
          c.beginPath(); c.moveTo(0, 2); c.quadraticCurveTo(-7, -8, -3, -22); c.quadraticCurveTo(5, -10, 4, 2); c.closePath(); paint(c, f[2]);
          c.restore();
        });
        break;
      case 'flipper':
        c.beginPath(); c.moveTo(3, -2); c.quadraticCurveTo(-8, -6, -16, -10); c.quadraticCurveTo(-11, -2, -17, 6); c.quadraticCurveTo(-7, 6, 3, 5); c.closePath(); paint(c, sp.feet || sp.fur);
        break;
      case 'tiny':
        c.beginPath(); c.moveTo(2, -2); c.lineTo(-7, 3); c.lineTo(2, 4); c.closePath(); paint(c, sp.fur);
        break;
    }
    c.restore();
  }

  // ───────────── 귀 ─────────────
  function earLong(c, bx, by, ang, sp, k) {
    c.save(); c.translate(bx, by); c.rotate(ang); c.scale(k, k);
    ell(c, 0, -17, 6.6, 18); paint(c, sp.fur);
    ell(c, 0, -16, 3.1, 12.5); c.fillStyle = sp.inner; c.fill();
    c.restore();
  }
  function earPoint(c, bx, by, ang, sp, h, w, k) {
    c.save(); c.translate(bx, by); c.rotate(ang); c.scale(k, k);
    c.beginPath(); c.moveTo(-w / 2, 2); c.quadraticCurveTo(-w * 0.3, -h * 0.75, 0, -h);
    c.quadraticCurveTo(w * 0.3, -h * 0.75, w / 2, 2); c.closePath(); paint(c, sp.fur);
    c.beginPath(); c.moveTo(-w * 0.26, 0); c.quadraticCurveTo(-w * 0.14, -h * 0.55, 0, -h * 0.7);
    c.quadraticCurveTo(w * 0.14, -h * 0.55, w * 0.26, 0); c.closePath(); c.fillStyle = sp.inner; c.fill();
    if (sp.earTip) {
      c.beginPath(); c.moveTo(-w * 0.2, -h * 0.66); c.quadraticCurveTo(-w * 0.08, -h * 0.9, 0, -h);
      c.quadraticCurveTo(w * 0.08, -h * 0.9, w * 0.2, -h * 0.66); c.closePath(); c.fillStyle = sp.earTip; c.fill();
      c.beginPath(); c.moveTo(-w / 2, 2); c.quadraticCurveTo(-w * 0.3, -h * 0.75, 0, -h);
      c.quadraticCurveTo(w * 0.3, -h * 0.75, w / 2, 2); paint(c, null);
    }
    c.restore();
  }
  function earRound(c, x, y, r, sp) {
    ell(c, x, y, r, r); paint(c, sp.earEdge || sp.earCol || sp.fur);
    if (sp.earEdge) { ell(c, x, y + r * 0.14, r * 0.6, r * 0.6); c.fillStyle = sp.fur; c.fill(); }
    else if (!sp.earCol) { ell(c, x, y + r * 0.1, r * 0.55, r * 0.55); c.fillStyle = sp.inner; c.fill(); }
  }
  // 옆으로 누운 잎 모양 귀 (소 · 양 · 염소)
  function earSide(c, x, y, ang, sp, rx, ry, dir) {
    c.save(); c.translate(x, y); c.rotate(ang);
    ell(c, dir * rx * 0.7, 0, rx, ry); paint(c, sp.fur);
    ell(c, dir * rx * 0.7, ry * 0.12, rx * 0.6, ry * 0.52); c.fillStyle = sp.inner; c.fill();
    c.restore();
  }
  function drawEarsBack(c, sp, R) {
    var e = R.ear;
    switch (sp.ear) {
      case 'long':
        earLong(c, 6, -19, -0.12 - e * 0.8, sp, 0.94);
        earLong(c, -8, -18, -0.42 - e, sp, 1);
        break;
      case 'tall':
        earPoint(c, 9, -20, 0.12 - e * 0.5, sp, 27, 12, 0.95);
        earPoint(c, -9, -19, -0.32 - e * 0.6, sp, 28, 13, 1);
        break;
      case 'point':
        earPoint(c, 12, -17, 0.28 - e * 0.3, sp, 21, 17, 0.92);
        earPoint(c, -13, -15, -0.38 - e * 0.3, sp, 22, 18, 1);
        break;
      case 'point-s':
        earPoint(c, 12, -18, 0.3 - e * 0.3, sp, 15, 14, 0.92);
        earPoint(c, -14, -16, -0.42 - e * 0.3, sp, 16, 15, 1);
        break;
      case 'pig':
        earPoint(c, 11, -19, 0.62 - e * 0.3, sp, 15, 13, 0.92);
        earPoint(c, -12, -18, 0.1 - e * 0.3, sp, 16, 14, 1);
        break;
      case 'round':
        earRound(c, 14, -20, 8.2, sp);
        earRound(c, -17, -17, 9.2, sp);
        break;
      case 'round-s':
        earRound(c, 14, -21, 6, sp);
        earRound(c, -16, -19, 6.8, sp);
        break;
      case 'leaf':
        earPoint(c, 10, -20, 0.45 - e * 0.3, sp, 15, 10, 0.92);
        earPoint(c, -11, -19, -0.62 - e * 0.3, sp, 16, 11, 1);
        break;
      case 'side':
        earSide(c, 17, -19, 0.5 - e * 0.5, sp, 8, 4.4, 1);
        earSide(c, -20, -10, -0.28 + e * 0.5, sp, 10, 5.2, -1);
        break;
      case 'sideRound':
        ell(c, 25, -8, 6.5, 7); paint(c, sp.fur); ell(c, 25, -8, 3.6, 4); c.fillStyle = sp.inner; c.fill();
        ell(c, -26, -3, 8.5, 9); paint(c, sp.fur); ell(c, -26, -3, 5, 5.5); c.fillStyle = sp.inner; c.fill();
        break;
      case 'big':
        ell(c, 13, -24, 11.5, 11.5); paint(c, sp.fur); ell(c, 13, -23, 7.2, 7.2); c.fillStyle = sp.inner; c.fill();
        ell(c, -18, -20, 13.5, 13.5); paint(c, sp.fur); ell(c, -18, -19, 8.6, 8.6); c.fillStyle = sp.inner; c.fill();
        break;
      case 'koala':
        ell(c, 17, -19, 11, 11); paint(c, sp.fur); ell(c, 17, -18, 6.4, 6.4); c.fillStyle = sp.inner; c.fill();
        ell(c, -21, -14, 13.5, 13.5); paint(c, sp.fur); ell(c, -21, -13, 8, 8); c.fillStyle = sp.inner; c.fill();
        break;
      case 'bat':
        earPoint(c, 12, -17, 0.3 - e * 0.3, sp, 28, 19, 0.92);
        earPoint(c, -13, -15, -0.36 - e * 0.3, sp, 30, 21, 1);
        break;
      case 'tuft':
        earPoint(c, 13, -19, 0.42, sp, 12, 10, 0.92);
        earPoint(c, -14, -17, -0.5, sp, 13, 11, 1);
        break;
      case 'fan':
        c.save(); c.translate(-12, -10); c.rotate(-0.2); c.scale(0.9 + e * 0.5, 1);
        ell(c, -8, 0, 14, 17); paint(c, shade(sp.fur, -0.1));
        c.restore();
        break;
    }
  }
  function drawEarsFront(c, sp, R) {
    if (sp.ear === 'fan') {
      c.save(); c.translate(-13, 0); c.rotate(-0.12 + R.ear * 0.4); c.scale(1 + R.ear * 0.5, 1);
      ell(c, -7, 0, 14.5, 19); paint(c, sp.fur);
      ell(c, -7.5, 1, 9.5, 13.5); c.fillStyle = sp.inner; c.fill();
      c.restore();
    }
  }

  // ───────────── 눈 · 입 ─────────────
  function drawEye(c, x, y, rx, ry, kind, sp, t, far) {
    var blink = (t % 3.4) < 0.13, sleepy = kind === 'sleepy';
    if (sleepy) kind = 'open';
    if (kind === 'open' && blink) kind = 'closed';
    c.lineCap = 'round';
    var line = sp.patch ? '#fff' : OL;
    if (sp.patch) {
      // 판다 : 검은 무늬
      ell(c, x + (far ? 0.6 : -0.6), y + 1.6, rx + 3.3, ry + 3.6, far ? 0.4 : -0.4); c.fillStyle = '#3b3442'; c.fill();
    }
    switch (kind) {
      case 'happy':
        c.beginPath(); c.moveTo(x - rx, y + 1.5); c.quadraticCurveTo(x, y - ry * 0.95, x + rx, y + 1.5);
        if (sp.dark) { c.lineWidth = 4.2; c.strokeStyle = OL; c.stroke(); line = '#fff'; }
        c.lineWidth = 2.5; c.strokeStyle = line; c.stroke();
        return;
      case 'closed':
        c.beginPath(); c.moveTo(x - rx, y); c.quadraticCurveTo(x, y + ry * 0.6, x + rx, y);
        if (sp.dark) { c.lineWidth = 4; c.strokeStyle = OL; c.stroke(); line = '#fff'; }
        c.lineWidth = 2.3; c.strokeStyle = line; c.stroke();
        return;
      case 'x':
        c.beginPath(); c.moveTo(x - rx, y - rx); c.lineTo(x + rx, y + rx); c.moveTo(x + rx, y - rx); c.lineTo(x - rx, y + rx);
        if (sp.dark) { c.lineWidth = 4.2; c.strokeStyle = OL; c.stroke(); line = '#fff'; }
        c.lineWidth = 2.5; c.strokeStyle = line; c.stroke();
        return;
      case 'dizzy':
        ell(c, x, y, rx + 0.6, ry + 0.2); c.fillStyle = '#fff'; c.fill();
        if (!sp.patch) { c.lineWidth = 1.3; c.strokeStyle = OL; c.stroke(); }
        c.beginPath();
        for (var a = 0; a < 9.5; a += 0.4) {
          var rr = 0.5 * a, px = x + Math.cos(a + t * 10) * rr * rx / 5.5, py = y + Math.sin(a + t * 10) * rr * ry / 6;
          if (a === 0) c.moveTo(px, py); else c.lineTo(px, py);
        }
        c.lineWidth = 1.4; c.strokeStyle = OL; c.stroke();
        return;
      case 'wide':
        ell(c, x, y, rx + 1.2, ry + 0.8); paint(c, '#fff', sp.patch ? 0 : 1.6);
        ell(c, x + 0.5, y, 1.9, 2.3); c.fillStyle = '#2b2018'; c.fill();
        return;
    }
    // open · angry · sad
    if (sp.patch) {
      ell(c, x, y, rx * 0.86, ry * 0.84); c.fillStyle = '#fff'; c.fill();
      ell(c, x + 0.5, y + 0.3, rx * 0.56, ry * 0.58); c.fillStyle = '#2b2018'; c.fill();
      ell(c, x + rx * 0.3, y - ry * 0.3, rx * 0.26, ry * 0.22); c.fillStyle = '#fff'; c.fill();
    } else {
      if (sp.sclera) { ell(c, x, y, rx + 1.4, ry + 1.2); c.fillStyle = '#fff'; c.fill(); }
      ell(c, x, y, rx, ry); c.fillStyle = '#2b2018'; c.fill();
      ell(c, x + rx * 0.3, y - ry * 0.42, rx * 0.42, ry * 0.34); c.fillStyle = '#fff'; c.fill();
      ell(c, x - rx * 0.35, y + ry * 0.42, rx * 0.2, ry * 0.16); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill();
    }
    if (sleepy) {   // 나무늘보 : 반쯤 감긴 눈
      c.save(); c.beginPath(); c.rect(x - rx - 2, y - ry - 2, rx * 2 + 4, ry + 1.2); c.clip();
      ell(c, x, y, rx + 0.8, ry + 0.8); c.fillStyle = sp.slothFace ? '#7a5a44' : sp.fur; c.fill();
      c.restore();
      c.beginPath(); c.moveTo(x - rx - 0.5, y - 0.8); c.lineTo(x + rx + 0.5, y - 0.8); c.lineWidth = 1.8; c.strokeStyle = OL; c.stroke();
    }
    if (sp.lashes) {
      var ld = far ? 1 : -1;
      c.beginPath();
      c.moveTo(x + ld * rx * 0.86, y - ry * 0.55); c.lineTo(x + ld * (rx + 2.6), y - ry * 0.95);
      c.moveTo(x + ld * rx * 0.55, y - ry * 0.85); c.lineTo(x + ld * (rx + 1.2), y - ry - 2);
      c.lineWidth = 1.3; c.strokeStyle = OL; c.stroke();
    }
    if (kind === 'angry' || kind === 'sad') {
      var d = kind === 'angry' ? 1 : -1, by = y - ry - (sp.patch ? 3.4 : 1.2);
      c.beginPath();
      if (far) { c.moveTo(x - rx - 0.5, by + d * 2.2); c.lineTo(x + rx + 0.5, by - d * 1.6); }
      else { c.moveTo(x - rx - 0.5, by - d * 1.6); c.lineTo(x + rx + 0.5, by + d * 2.2); }
      if (sp.dark || sp.patch) { c.lineWidth = 4.2; c.strokeStyle = OL; c.stroke(); line = '#fff'; }
      c.lineWidth = 2.4; c.strokeStyle = line; c.stroke();
    }
  }
  function drawMouth(c, x, y, kind, sp, t) {
    c.lineCap = 'round'; c.lineJoin = 'round';
    switch (kind) {
      case 'open':
        c.beginPath(); c.moveTo(x - 4.6, y - 0.5); c.quadraticCurveTo(x, y + 9, x + 4.6, y - 0.5); c.closePath();
        paint(c, '#a8323a', 1.6);
        c.save(); c.clip(); ell(c, x, y + 6.5, 3.4, 2.6); c.fillStyle = '#ff8fa3'; c.fill(); c.restore();
        break;
      case 'o':
        ell(c, x, y + 2.6, 2.6, 3.4); paint(c, '#a8323a', 1.5);
        break;
      case 'flat':
        c.beginPath(); c.moveTo(x - 3.4, y + 1.6); c.lineTo(x + 3.4, y + 1.6); c.lineWidth = 1.8; c.strokeStyle = OL; c.stroke();
        break;
      case 'frown':
        c.beginPath(); c.moveTo(x - 3.6, y + 3.4); c.quadraticCurveTo(x, y - 0.5, x + 3.6, y + 3.4); c.lineWidth = 1.8; c.strokeStyle = OL; c.stroke();
        break;
      case 'wavy':
        c.beginPath(); c.moveTo(x - 5, y + 2); c.quadraticCurveTo(x - 2.5, y - 1, x, y + 2); c.quadraticCurveTo(x + 2.5, y + 5, x + 5, y + 2);
        c.lineWidth = 1.8; c.strokeStyle = OL; c.stroke();
        break;
      case 'chew':
        var k = 1 + Math.sin(t * 18) * 0.25;
        ell(c, x, y + 2.4, 3.2 * k, 2.2 / k); paint(c, '#a8323a', 1.5);
        break;
      default: // smile
        c.beginPath(); c.moveTo(x - 4.2, y + 0.6); c.quadraticCurveTo(x - 2, y + 4, x, y + 1.2); c.quadraticCurveTo(x + 2, y + 4, x + 4.2, y + 0.6);
        c.lineWidth = 1.8; c.strokeStyle = OL; c.stroke();
        if (sp.tongue) { ell(c, x + 0.4, y + 4.6, 2.3, 3); paint(c, '#ff8fa3', 1.3); }
    }
  }

  // ───────────── 머리 ─────────────
  // 외곽선이 있는 선 묶음 (뿔 · 수염처럼 여러 갈래가 이어진 것)
  function strokeBoth(c, w, col) {
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.lineWidth = w + LW * 2; c.strokeStyle = OL; c.stroke();
    c.lineWidth = w; c.strokeStyle = col; c.stroke();
  }

  // 머리 뒤에 깔리는 것 : 갈기 · 가시 · 수염
  function drawHeadBack(c, sp) {
    var k, a;
    if (sp.mane) {
      for (k = 0; k < 12; k++) { a = k / 12 * TAU; ell(c, Math.cos(a) * 27 - 2, Math.sin(a) * 25 + 1, 10.5, 10.5); paint(c, sp.mane); }
      ell(c, -2, 1, 29, 27); c.fillStyle = sp.mane; c.fill();
    }
    if (sp.spikes) {
      c.beginPath();
      for (k = 0; k <= 13; k++) {
        a = (-50 - k * 15.5) * PI / 180;
        var rr = k % 2 ? 39 : 29;
        if (k === 0) c.moveTo(Math.cos(a) * rr - 2, Math.sin(a) * rr * 0.95); else c.lineTo(Math.cos(a) * rr - 2, Math.sin(a) * rr * 0.95);
      }
      c.lineTo(-2, 6); c.closePath(); paint(c, sp.spikes);
    }
    if (sp.maneTop) { ell(c, -7, -5, 27, 26); paint(c, sp.maneTop); }
    if (sp.beard) { c.beginPath(); c.moveTo(6, 20); c.quadraticCurveTo(9, 33, 14, 36); c.quadraticCurveTo(17, 29, 20, 20); c.closePath(); paint(c, sp.beard); }
  }

  // 귀 다음, 머리통 전에 : 뿔 · 볏 · 눈두덩
  function drawHeadTop(c, sp) {
    if (sp.ossi) {
      limb(c, [-3, -20, -5, -35], 3.6, sp.fur); limb(c, [9, -21, 10, -36], 3.4, sp.fur);
      ell(c, -5, -36.5, 3.9, 3.9); paint(c, sp.ossi); ell(c, 10, -37.5, 3.6, 3.6); paint(c, sp.ossi);
    }
    if (sp.horn === 'cow') {
      c.beginPath(); c.moveTo(-14, -19); c.quadraticCurveTo(-19, -31, -10, -34); c.quadraticCurveTo(-11, -27, -6, -22); c.closePath(); paint(c, '#fff4dc');
      c.beginPath(); c.moveTo(9, -23); c.quadraticCurveTo(9, -31, 17, -34); c.quadraticCurveTo(19, -27, 16, -21); c.closePath(); paint(c, '#fff4dc');
    } else if (sp.horn === 'goat') {
      c.beginPath(); c.moveTo(4, -22); c.quadraticCurveTo(0, -43, -13, -45); c.quadraticCurveTo(-1, -34, 14, -22); c.closePath(); paint(c, '#c9c2b4');
      c.beginPath(); c.moveTo(-11, -20); c.quadraticCurveTo(-18, -41, -32, -37); c.quadraticCurveTo(-18, -30, 0, -22); c.closePath(); paint(c, '#d6d0c2');
    } else if (sp.horn === 'antler') {
      c.beginPath();
      c.moveTo(8, -22); c.quadraticCurveTo(13, -33, 10, -46); c.moveTo(11.5, -31); c.lineTo(20, -35); c.moveTo(12, -39); c.lineTo(19, -46);
      c.moveTo(-8, -21); c.quadraticCurveTo(-13, -32, -10, -45); c.moveTo(-11, -30); c.lineTo(-20, -35); c.moveTo(-11.5, -38); c.lineTo(-19, -45);
      strokeBoth(c, 3, '#b98450');
    }
    if (sp.comb) {
      ell(c, -3, -25, 5, 6.5); paint(c, sp.comb); ell(c, 12.5, -25, 4.8, 6); paint(c, sp.comb); ell(c, 5, -28, 5.5, 7.5); paint(c, sp.comb);
    }
    if (sp.crest) {
      c.beginPath(); c.moveTo(4, -22); c.quadraticCurveTo(-4, -40, -14, -38); c.quadraticCurveTo(-6, -32, -4, -22); c.closePath(); paint(c, sp.crest);
      c.beginPath(); c.moveTo(10, -23); c.quadraticCurveTo(8, -42, -2, -44); c.quadraticCurveTo(3, -34, 3, -23); c.closePath(); paint(c, sp.crest);
    }
    if (sp.tuftHair) {
      c.beginPath(); c.moveTo(-4, -22); c.lineTo(-7, -32); c.moveTo(2, -24); c.lineTo(2, -35); c.moveTo(8, -23); c.lineTo(11, -33);
      c.lineWidth = 2; c.strokeStyle = OL; c.lineCap = 'round'; c.stroke();
    }
    if (sp.eyesTop) { ell(c, -3, -19, 10.5, 10.5); paint(c, sp.fur); ell(c, 15, -20.5, 9.5, 9.5); paint(c, sp.fur); }
    if (sp.eyeBump) { ell(c, 2, -17, 8.6, 8.6); paint(c, sp.fur); ell(c, 16, -18, 7.6, 7.6); paint(c, sp.fur); }
  }

  function drawHead(c, sp, R, t) {
    var hrx = 27 * (sp.hrx || 1), hry = 24.5;
    var sn = sp.snout, k;
    // 눈 자리
    var ex1 = 2.5, ex2 = 18, ey = -4.5;
    if (!sn) { ex1 = 3; ex2 = 18.5; ey = -3; }
    if (sp.eyesTop) { ex1 = -3; ex2 = 15; ey = -20; }
    if (sp.eyeBump) { ex1 = 2; ex2 = 16; ey = -17; }
    if (sp.eyeWide) { ex1 -= sp.eyeWide; ex2 += sp.eyeWide; }

    drawHeadBack(c, sp);
    drawEarsBack(c, sp, R);
    drawHeadTop(c, sp);

    if (sp.tuft) {  // 오리 머리 깃털
      c.beginPath(); c.moveTo(-2, -22); c.quadraticCurveTo(-8, -34, -1, -33); c.quadraticCurveTo(0, -38, 6, -34); c.quadraticCurveTo(6, -28, 5, -22); c.closePath(); paint(c, sp.fur);
    }
    if (sn && sn.out) { ell(c, sn.x, sn.y, sn.rx, sn.ry); paint(c, sp.fur2); }
    if (sp.cheek) {  // 볼 털
      c.beginPath(); c.moveTo(-22, 2); c.lineTo(-31, 10); c.lineTo(-23, 11); c.lineTo(-27, 18); c.lineTo(-15, 18); c.closePath(); paint(c, sp.fur);
    }

    // 머리통
    ell(c, 0, 0, hrx, hry); paint(c, sp.fur);

    // 무늬 (머리 안쪽에만)
    c.save(); ell(c, 0, 0, hrx - LW * 0.5, hry - LW * 0.5); c.clip();
    if (sp.fur2 !== sp.fur && (sp.cheek || sp.earTip || sp.lowerWhite)) {   // 여우 · 강아지 · 호랑이 … : 아래쪽 흰 털
      ell(c, 12, 22, 27, 17); c.fillStyle = sp.fur2; c.fill();
    }
    if (sp.hamFace) { ell(c, 8, 21, 32, 19); c.fillStyle = sp.fur2; c.fill(); }
    if (sp.belly && !sp.beak && sn && !sn.croc) { ell(c, 14, 20, 20, 14); c.fillStyle = sp.fur2; c.fill(); }   // 캥거루 · 수달 · 물개
    if (sp.penguinFace) {                                          // 펭귄 : 하얀 얼굴
      ell(c, 3, 4, 12.5, 14); c.fillStyle = '#fff'; c.fill();
      ell(c, 19, 4, 11, 13.5); c.fill();
      ell(c, 11, 16, 20, 12); c.fill();
    }
    if (sp.apeFace) {                                              // 원숭이 · 고릴라 : 하트 모양 얼굴
      c.fillStyle = sp.fur2;
      ell(c, ex1 - 0.5, ey + 1, 10.5, 11); c.fill(); ell(c, ex2, ey + 1, 9.5, 10.5); c.fill(); ell(c, 11, 13, 18.5, 12.5); c.fill();
    }
    if (sp.slothFace) {                                            // 나무늘보 : 밝은 얼굴 + 눈가 줄
      ell(c, 9, 3, 21.5, 17.5); c.fillStyle = sp.fur2; c.fill();
      c.fillStyle = '#8a6a52';
      ell(c, ex1 - 3, ey + 3, 9.4, 6, 0.45); c.fill(); ell(c, ex2 + 2.5, ey + 3, 8, 5.4, -0.45); c.fill();
    }
    if (sp.owlDisc) {                                              // 부엉이 : 눈 둘레 원판
      c.fillStyle = sp.owlDisc; c.lineWidth = 1.4; c.strokeStyle = shade(sp.fur, -0.28);
      ell(c, ex1, ey, 11.2, 11.8); c.fill(); c.stroke(); ell(c, ex2, ey, 9.6, 10.8); c.fill(); c.stroke();
    }
    if (sp.rpFace) {                                               // 레서판다 : 흰 볼
      c.fillStyle = '#fff'; ell(c, -18, 10, 10, 8); c.fill(); ell(c, 25, 10, 6, 7); c.fill();
    }
    if (sp.mask) {                                                 // 너구리 : 눈가 가면
      c.fillStyle = '#fff'; ell(c, ex1 - 1, ey - 8.5, 8, 3.4, -0.2); c.fill(); ell(c, ex2 + 1, ey - 8.5, 6.6, 3, 0.2); c.fill();
      c.fillStyle = sp.mask; ell(c, ex1 - 2.5, ey + 1, 10, 7.4, -0.22); c.fill(); ell(c, ex2 + 2.5, ey + 1, 8.6, 6.8, 0.22); c.fill();
    }
    if (sp.stripe) {                                               // 스컹크 : 이마 흰 줄
      c.beginPath(); c.moveTo(10, -3); c.quadraticCurveTo(4, -16, 6, -28); c.lineTo(-16, -28); c.quadraticCurveTo(-6, -14, 5, -3); c.closePath();
      c.fillStyle = '#fff'; c.fill();
    }
    if (sp.blaze) { ell(c, 9, -13, 3.4, 10); c.fillStyle = '#fff'; c.fill(); }   // 말 : 이마 흰 줄
    if (sp.spots) {                                                // 치타 점무늬
      c.fillStyle = sp.spots;
      [[-16, -12, 2.6], [-8, -18, 2.3], [-20, -1, 2.4], [-13, 8, 2.2], [1, -19, 2.1], [-21, 10, 2], [-5, -9, 1.8]].forEach(function (p) { ell(c, p[0], p[1], p[2], p[2] * 0.85); c.fill(); });
    }
    if (sp.dots) {                                                 // 사슴 흰 점
      c.fillStyle = sp.dots;
      [[-15, -13, 2.2], [-7, -18, 2], [-20, -3, 2.1], [-12, -5, 1.8]].forEach(function (p) { ell(c, p[0], p[1], p[2], p[2]); c.fill(); });
    }
    if (sp.patches) {                                              // 기린 얼룩
      c.fillStyle = sp.patches;
      [[-17, -11, 6.5, 5.5, 0.3], [-7, -20, 5.5, 4, -0.2], [-21, 3, 5, 6.5, 0], [-11, 2, 4.5, 4, 0.5], [-13, 13, 5.5, 4.5, -0.3], [4, -21, 4, 3, 0]].forEach(function (p) { ell(c, p[0], p[1], p[2], p[3], p[4]); c.fill(); });
    }
    if (sp.cowspots) {                                             // 젖소 얼룩
      c.fillStyle = sp.cowspots;
      ell(c, -17, -13, 12, 9.5, -0.5); c.fill(); ell(c, -22, 13, 7, 7.5); c.fill(); ell(c, 22, -17, 7, 5.5, 0.4); c.fill();
    }
    if (sp.stripes) {                                              // 고양이 줄무늬
      c.strokeStyle = sp.stripes; c.lineWidth = 2.6; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(4, -24); c.lineTo(5, -15); c.moveTo(-3, -24); c.lineTo(-1, -16); c.moveTo(11, -23); c.lineTo(10, -16);
      c.moveTo(-27, -2); c.lineTo(-18, -1); c.moveTo(-27, 6); c.lineTo(-19, 5);
      c.stroke();
    }
    if (sp.tstripes) {                                             // 호랑이 줄무늬
      c.strokeStyle = sp.tstripes; c.lineWidth = 3.3; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(4, -25); c.lineTo(5, -14.5); c.moveTo(-4, -25); c.lineTo(-2, -16); c.moveTo(12, -24); c.lineTo(11.5, -16);
      c.moveTo(-28, -5); c.lineTo(-17, -3); c.moveTo(-28, 4); c.lineTo(-18, 4); c.moveTo(-26, 12); c.lineTo(-18, 10.5);
      c.stroke();
    }
    if (sp.zstripes) {                                             // 얼룩말 줄무늬
      c.strokeStyle = sp.zstripes; c.lineWidth = 3.3; c.lineCap = 'round';
      c.beginPath();
      for (k = 0; k < 3; k++) { c.moveTo(-23 + k * 7.5, -27); c.quadraticCurveTo(-26 + k * 7.5, -10, -32 + k * 8, 6 + k * 3); }
      c.moveTo(1, -25); c.lineTo(0.5, -15.5); c.moveTo(9, -24.5); c.lineTo(9, -16); c.moveTo(17, -23); c.lineTo(16.5, -16.5);
      c.moveTo(-14, 14); c.lineTo(-6, 20); c.moveTo(-22, 13); c.lineTo(-13, 22);
      c.stroke();
    }
    if (sn && !sn.out) { ell(c, sn.x, sn.y, sn.rx, sn.ry); c.fillStyle = sp.fur2; c.fill(); }
    c.restore();

    if (sn && sn.out) { ell(c, sn.x, sn.y, sn.rx - LW * 0.5, sn.ry - LW * 0.5); c.fillStyle = sp.fur2; c.fill(); }

    // 머리 위 털 (양 · 알파카) · 앞머리 (말)
    if (sp.wool) {
      for (k = 0; k < 6; k++) { var wa = (190 + k * 24) * PI / 180; ell(c, Math.cos(wa) * 23, Math.sin(wa) * 21 - 2, 8.6, 8.6); paint(c, sp.wool); }
      ell(c, -2, -17, 20, 9); c.fillStyle = sp.wool; c.fill();
    }
    if (sp.forelock) { c.beginPath(); c.moveTo(-3, -24); c.quadraticCurveTo(9, -23, 14, -12); c.quadraticCurveTo(5, -15, -5, -15); c.closePath(); paint(c, sp.forelock); }

    // 눈
    if (sp.brow) { ell(c, ex1 + 1, ey - 10, 2.6, 1.9); c.fillStyle = sp.brow; c.fill(); ell(c, ex2, ey - 10, 2.2, 1.7); c.fill(); }
    if (sp.spots) {  // 치타 눈물 자국
      c.beginPath(); c.moveTo(ex1 + 2.5, ey + 5); c.quadraticCurveTo(ex1 + 3, ey + 12, ex1 + 8, ey + 15);
      c.moveTo(ex2 + 1, ey + 5); c.quadraticCurveTo(ex2 + 2, ey + 10, ex2 + 1, ey + 14);
      c.lineWidth = 1.7; c.strokeStyle = '#4a3226'; c.lineCap = 'round'; c.stroke();
    }
    if (sp.rpFace) {  // 레서판다 눈물 자국
      c.beginPath(); c.moveTo(ex1 + 1, ey + 6); c.quadraticCurveTo(ex1 + 1, ey + 12, ex1 + 5, ey + 15);
      c.moveTo(ex2 + 2, ey + 6); c.quadraticCurveTo(ex2 + 4, ey + 11, ex2 + 3, ey + 15);
      c.lineWidth = 2.4; c.strokeStyle = '#9a3f1a'; c.lineCap = 'round'; c.stroke();
    }
    if (sp.eyeRing) { c.fillStyle = '#fff'; ell(c, ex1, ey, 8, 9.2); c.fill(); ell(c, ex2, ey, 6.4, 8); c.fill(); }
    var ek = (R.eyes === 'open' && sp.eyesDefault) ? sp.eyesDefault : R.eyes;
    drawEye(c, ex1, ey, 4.5, 6.1, ek, sp, t, false);
    drawEye(c, ex2, ey, 3.8, 5.6, ek, sp, t + 0.0, true);

    // 볼터치
    ell(c, -6.5, 8, 5, 3.2); c.fillStyle = 'rgba(255,120,140,.42)'; c.fill();

    // 코 · 입
    if (sn) {
      var nx = sn.x + sn.rx * 0.55, ny = sn.y - sn.ry * 0.38;
      if (sn.disc) {         // 돼지 코
        ell(c, sn.x + 2.2, sn.y - 1, 2, 2.8); c.fillStyle = '#c9506a'; c.fill();
        ell(c, sn.x + 6.6, sn.y - 1, 1.7, 2.6); c.fill();
        drawMouth(c, sn.x - 4.5, sn.y + sn.ry - 1.5, R.mouth, sp, t);
      } else if (sn.croc) {  // 악어 : 콧구멍 · 입선 · 이빨
        c.fillStyle = OL;
        ell(c, sn.x + sn.rx - 5, sn.y - sn.ry + 2.6, 1.6, 1.3); c.fill(); ell(c, sn.x + sn.rx - 10.5, sn.y - sn.ry + 1.8, 1.5, 1.2); c.fill();
        c.beginPath(); c.moveTo(sn.x - sn.rx + 4, sn.y + 2); c.quadraticCurveTo(sn.x, sn.y + 4.5, sn.x + sn.rx - 2, sn.y + 1);
        c.lineWidth = 1.8; c.strokeStyle = OL; c.lineCap = 'round'; c.stroke();
        c.fillStyle = '#fff'; c.lineWidth = 1;
        for (k = 0; k < 5; k++) {
          var tx = sn.x - sn.rx + 8 + k * 6, ty = sn.y + 3.4 - Math.abs(k - 2) * 0.5;
          c.beginPath(); c.moveTo(tx - 2, ty); c.lineTo(tx, ty + 3.8); c.lineTo(tx + 2, ty); c.closePath(); c.fill(); c.stroke();
        }
      } else if (sp.bigNose) {   // 코알라 : 큰 코
        ell(c, sn.x - 1.5, sn.y - 3.5, 4.8, 6.8); c.fillStyle = sp.bigNose; c.fill();
        ell(c, sn.x - 0.6, sn.y - 7, 1.7, 1.3); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill();
        drawMouth(c, sn.x - 1.5, sn.y + 5, R.mouth, sp, t);
      } else {
        if (sp.nose) {
          ell(c, nx, ny, 3.5, 2.7); c.fillStyle = sp.nose; c.fill();
          ell(c, nx + 0.6, ny - 0.9, 1.2, 0.7); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill();
        }
        if (sn.nostril) { c.fillStyle = 'rgba(74,50,38,.75)'; ell(c, nx - 1.5, ny + 0.5, 1.3, 1.8); c.fill(); ell(c, nx + 3.2, ny + 0.5, 1.2, 1.7); c.fill(); }
        if (sn.nostrilTop) { c.fillStyle = 'rgba(74,50,38,.7)'; ell(c, sn.x + 3, sn.y - sn.ry + 3.6, 1.7, 1.3); c.fill(); ell(c, sn.x + 10, sn.y - sn.ry + 4.6, 1.6, 1.2); c.fill(); }
        var mdx = sp.nose ? 0 : -2.5, mdy = sp.nose ? 0 : 1.5;
        drawMouth(c, nx - 2.2 + mdx, ny + 3.2 + mdy, R.mouth, sp, t);
        if (sp.teeth && (R.mouth === 'smile' || R.mouth === 'flat')) {
          c.beginPath(); c.rect(nx - 4.4, ny + 5.2, 2.3, 3.4); c.rect(nx - 2.1, ny + 5.2, 2.3, 3.4); paint(c, '#fff', 1.1);
        }
        if (sp.teethBig && R.mouth !== 'open' && R.mouth !== 'o') {
          c.beginPath(); c.rect(nx - 5.4, ny + 5, 3.3, 6); c.rect(nx - 2.1, ny + 5, 3.3, 6); paint(c, '#fff', 1.3);
        }
        if (sn.teeth2) {
          c.beginPath(); c.rect(sn.x + 0.5, sn.y + sn.ry - 4.4, 2.8, 4.4); c.rect(sn.x + 8, sn.y + sn.ry - 5, 2.8, 4.4); paint(c, '#fff', 1.2);
        }
        if (sp.fang) {
          c.fillStyle = '#fff'; c.lineWidth = 1; c.strokeStyle = OL;
          c.beginPath(); c.moveTo(nx - 6, ny + 4.6); c.lineTo(nx - 4.8, ny + 8.4); c.lineTo(nx - 3.6, ny + 4.6); c.closePath(); c.fill(); c.stroke();
          c.beginPath(); c.moveTo(nx - 0.8, ny + 4.6); c.lineTo(nx + 0.4, ny + 8.4); c.lineTo(nx + 1.6, ny + 4.6); c.closePath(); c.fill(); c.stroke();
        }
      }
      if (sp.whisker) {
        c.beginPath();
        c.moveTo(nx - 9, ny + 3); c.lineTo(nx - 20, ny + 1); c.moveTo(nx - 9, ny + 5.5); c.lineTo(nx - 20, ny + 7);
        c.moveTo(nx + 1, ny + 3.5); c.lineTo(nx + 9, ny + 2); c.moveTo(nx + 1, ny + 5.5); c.lineTo(nx + 9, ny + 7);
        c.lineWidth = 1.1; c.strokeStyle = 'rgba(74,50,38,.65)'; c.stroke();
      }
      if (sp.horn === 'rhino') {
        var hx0 = sn.x + 3, hy0 = sn.y - sn.ry + 1.5;
        c.beginPath(); c.moveTo(hx0, hy0); c.quadraticCurveTo(hx0 + 4, hy0 - 15, hx0 + 10, hy0 - 17); c.quadraticCurveTo(hx0 + 11, hy0 - 6, hx0 + 9.5, hy0 + 2); c.closePath(); paint(c, '#fff4dc');
      }
    } else if (sp.trunk) {   // 코끼리
      var up = R.trunkUp;
      c.beginPath();
      if (up) { c.moveTo(21, 2); c.bezierCurveTo(34, 2, 40, -4, 46, -12); }
      else { c.moveTo(20, 2); c.bezierCurveTo(33, 3, 36, 18, 29, 25 + Math.sin(t * 9) * 1.5); }
      c.lineCap = 'round'; c.lineWidth = 9 + LW * 2; c.strokeStyle = OL; c.stroke();
      c.lineWidth = 9; c.strokeStyle = sp.fur; c.stroke();
      ell(c, 16, 1, 8, 7.5); c.fillStyle = sp.fur; c.fill();
      c.beginPath(); c.moveTo(27, 6.5); c.lineTo(32, 6); c.moveTo(29.5, 12); c.lineTo(34, 11.5);
      if (up) { c.moveTo(0, 0); }
      c.lineWidth = 1.2; c.strokeStyle = 'rgba(74,50,38,.4)'; c.stroke();
      c.beginPath(); c.moveTo(14, 10); c.quadraticCurveTo(19, 17, 24, 12.5); c.quadraticCurveTo(19, 13, 16.5, 9); c.closePath(); paint(c, '#fffbee', 1.5);
      drawMouth(c, 9, 12, R.mouth === 'smile' ? 'smile1' : R.mouth, sp, t);
    } else if (sp.beak) {
      var bt = sp.beakType || (sp.penguinFace ? 'penguin' : 'duck');
      if (bt === 'penguin') {
        c.beginPath(); c.moveTo(21, 3); c.quadraticCurveTo(31, 4.5, 34, 7.5); c.quadraticCurveTo(29, 11, 21, 11); c.closePath(); paint(c, sp.beak, 2);
        c.beginPath(); c.moveTo(22, 7.4); c.lineTo(33, 7.5); c.lineWidth = 1.2; c.strokeStyle = OL; c.stroke();
      } else if (bt === 'cone') {     // 닭
        c.beginPath(); c.moveTo(21, 2); c.lineTo(34, 6.5); c.lineTo(21, 11); c.closePath(); paint(c, sp.beak, 2);
        c.beginPath(); c.moveTo(22, 6.6); c.lineTo(32, 6.6); c.lineWidth = 1.1; c.strokeStyle = OL; c.stroke();
        ell(c, 22.5, 15.5, 3.4, 5.2); paint(c, sp.comb || '#ff4d5e', 1.8);
      } else if (bt === 'owl') {      // 부엉이
        c.beginPath(); c.moveTo(6.5, 2.5); c.quadraticCurveTo(10.5, 0.5, 14.5, 2.5); c.quadraticCurveTo(13, 10, 10.5, 12.5); c.quadraticCurveTo(8, 10, 6.5, 2.5); c.closePath(); paint(c, sp.beak, 1.8);
      } else if (bt === 'hook') {     // 앵무새
        c.beginPath(); c.moveTo(18, 9); c.quadraticCurveTo(23, 17, 28.5, 12.5); c.quadraticCurveTo(24, 9.5, 18, 9); c.closePath(); paint(c, '#6b6f7a', 1.8);
        c.beginPath(); c.moveTo(17, -3); c.bezierCurveTo(30, -7, 39, 3, 30.5, 16); c.quadraticCurveTo(28, 9, 18, 9); c.closePath(); paint(c, sp.beak, 2);
      } else if (bt === 'bent') {     // 플라밍고
        c.beginPath(); c.moveTo(16, 0); c.quadraticCurveTo(28, -3, 32, 6); c.quadraticCurveTo(33, 15, 24, 18); c.quadraticCurveTo(26, 10, 16, 9); c.closePath(); paint(c, sp.beak, 2);
        c.beginPath(); c.moveTo(29.6, 3.4); c.quadraticCurveTo(34, 14, 24, 18); c.quadraticCurveTo(27, 12, 26.6, 6.5); c.closePath(); paint(c, '#2b2018', 1.6);
      } else {                        // 오리 · 타조
        var op = (R.mouth === 'open' || R.mouth === 'o') ? 3 : 0;
        c.beginPath(); c.moveTo(18, 3); c.bezierCurveTo(28, 0, 38, 2, 38, 6); c.bezierCurveTo(38, 8, 30, 9, 18, 9); c.closePath(); paint(c, sp.beak, 2);
        c.beginPath(); c.moveTo(18, 9 + op * 0.3); c.bezierCurveTo(26, 9 + op, 34, 9 + op, 35, 8 + op); c.bezierCurveTo(32, 13 + op, 24, 13 + op, 18, 11 + op); c.closePath(); paint(c, shade(sp.beak, -0.12), 2);
        ell(c, 31, 4, 1, 0.8); c.fillStyle = OL; c.fill();
      }
    } else if (sp.wideMouth) {   // 개구리
      c.fillStyle = OL; ell(c, 20, -3, 0.9, 1.1); c.fill(); ell(c, 24, -2, 0.8, 1); c.fill();
      if (R.mouth === 'open' || R.mouth === 'o' || R.mouth === 'chew') drawMouth(c, 12, 7, 'open', sp, t);
      else { c.beginPath(); c.moveTo(-9, 6); c.quadraticCurveTo(8, 16, 25, 5); c.lineWidth = 1.9; c.strokeStyle = OL; c.lineCap = 'round'; c.stroke(); }
    } else if (sp.apeFace) {     // 원숭이 · 고릴라
      c.fillStyle = OL; ell(c, 12.5, 5.5, 1, 1.4); c.fill(); ell(c, 16.5, 5.5, 1, 1.4); c.fill();
      drawMouth(c, 14, 11, R.mouth, sp, t);
    } else if (sp.slothFace) {   // 나무늘보
      ell(c, 14, 5, 3.4, 2.6); c.fillStyle = sp.nose; c.fill();
      drawMouth(c, 12.5, 9, R.mouth, sp, t);
    } else {                 // 거북이 : 콧구멍과 입
      ell(c, 22, 2, 0.9, 1.2); c.fillStyle = OL; c.fill(); ell(c, 25, 2.5, 0.8, 1.1); c.fill();
      drawMouth(c, 17, 9, R.mouth, sp, t);
    }

    drawEarsFront(c, sp, R);
  }

  // ───────────── 동물 한 마리 ─────────────
  // o : { x, y(발바닥), s(키 100 기준 배율), t, phase, pose, boost, hop, num, color, textColor, eyes, mouth, prog, alpha }
  // 돌려주는 값 : { hx, hy(머리 중심), top(머리 꼭대기 y), s } — 이름표 · 효과 위치용
  Art.drawAnimal = function (c, id, o) {
    var sp = SPEC[id];
    var s = (o.s || 1) * sp.size;
    var t = o.t || 0, ph = o.phase || 0, pose = o.pose || 'run';
    var R = makeRig(pose, ph, t, o);
    var leg = sp.leg || 10, lw = sp.lw || 7.4, brx = sp.brx || 15.5, bry = sp.bry || 17.5, hr = sp.hr || 1, neck = sp.neck || 0;
    var bodyFill = sp.bodyCol || sp.fur;
    var hipY = -(2 * leg + 2.5);
    var limbCol = sp.limbCol || sp.fur;
    var footCol = sp.feet || sp.sock || limbCol;
    var farCol = shade(limbCol, -0.14), farFoot = shade(footCol, -0.14);
    var shirt = o.color || '#ff5a5f';

    if (pose === 'shell') { return drawShell(c, sp, o, s, t); }

    c.save();
    c.translate(o.x + R.dx * s, o.y + R.dy * s);
    c.scale(s, s);
    if (R.flipX !== 1) c.scale(R.flipX, 1);
    if (R.rot) { c.translate(0, R.pivotY); c.rotate(R.rot); c.translate(0, -R.pivotY); }
    var sitDy = R.sit ? (2 * leg - 5) : 0;
    c.translate(0, R.bob + sitDy);

    var bodyCx = 0, bodyCy = hipY - bry * 0.72;
    var shX = bodyCx + 3, shY = bodyCy - bry * 0.42;
    var headCx = bodyCx + 7.5 + neck * 0.3, headCy = bodyCy - bry - 24.5 * hr * 0.66 - neck;

    function legDraw(a, col, fcol, dx) {
      var hx = -1 + dx, hy = hipY;
      var kx = hx + Math.sin(a[0]) * leg, ky = hy + Math.cos(a[0]) * leg;
      var fx = kx + Math.sin(a[1]) * leg, fy = ky + Math.cos(a[1]) * leg;
      limb(c, [hx, hy, kx, ky, fx, fy], sp.legW || lw, col);
      // 발
      c.save(); c.translate(fx, fy); c.rotate(-a[1] * 0.75);
      var fl = sp.bigFeet ? 9.5 : (sp.feet ? 7.5 : 6.4);
      ell(c, fl * 0.38, 1.2, fl, 3.9); paint(c, fcol);
      c.restore();
    }
    function armDraw(a, col, dx) {
      var al = sp.batWing ? 12 : (sp.wing ? 8 : 8.6);
      if (sp.wing && sp.wingCol) col = (col === farCol) ? shade(sp.wingCol, -0.14) : sp.wingCol;
      var ex = shX + dx + Math.sin(a[0]) * al, ey = shY + Math.cos(a[0]) * al;
      var hx = ex + Math.sin(a[1]) * al, hy = ey + Math.cos(a[1]) * al;
      if (sp.wing) {  // 날개 · 지느러미 팔
        c.beginPath(); c.moveTo(shX + dx - 2, shY - 2);
        c.quadraticCurveTo(ex - 6, ey, hx, hy); c.quadraticCurveTo(ex + 6, ey - 2, shX + dx + 3, shY - 1); c.closePath();
        paint(c, col);
      } else {
        limb(c, [shX + dx, shY, ex, ey, hx, hy], lw * 0.86, col);
        ell(c, hx, hy, lw * 0.56, lw * 0.56); paint(c, sp.sock ? (col === farCol ? farFoot : footCol) : col);
      }
      return [hx, hy];
    }
    function lean(fn) {
      c.save(); c.translate(0, hipY); c.rotate(R.lean); c.translate(0, -hipY); fn(); c.restore();
    }

    // 1) 뒤쪽 다리
    legDraw(R.legF, farCol, farFoot, 2.5);

    // 2) 꼬리 · 뒤쪽 팔 · 등껍질 · 몸통
    lean(function () {
      drawTail(c, sp, R, bodyCx - brx * 0.82, bodyCy + bry * 0.42);
      armDraw(R.armF, farCol, 3);
      if (sp.hump) { ell(c, bodyCx - 7, bodyCy - bry * 0.78, 10.5, 9.5); paint(c, sp.fur); }
      if (sp.spikes) {   // 고슴도치 등 가시
        c.beginPath();
        for (var sk = 0; sk <= 11; sk++) {
          var sa = (-100 - sk * 15) * PI / 180, sr = sk % 2 ? brx + 9 : brx + 1;
          if (sk === 0) c.moveTo(bodyCx - 3 + Math.cos(sa) * sr, bodyCy + Math.sin(sa) * sr * 1.08); else c.lineTo(bodyCx - 3 + Math.cos(sa) * sr, bodyCy + Math.sin(sa) * sr * 1.08);
        }
        c.lineTo(bodyCx, bodyCy); c.closePath(); paint(c, sp.spikes);
      }
      if (sp.shell) {
        ell(c, bodyCx - 8, bodyCy - 1, brx + 3.5, bry + 4, -0.12); paint(c, sp.shell);
        c.save(); c.clip();
        c.strokeStyle = sp.shell2; c.lineWidth = 2.2;
        c.beginPath();
        c.moveTo(bodyCx - 14, bodyCy - 14); c.lineTo(bodyCx - 6, bodyCy - 4); c.lineTo(bodyCx - 16, bodyCy + 6);
        c.moveTo(bodyCx - 6, bodyCy - 4); c.lineTo(bodyCx + 6, bodyCy - 6);
        c.moveTo(bodyCx - 16, bodyCy + 6); c.lineTo(bodyCx - 9, bodyCy + 18);
        c.moveTo(bodyCx - 14, bodyCy - 14); c.lineTo(bodyCx - 26, bodyCy - 10);
        c.moveTo(bodyCx - 16, bodyCy + 6); c.lineTo(bodyCx - 28, bodyCy + 8);
        c.stroke();
        c.restore();
      }
      // 몸통
      ell(c, bodyCx, bodyCy, brx, bry); paint(c, sp.belly || bodyFill);
      c.save(); ell(c, bodyCx, bodyCy, brx - LW * 0.5, bry - LW * 0.5); c.clip();
      if (sp.belly && !sp.shell) { c.fillStyle = bodyFill; c.fillRect(bodyCx - brx - 2, bodyCy - bry - 2, brx * 0.9, bry * 2 + 4); }
      // 경기복 (민소매 + 반바지)
      c.fillStyle = shirt; c.fillRect(bodyCx - brx - 2, bodyCy - bry * 0.52, brx * 2 + 4, bry * 1.0);
      c.fillStyle = '#ffffff'; c.fillRect(bodyCx - brx - 2, bodyCy - bry * 0.52, brx * 2 + 4, 2.2);
      c.fillStyle = shade(shirt, -0.28); c.fillRect(bodyCx - brx - 2, bodyCy + bry * 0.48, brx * 2 + 4, bry);
      c.fillStyle = '#ffffff'; c.fillRect(bodyCx - brx - 2, bodyCy + bry * 0.42, brx * 2 + 4, 2.2);
      c.restore();
      ell(c, bodyCx, bodyCy, brx, bry); paint(c, null);
      // 번호
      if (o.num !== undefined && o.num !== null && R.flipX > 0.3) {
        ell(c, bodyCx + 4.5, bodyCy - 0.5, 6.6, 6.6); paint(c, '#fff', 1.4);
        c.fillStyle = OL; c.font = '800 9.5px "Jua", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(String(o.num), bodyCx + 4.5, bodyCy + 0.3);
      }
    });

    // 3) 앞쪽 다리
    legDraw(R.legN, limbCol, footCol, -1.5);

    // 4) 머리 · 앞쪽 팔
    var hand = null;
    lean(function () {
      if (neck) {
        var nw = sp.neckW || 11, nx0 = bodyCx + 3.5, ny0 = bodyCy - bry * 0.6, nx1 = headCx - 3, ny1 = headCy + 24.5 * hr * 0.5;
        limb(c, [nx0, ny0, nx1, ny1], nw, sp.fur);
        if (sp.patches) {
          c.fillStyle = sp.patches;
          ell(c, nx0 + (nx1 - nx0) * 0.3 - 1.5, ny0 + (ny1 - ny0) * 0.3, 3, 3.6); c.fill();
          ell(c, nx0 + (nx1 - nx0) * 0.62 + 1.5, ny0 + (ny1 - ny0) * 0.62, 2.8, 3.2); c.fill();
        }
      }
      c.save();
      c.translate(headCx, headCy); c.rotate(R.headTilt); c.scale(hr, hr);
      drawHead(c, sp, R, t);
      c.restore();
      hand = armDraw(R.armN, limbCol, -2);
      if (R.hold === 'bamboo') {
        c.save(); c.translate(hand[0], hand[1]); c.rotate(-0.5);
        c.beginPath(); c.rect(-2.2, -20, 4.4, 26); paint(c, '#7ccf5a', 1.6);
        c.beginPath(); c.moveTo(-2.2, -8); c.lineTo(2.2, -8); c.moveTo(-2.2, 0); c.lineTo(2.2, 0); c.lineWidth = 1.2; c.strokeStyle = '#3f8f3a'; c.stroke();
        c.beginPath(); c.moveTo(2, -16); c.quadraticCurveTo(10, -22, 13, -15); c.quadraticCurveTo(7, -14, 2, -13); c.closePath(); paint(c, '#57b84a', 1.4);
        c.restore();
      }
    });
    c.restore();

    // 이름표 · 효과가 쓸 기준점 (화면 좌표)
    var hy0 = (R.bob + sitDy + headCy) * s;
    var out = { hx: o.x + (headCx + R.dx) * s, hy: o.y + hy0 + R.dy * s, top: o.y + (R.bob + sitDy + headCy - 26 * hr - earTop(sp)) * s + R.dy * s, s: s };
    if (R.rot && Math.abs(R.rot) > 0.6 && pose !== 'roll') { out.hx = o.x + 30 * s; out.hy = o.y - 26 * s; out.top = o.y - 52 * s; }
    if (pose === 'roll') { out.hx = o.x; out.hy = o.y - 40 * s; out.top = o.y - 84 * s; }
    return out;
  };
  function earTop(sp) {
    if (sp.horn === 'antler' || sp.horn === 'goat') return 22;
    if (sp.ossi) return 14;
    if (sp.mane || sp.comb || sp.crest || sp.tuftHair || sp.horn === 'cow') return 10;
    switch (sp.ear) {
      case 'bat': return 20; case 'big': case 'koala': return 9; case 'leaf': case 'tuft': return 8; case 'long': return 30; case 'tall': return 22; case 'point': return 13; case 'point-s': return 8; case 'pig': return 8; case 'round': return 4; case 'round-s': return 2; }
    return sp.tuft ? 8 : 0;
  }

  // 거북이 등껍질 스핀
  function drawShell(c, sp, o, s, t) {
    c.save();
    c.translate(o.x, o.y - 17 * s);
    c.scale(s, s);
    var wob = Math.sin(t * 22) * 0.06;
    c.rotate(wob);
    ell(c, 0, 4, 31, 13); paint(c, shade(sp.fur2, -0.05));
    c.beginPath(); c.moveTo(-30, 2); c.bezierCurveTo(-28, -26, 28, -26, 30, 2); c.bezierCurveTo(14, 10, -14, 10, -30, 2); c.closePath(); paint(c, sp.shell);
    c.save(); c.clip();
    c.strokeStyle = sp.shell2; c.lineWidth = 2.4;
    var off = (t * 90) % 20;
    c.beginPath();
    for (var x = -50 + off; x < 50; x += 20) { c.moveTo(x, -24); c.lineTo(x + 8, -8); c.lineTo(x, 10); c.moveTo(x + 8, -8); c.lineTo(x + 20, -8); }
    c.stroke();
    ell(c, -10, -14, 12, 4, -0.3); c.fillStyle = 'rgba(255,255,255,.28)'; c.fill();
    c.restore();
    c.restore();
    return { hx: o.x, hy: o.y - 20 * s, top: o.y - 46 * s, s: s };
  }

  // 발바닥부터 머리 꼭대기까지의 대략적인 키 (단위 100 기준, size 포함)
  Art.heightOf = function (id) {
    var sp = SPEC[id], leg = sp.leg || 10, bry = sp.bry || 17.5, hr = sp.hr || 1;
    return (2 * leg + 2.5 + bry * 1.72 + 24.5 * hr * 1.66 + (sp.neck || 0) + earTop(sp) * hr) * sp.size;
  };

  // 얼굴만 (순위표 · 미니맵용)
  Art.drawFace = function (c, id, x, y, size, t, eyes) {
    var sp = SPEC[id];
    var s = size / 62;
    c.save();
    c.translate(x - 2 * s, y + 5 * s);
    c.scale(s, s);
    var R = makeRig('idle', 0, t || 0, {});
    R.ear = 0; if (eyes) R.eyes = eyes;
    drawHead(c, sp, R, t === undefined ? 1 : t);
    c.restore();
  };

  root.Art = Art;
})(typeof window !== 'undefined' ? window : globalThis);
