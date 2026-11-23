/* 동물 달리기 500m — 그림 (동물 캐릭터)
   전부 캔버스에 직접 그린다. 그림 파일 없음. 캐릭터는 이 게임용으로 새로 디자인한 것. */
(function (root) {
  'use strict';

  var TAU = Math.PI * 2, PI = Math.PI;
  var OL = '#4a3226';       // 외곽선 색
  var LW = 2.6;             // 외곽선 굵기 (캐릭터 단위)

  var Art = {};
  Art.OL = OL;
  Art.LANE_COLORS = ['#ff5a5f', '#ff9f1c', '#f6c915', '#3ecf8e', '#19b8c9', '#4d8df0', '#9b5de5', '#f062b0'];
  Art.LANE_TEXT = ['#fff', '#fff', '#4a3226', '#fff', '#fff', '#fff', '#fff', '#fff'];

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
    penguin:  { dark: true, fur: '#3c4963', fur2: '#ffffff', inner: '#3c4963', nose: null, ear: 'none', tail: 'wedge', snout: null, size: 0.9, leg: 6, brx: 16.5, bry: 18, beak: '#ffa92e', feet: '#ffa92e', belly: '#ffffff' },
    elephant: { fur: '#a9bcd3', fur2: '#c7d6e6', inner: '#f5b9c9', nose: null, ear: 'fan', tail: 'tuft', snout: null, size: 1.18, brx: 18, bry: 19, lw: 9.4, trunk: true },
    kangaroo: { fur: '#d99a5b', fur2: '#f8dfc0', inner: '#f2b6a0', nose: '#3b2a20', ear: 'tall', tail: 'thick', snout: { x: 17, y: 8, rx: 12.5, ry: 8, out: true }, size: 1.08, leg: 11.5, bigFeet: true, belly: '#f8dfc0' },
    skunk:    { dark: true, sclera: true, fur: '#3b3442', fur2: '#ffffff', inner: '#ff9eb5', nose: '#ff7f9d', ear: 'round-s', tail: 'skunk', snout: { x: 15, y: 9, rx: 10.5, ry: 7.5, out: true }, size: 0.93, stripe: true },
    pig:      { fur: '#ffb6c4', fur2: '#ff8fab', inner: '#ff8fab', nose: null, ear: 'pig', tail: 'curl', snout: { x: 20, y: 8, rx: 8, ry: 8.6, out: true, disc: true }, size: 1.0, brx: 17.5, bry: 18 },
    dog:      { fur: '#f2a64b', fur2: '#fff7e8', inner: '#ffd9b8', nose: '#3b2a20', ear: 'point-s', tail: 'curlup', snout: { x: 16, y: 9, rx: 11.5, ry: 7.6, out: true }, size: 0.97, cheek: true, brow: '#fff7e8', tongue: true },
    cat:      { fur: '#9ca6b9', fur2: '#f1f4f9', inner: '#ffb3c4', nose: '#ff7f9d', ear: 'point', tail: 'catup', snout: { x: 13, y: 9, rx: 10, ry: 7, out: false }, size: 0.95, stripes: '#6c7689', whisker: true },
    panda:    { fur: '#ffffff', fur2: '#ffffff', inner: '#3b3442', nose: '#3b3442', ear: 'round', earCol: '#3b3442', tail: 'stub', snout: { x: 14, y: 9, rx: 10.5, ry: 8, out: false }, size: 1.08, brx: 17.5, bry: 18.5, lw: 8.6, limbCol: '#3b3442', patch: true },
    duck:     { fur: '#ffe35a', fur2: '#ffe35a', inner: '#ffe35a', nose: null, ear: 'none', tail: 'duck', snout: null, size: 0.86, leg: 6, beak: '#ff9a2e', feet: '#ff9a2e', tuft: true }
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
        c.beginPath(); c.moveTo(3, -7); c.quadraticCurveTo(-18, -8, -38, 14); c.quadraticCurveTo(-16, 12, 3, 6); c.closePath(); paint(c, sp.fur);
        break;
      case 'wedge':
        c.beginPath(); c.moveTo(2, -3); c.lineTo(-9, 5); c.lineTo(3, 5); c.closePath(); paint(c, sp.fur);
        break;
      case 'duck':
        c.beginPath(); c.moveTo(2, 4); c.quadraticCurveTo(-8, -2, -11, -12); c.quadraticCurveTo(-3, -8, 4, -6); c.closePath(); paint(c, sp.fur);
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
    ell(c, x, y, r, r); paint(c, sp.earCol || sp.fur);
    if (!sp.earCol) { ell(c, x, y + r * 0.1, r * 0.55, r * 0.55); c.fillStyle = sp.inner; c.fill(); }
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
    var blink = (t % 3.4) < 0.13;
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
  function drawHead(c, sp, R, t) {
    var hrx = 27, hry = 24.5;
    var sn = sp.snout;
    drawEarsBack(c, sp, R);

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
    if (sp.fur2 !== sp.fur && (sp.cheek || sp.earTip)) {          // 여우 · 강아지 : 아래쪽 흰 털
      ell(c, 12, 22, 27, 17); c.fillStyle = sp.fur2; c.fill();
    }
    if (sp.belly && !sp.beak && sn) { ell(c, 14, 20, 20, 14); c.fillStyle = sp.fur2; c.fill(); }   // 캥거루
    if (sp.beak && sp.belly) {                                     // 펭귄 : 하얀 얼굴
      ell(c, 3, 4, 12.5, 14); c.fillStyle = '#fff'; c.fill();
      ell(c, 19, 4, 11, 13.5); c.fill();
      ell(c, 11, 16, 20, 12); c.fill();
    }
    if (sp.stripe) {                                               // 스컹크 : 이마 흰 줄
      c.beginPath(); c.moveTo(10, -3); c.quadraticCurveTo(4, -16, 6, -28); c.lineTo(-16, -28); c.quadraticCurveTo(-6, -14, 5, -3); c.closePath();
      c.fillStyle = '#fff'; c.fill();
    }
    if (sp.spots) {                                                // 치타 점무늬
      c.fillStyle = sp.spots;
      [[-16, -12, 2.6], [-8, -18, 2.3], [-20, -1, 2.4], [-13, 8, 2.2], [1, -19, 2.1], [-21, 10, 2], [-5, -9, 1.8]].forEach(function (p) { ell(c, p[0], p[1], p[2], p[2] * 0.85); c.fill(); });
    }
    if (sp.stripes) {                                              // 고양이 줄무늬
      c.strokeStyle = sp.stripes; c.lineWidth = 2.6; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(4, -24); c.lineTo(5, -15); c.moveTo(-3, -24); c.lineTo(-1, -16); c.moveTo(11, -23); c.lineTo(10, -16);
      c.moveTo(-27, -2); c.lineTo(-18, -1); c.moveTo(-27, 6); c.lineTo(-19, 5);
      c.stroke();
    }
    if (sn && !sn.out) { ell(c, sn.x, sn.y, sn.rx, sn.ry); c.fillStyle = sp.fur2; c.fill(); }
    c.restore();

    if (sn && sn.out) { ell(c, sn.x, sn.y, sn.rx - LW * 0.5, sn.ry - LW * 0.5); c.fillStyle = sp.fur2; c.fill(); }

    // 눈
    var ex1 = 2.5, ex2 = 18, ey = -4.5;
    if (!sn) { ex1 = 3; ex2 = 18.5; ey = -3; }
    if (sp.brow) { ell(c, ex1 + 1, ey - 10, 2.6, 1.9); c.fillStyle = sp.brow; c.fill(); ell(c, ex2, ey - 10, 2.2, 1.7); c.fill(); }
    if (sp.spots) {  // 치타 눈물 자국
      c.beginPath(); c.moveTo(ex1 + 2.5, ey + 5); c.quadraticCurveTo(ex1 + 3, ey + 12, ex1 + 8, ey + 15);
      c.moveTo(ex2 + 1, ey + 5); c.quadraticCurveTo(ex2 + 2, ey + 10, ex2 + 1, ey + 14);
      c.lineWidth = 1.7; c.strokeStyle = '#4a3226'; c.lineCap = 'round'; c.stroke();
    }
    drawEye(c, ex1, ey, 4.5, 6.1, R.eyes, sp, t, false);
    drawEye(c, ex2, ey, 3.8, 5.6, R.eyes, sp, t + 0.0, true);

    // 볼터치
    ell(c, -6.5, 8, 5, 3.2); c.fillStyle = 'rgba(255,120,140,.42)'; c.fill();

    // 코 · 입
    if (sn) {
      var nx = sn.x + sn.rx * 0.55, ny = sn.y - sn.ry * 0.38;
      if (sn.disc) {         // 돼지 코
        ell(c, sn.x + 2.2, sn.y - 1, 2, 2.8); c.fillStyle = '#c9506a'; c.fill();
        ell(c, sn.x + 6.6, sn.y - 1, 1.7, 2.6); c.fill();
        drawMouth(c, sn.x - 4.5, sn.y + sn.ry - 1.5, R.mouth, sp, t);
      } else {
        ell(c, nx, ny, 3.5, 2.7); c.fillStyle = sp.nose; c.fill();
        ell(c, nx + 0.6, ny - 0.9, 1.2, 0.7); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill();
        drawMouth(c, nx - 2.2, ny + 3.2, R.mouth, sp, t);
        if (sp.teeth && (R.mouth === 'smile' || R.mouth === 'flat')) {
          c.beginPath(); c.rect(nx - 4.4, ny + 5.2, 2.3, 3.4); c.rect(nx - 2.1, ny + 5.2, 2.3, 3.4); paint(c, '#fff', 1.1);
        }
      }
      if (sp.whisker) {
        c.beginPath();
        c.moveTo(nx - 9, ny + 3); c.lineTo(nx - 20, ny + 1); c.moveTo(nx - 9, ny + 5.5); c.lineTo(nx - 20, ny + 7);
        c.moveTo(nx + 1, ny + 3.5); c.lineTo(nx + 9, ny + 2); c.moveTo(nx + 1, ny + 5.5); c.lineTo(nx + 9, ny + 7);
        c.lineWidth = 1.1; c.strokeStyle = 'rgba(74,50,38,.65)'; c.stroke();
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
      if (sp.belly) {        // 펭귄 부리
        c.beginPath(); c.moveTo(21, 3); c.quadraticCurveTo(31, 4.5, 34, 7.5); c.quadraticCurveTo(29, 11, 21, 11); c.closePath(); paint(c, sp.beak, 2);
        c.beginPath(); c.moveTo(22, 7.4); c.lineTo(33, 7.5); c.lineWidth = 1.2; c.strokeStyle = OL; c.stroke();
      } else {               // 오리 부리
        var op = (R.mouth === 'open' || R.mouth === 'o') ? 3 : 0;
        c.beginPath(); c.moveTo(18, 3); c.bezierCurveTo(28, 0, 38, 2, 38, 6); c.bezierCurveTo(38, 8, 30, 9, 18, 9); c.closePath(); paint(c, sp.beak, 2);
        c.beginPath(); c.moveTo(18, 9 + op * 0.3); c.bezierCurveTo(26, 9 + op, 34, 9 + op, 35, 8 + op); c.bezierCurveTo(32, 13 + op, 24, 13 + op, 18, 11 + op); c.closePath(); paint(c, shade(sp.beak, -0.12), 2);
        ell(c, 31, 4, 1, 0.8); c.fillStyle = OL; c.fill();
      }
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
    var leg = sp.leg || 10, lw = sp.lw || 7.4, brx = sp.brx || 15.5, bry = sp.bry || 17.5, hr = sp.hr || 1;
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
    var headCx = bodyCx + 7.5, headCy = bodyCy - bry - 24.5 * hr * 0.66;

    function legDraw(a, col, fcol, dx) {
      var hx = -1 + dx, hy = hipY;
      var kx = hx + Math.sin(a[0]) * leg, ky = hy + Math.cos(a[0]) * leg;
      var fx = kx + Math.sin(a[1]) * leg, fy = ky + Math.cos(a[1]) * leg;
      limb(c, [hx, hy, kx, ky, fx, fy], lw, col);
      // 발
      c.save(); c.translate(fx, fy); c.rotate(-a[1] * 0.75);
      var fl = sp.bigFeet ? 9.5 : (sp.feet ? 7.5 : 6.4);
      ell(c, fl * 0.38, 1.2, fl, 3.9); paint(c, fcol);
      c.restore();
    }
    function armDraw(a, col, dx) {
      var al = sp.beak ? 8 : 8.6;
      var ex = shX + dx + Math.sin(a[0]) * al, ey = shY + Math.cos(a[0]) * al;
      var hx = ex + Math.sin(a[1]) * al, hy = ey + Math.cos(a[1]) * al;
      if (sp.beak) {  // 날개 · 지느러미 팔
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
      ell(c, bodyCx, bodyCy, brx, bry); paint(c, sp.belly || sp.fur);
      c.save(); ell(c, bodyCx, bodyCy, brx - LW * 0.5, bry - LW * 0.5); c.clip();
      if (sp.belly && !sp.shell) { c.fillStyle = sp.fur; c.fillRect(bodyCx - brx - 2, bodyCy - bry - 2, brx * 0.9, bry * 2 + 4); }
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
    switch (sp.ear) { case 'long': return 30; case 'tall': return 22; case 'point': return 13; case 'point-s': return 8; case 'pig': return 8; case 'round': return 4; case 'round-s': return 2; }
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
