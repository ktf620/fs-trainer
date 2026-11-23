/* 동물 달리기 1km — 그림 (아이템 · 트랙 위 물건 · 날씨 · 배경 조각) */
(function (root) {
  'use strict';
  var Art = root.Art, OL = Art.OL, TAU = Math.PI * 2, shade = Art.shade;

  function ell(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, TAU); }
  function paint(c, fill, lw, stroke) {
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (lw !== 0) { c.lineWidth = lw || 2.4; c.strokeStyle = stroke || OL; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
  }
  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }
  Art.roundRect = rr;

  // 별
  Art.drawStar = function (c, x, y, r, rot, fill, lw) {
    c.save(); c.translate(x, y); c.rotate(rot || 0);
    c.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.46 : r;
      if (i === 0) c.moveTo(Math.cos(a) * q, Math.sin(a) * q); else c.lineTo(Math.cos(a) * q, Math.sin(a) * q);
    }
    c.closePath(); paint(c, fill || '#ffd23f', lw === undefined ? 2 : lw);
    c.restore();
  };

  // 구름
  Art.drawCloud = function (c, x, y, s, col, lw) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.beginPath();
    c.moveTo(-26, 8); c.bezierCurveTo(-40, 8, -40, -10, -24, -9); c.bezierCurveTo(-22, -24, 0, -26, 4, -13);
    c.bezierCurveTo(14, -22, 30, -14, 26, -3); c.bezierCurveTo(38, -2, 36, 9, 26, 8); c.closePath();
    paint(c, col || '#fff', lw === undefined ? 0 : lw);
    c.restore();
  };

  // 번개 (지그재그)
  Art.drawBolt = function (c, x0, y0, x1, y1, w, seed) {
    var n = 7, pts = [[x0, y0]], i;
    for (i = 1; i < n; i++) {
      var k = i / n, off = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
      off = (off - Math.floor(off) - 0.5) * 2;
      pts.push([x0 + (x1 - x0) * k + off * 26, y0 + (y1 - y0) * k]);
    }
    pts.push([x1, y1]);
    c.lineJoin = 'miter'; c.lineCap = 'round';
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.lineWidth = w + 6; c.strokeStyle = 'rgba(255,240,150,.55)'; c.stroke();
    c.lineWidth = w; c.strokeStyle = '#fff7b0'; c.stroke();
    c.lineWidth = w * 0.4; c.strokeStyle = '#ffffff'; c.stroke();
  };

  // ───────────── 아이템 아이콘 (가운데 x,y · 크기 size) ─────────────
  Art.drawItemIcon = function (c, id, x, y, size) {
    var s = size / 40;
    c.save(); c.translate(x, y); c.scale(s, s);
    c.lineJoin = 'round'; c.lineCap = 'round';
    switch (id) {
      case 'carrot':
        c.save(); c.rotate(0.6);
        c.beginPath(); c.moveTo(-3, -12); c.quadraticCurveTo(-12, -22, -6, -24); c.quadraticCurveTo(-1, -22, 0, -14);
        c.quadraticCurveTo(2, -24, 8, -22); c.quadraticCurveTo(10, -16, 3, -12); c.closePath(); paint(c, '#5cc24a', 2.2);
        c.beginPath(); c.moveTo(-8, -12); c.quadraticCurveTo(0, -17, 8, -12); c.quadraticCurveTo(6, 6, 0, 19); c.quadraticCurveTo(-6, 6, -8, -12); c.closePath(); paint(c, '#ff8f2e', 2.4);
        c.beginPath(); c.moveTo(-5, -3); c.lineTo(-1, -2); c.moveTo(1, 5); c.lineTo(4, 4); c.lineWidth = 1.6; c.strokeStyle = '#d96a12'; c.stroke();
        c.restore();
        break;
      case 'rocket':
        c.save(); c.rotate(0.78);
        c.beginPath(); c.moveTo(-5, 12); c.quadraticCurveTo(0, 26 + 0, 5, 12); c.closePath(); paint(c, '#ffb02e', 2);
        c.beginPath(); c.moveTo(-8, 4); c.lineTo(-15, 14); c.lineTo(-7, 12); c.closePath(); paint(c, '#ff5a5f', 2.2);
        c.beginPath(); c.moveTo(8, 4); c.lineTo(15, 14); c.lineTo(7, 12); c.closePath(); paint(c, '#ff5a5f', 2.2);
        c.beginPath(); c.moveTo(0, -22); c.bezierCurveTo(11, -12, 10, 4, 7, 13); c.lineTo(-7, 13); c.bezierCurveTo(-10, 4, -11, -12, 0, -22); c.closePath(); paint(c, '#f4f7fb', 2.4);
        c.save(); c.clip(); c.fillStyle = '#ff5a5f'; c.fillRect(-12, -24, 24, 10); c.restore();
        ell(c, 0, -3, 4.2, 4.2); paint(c, '#7fd0ff', 2);
        c.restore();
        break;
      case 'banana':
        c.beginPath(); c.moveTo(-15, -6); c.quadraticCurveTo(-8, 14, 14, 8); c.quadraticCurveTo(18, 6, 16, 2);
        c.quadraticCurveTo(0, 6, -9, -9); c.closePath(); paint(c, '#ffd93b', 2.4);
        c.beginPath(); c.moveTo(-15, -6); c.lineTo(-13, -11); c.lineTo(-9, -9); paint(c, '#8a5a2b', 2);
        c.beginPath(); c.moveTo(-8, 2); c.quadraticCurveTo(0, 9, 11, 6); c.lineWidth = 1.5; c.strokeStyle = '#e0a800'; c.stroke();
        break;
      case 'pie':
        ell(c, 0, 8, 17, 6.5); paint(c, '#e0a25a', 2.4);
        c.beginPath(); c.moveTo(-14, 6); c.bezierCurveTo(-16, -8, -4, -6, -3, -11); c.bezierCurveTo(-2, -18, 8, -14, 7, -8);
        c.bezierCurveTo(16, -8, 16, 2, 14, 6); c.closePath(); paint(c, '#fffaf0', 2.4);
        ell(c, 1, -13, 4, 4); paint(c, '#ff4d5e', 2);
        c.beginPath(); c.moveTo(-8, 0); c.quadraticCurveTo(-4, 3, 0, 0); c.moveTo(3, -2); c.quadraticCurveTo(7, 1, 10, -2); c.lineWidth = 1.4; c.strokeStyle = '#e8d9c0'; c.stroke();
        break;
      case 'shield':
        ell(c, 0, 0, 16, 16); c.fillStyle = 'rgba(140,220,255,.55)'; c.fill(); c.lineWidth = 2.4; c.strokeStyle = '#3aa0e0'; c.stroke();
        ell(c, -6, -7, 5, 3, -0.6); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill();
        ell(c, 7, 8, 2.2, 1.4, -0.6); c.fill();
        break;
      case 'bolt':
        Art.drawCloud(c, 0, -6, 0.52, '#6b7890', 2.2);
        c.beginPath(); c.moveTo(2, -2); c.lineTo(-7, 9); c.lineTo(-1, 9); c.lineTo(-4, 20); c.lineTo(8, 5); c.lineTo(2, 5); c.lineTo(6, -2); c.closePath(); paint(c, '#ffd93b', 2.2);
        break;
      case 'magnet':
        c.save(); c.rotate(-0.5);
        c.beginPath(); c.moveTo(-13, -14); c.lineTo(-13, 2); c.arc(0, 2, 13, Math.PI, 0, true); c.lineTo(13, -14); c.lineTo(5, -14); c.lineTo(5, 2); c.arc(0, 2, 5, 0, Math.PI, false); c.lineTo(-5, -14); c.closePath(); paint(c, '#ff4d5e', 2.4);
        c.beginPath(); c.rect(-13, -14, 8, 6); paint(c, '#e8eef5', 2.2);
        c.beginPath(); c.rect(5, -14, 8, 6); paint(c, '#e8eef5', 2.2);
        c.restore();
        break;
      case 'swap':
        ell(c, 0, 0, 16, 16); paint(c, '#b98cff', 2.4);
        c.strokeStyle = '#fff'; c.lineWidth = 3;
        c.beginPath(); c.arc(0, 0, 8.5, -2.6, -0.4); c.stroke();
        c.beginPath(); c.arc(0, 0, 8.5, 0.55, 2.75); c.stroke();
        c.fillStyle = '#fff';
        c.beginPath(); c.moveTo(11.5, -5.5); c.lineTo(5, -4); c.lineTo(9.5, 1); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(-11.5, 5.5); c.lineTo(-5, 4); c.lineTo(-9.5, -1); c.closePath(); c.fill();
        break;
      case 'mega':
        c.beginPath(); c.moveTo(-12, -4); c.lineTo(6, -13); c.lineTo(6, 13); c.lineTo(-12, 4); c.closePath(); paint(c, '#ff9f1c', 2.4);
        c.beginPath(); c.rect(-17, -4, 6, 8); paint(c, '#fff', 2.2);
        c.beginPath(); c.moveTo(-8, 5); c.lineTo(-6, 13); c.lineTo(-1, 13); c.lineTo(-3, 7); paint(c, '#fff', 2.2);
        c.beginPath(); c.arc(8, 0, 6, -0.9, 0.9); c.moveTo(8 + 11 * Math.cos(-0.9), 11 * Math.sin(-0.9)); c.arc(8, 0, 11, -0.9, 0.9);
        c.lineWidth = 2.4; c.strokeStyle = '#ff5a5f'; c.stroke();
        break;
      case 'mush':
        c.beginPath(); rr(c, -6, 0, 12, 15, 5); paint(c, '#fff4dc', 2.4);
        c.beginPath(); c.moveTo(-17, 3); c.bezierCurveTo(-18, -20, 18, -20, 17, 3); c.quadraticCurveTo(0, 8, -17, 3); c.closePath(); paint(c, '#ff4d5e', 2.4);
        ell(c, -7, -6, 4, 3.4); c.fillStyle = '#fff'; c.fill(); ell(c, 6, -9, 3.4, 3); c.fill(); ell(c, 10, 0, 2.4, 2); c.fill();
        ell(c, -3, 6, 1.1, 1.6); c.fillStyle = OL; c.fill(); ell(c, 3, 6, 1.1, 1.6); c.fill();
        break;
      case 'lullaby':
        c.beginPath(); c.moveTo(-6, 12); c.lineTo(-6, -12); c.lineTo(10, -16); c.lineTo(10, 8); c.lineWidth = 3 + 4; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3; c.strokeStyle = '#6aa9ff'; c.stroke();
        ell(c, -10, 12, 5.5, 4.4, -0.3); paint(c, '#6aa9ff', 2.2);
        ell(c, 6, 8, 5.5, 4.4, -0.3); paint(c, '#6aa9ff', 2.2);
        c.fillStyle = OL; c.font = '800 11px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('z', 15, -14); c.font = '800 8px sans-serif'; c.fillText('z', 20, -19);
        break;
      case 'tornado':
        var cols = ['#aebfd6', '#bccbe0', '#cbd7e8', '#dbe4f0'];
        for (var i = 3; i >= 0; i--) { ell(c, (i % 2 ? 1.5 : -1.5), 14 - i * 9, 5 + i * 4.2, 4.6); paint(c, cols[i], 2.2); }
        break;
    }
    c.restore();
  };

  // 아이템 상자
  Art.drawItemBox = function (c, x, y, size, t) {
    var s = size / 40;
    c.save(); c.translate(x, y - (10 + Math.sin(t * 4) * 4) * s); c.scale(s, s); c.rotate(Math.sin(t * 2.6) * 0.12);
    rr(c, -15, -15, 30, 30, 7); paint(c, '#ffd23f', 2.6);
    c.save(); rr(c, -15, -15, 30, 30, 7); c.clip();
    c.fillStyle = '#ff9f1c'; c.fillRect(-4, -16, 8, 32); c.fillRect(-16, -4, 32, 8);
    c.restore();
    rr(c, -15, -15, 30, 30, 7); paint(c, null, 2.6);
    ell(c, 0, 0, 9, 9); paint(c, '#fff', 2);
    c.fillStyle = '#ff5a5f'; c.font = '900 15px "Jua", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('?', 0, 1);
    c.restore();
  };

  // 바나나 껍질 (바닥)
  Art.drawPeel = function (c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.beginPath(); c.moveTo(0, -8); c.quadraticCurveTo(-12, -6, -16, 2); c.quadraticCurveTo(-8, -1, -2, 0);
    c.quadraticCurveTo(0, 5, -3, 8); c.quadraticCurveTo(5, 4, 4, 0); c.quadraticCurveTo(10, -1, 16, 3); c.quadraticCurveTo(13, -7, 0, -8); c.closePath(); paint(c, '#ffd93b', 2.2);
    c.beginPath(); c.rect(-1.5, -12, 3, 5); paint(c, '#8a5a2b', 1.6);
    c.restore();
  };

  // 두더지 (up 0~1 : 올라온 정도)
  Art.drawMole = function (c, x, y, s, up, squash) {
    c.save(); c.translate(x, y); c.scale(s, s);
    ell(c, 0, 0, 17, 5.5); paint(c, '#6b4a2f', 2.2);
    if (squash) {
      ell(c, 0, -2, 13, 3.5); paint(c, '#8b6b52', 2.2);
      Art.drawStar(c, -10, -12, 4, 0.3, '#ffd23f', 1.4); Art.drawStar(c, 9, -14, 3.4, 0.9, '#ffd23f', 1.4);
    } else {
      c.save(); c.beginPath(); c.rect(-22, -44, 44, 44); c.clip();
      var h = 22 * up;
      c.translate(0, 22 - h);
      c.beginPath(); c.moveTo(-11, 2); c.lineTo(-11, -12); c.arc(0, -12, 11, Math.PI, 0); c.lineTo(11, 2); c.closePath(); paint(c, '#8b6b52', 2.4);
      ell(c, 0, -9, 5.5, 4); c.fillStyle = '#f4c9b0'; c.fill();
      ell(c, 0, -11, 2.6, 2); c.fillStyle = '#ff7f9d'; c.fill();
      ell(c, -5, -15, 1.4, 1.8); c.fillStyle = '#2b2018'; c.fill(); ell(c, 5, -15, 1.4, 1.8); c.fill();
      c.fillStyle = '#ffd23f'; c.beginPath(); c.moveTo(-12, -19); c.arc(0, -19, 12, Math.PI, 0); c.closePath(); c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
      c.beginPath(); c.rect(-13, -20, 26, 3); paint(c, '#ffb02e', 1.6);
      c.restore();
    }
    ell(c, -13, 1, 5, 2.5); paint(c, '#7d5a3c', 1.8); ell(c, 13, 1, 5, 2.5); paint(c, '#7d5a3c', 1.8);
    c.restore();
  };

  // 허들 (broken : 넘어진 정도 0~1)
  Art.drawHurdle = function (c, x, y, s, broken) {
    c.save(); c.translate(x, y); c.scale(s, s);
    if (broken) { c.translate(8, 0); c.rotate(1.25 * broken); }
    c.lineCap = 'round';
    c.beginPath(); c.moveTo(-3, 0); c.lineTo(-3, -24); c.moveTo(3, 0); c.lineTo(3, -24); c.lineWidth = 6; c.strokeStyle = OL; c.stroke();
    c.lineWidth = 2.6; c.strokeStyle = '#e8eef5'; c.stroke();
    c.beginPath(); rr(c, -6, -30, 12, 8, 2.5); paint(c, '#fff', 2.2);
    c.save(); rr(c, -6, -30, 12, 8, 2.5); c.clip(); c.fillStyle = '#ff5a5f'; c.fillRect(-6, -30, 4, 8); c.fillRect(2, -30, 4, 8); c.restore();
    c.beginPath(); c.moveTo(-7, 0); c.lineTo(7, 0); c.lineWidth = 5.5; c.strokeStyle = OL; c.stroke(); c.lineWidth = 2.4; c.strokeStyle = '#9aa7b8'; c.stroke();
    c.restore();
  };

  // UFO
  Art.drawUFO = function (c, x, y, s, t) {
    c.save(); c.translate(x, y); c.scale(s, s); c.rotate(Math.sin(t * 3) * 0.06);
    c.beginPath(); c.arc(0, -6, 14, Math.PI, 0); c.closePath(); c.fillStyle = 'rgba(160,230,255,.85)'; c.fill(); c.lineWidth = 2.4; c.strokeStyle = OL; c.stroke();
    ell(c, -5, -12, 3, 4, -0.5); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill();
    ell(c, 0, -2, 32, 10); paint(c, '#b8c4d6', 2.6);
    ell(c, 0, -4, 22, 5); c.fillStyle = '#d9e2ee'; c.fill();
    var cols = ['#ffd23f', '#ff5a5f', '#3ecf8e', '#4d8df0', '#ffd23f'];
    for (var i = 0; i < 5; i++) { ell(c, -22 + i * 11, 2 - Math.abs(i - 2) * 1.6 + 2, 2.6, 2.6); c.fillStyle = (Math.floor(t * 6) + i) % 2 ? cols[i] : '#fff'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = OL; c.stroke(); }
    c.restore();
  };
  // UFO 빛줄기
  Art.drawBeam = function (c, x, y0, y1, w, t) {
    var g = c.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, 'rgba(190,255,220,.75)'); g.addColorStop(1, 'rgba(190,255,220,.12)');
    c.beginPath(); c.moveTo(x - w * 0.25, y0); c.lineTo(x + w * 0.25, y0); c.lineTo(x + w, y1); c.lineTo(x - w, y1); c.closePath();
    c.fillStyle = g; c.fill();
  };

  // 벌
  Art.drawBee = function (c, x, y, s, t) {
    c.save(); c.translate(x, y); c.scale(s, s);
    var f = Math.sin(t * 50);
    ell(c, -1, -7, 4.5, 7, -0.5 + f * 0.3); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill(); c.lineWidth = 1; c.strokeStyle = OL; c.stroke();
    ell(c, 3, -7, 4.5, 7, 0.5 - f * 0.3); c.fill(); c.stroke();
    ell(c, 0, 0, 8, 6); paint(c, '#ffd23f', 1.8);
    c.save(); ell(c, 0, 0, 8, 6); c.clip(); c.fillStyle = '#3b2a20'; c.fillRect(-3, -7, 2.6, 14); c.fillRect(1.6, -7, 2.6, 14); c.restore();
    ell(c, 6, -1, 1, 1.3); c.fillStyle = '#2b2018'; c.fill();
    c.beginPath(); c.moveTo(-8, 0); c.lineTo(-11, 0); c.lineWidth = 1.6; c.strokeStyle = OL; c.stroke();
    c.restore();
  };

  // 회오리
  Art.drawTornado = function (c, x, y, s, t) {
    c.save(); c.translate(x, y); c.scale(s, s);
    var cols = ['#9fb2cc', '#b3c3d9', '#c6d3e5', '#d9e3f0', '#eaf0f8'];
    for (var i = 0; i < 5; i++) {
      var w = 6 + i * 6.5, ox = Math.sin(t * 9 + i * 0.9) * (3 + i);
      ell(c, ox, -i * 12, w, 6.5); paint(c, cols[i], 2.2);
    }
    c.restore();
  };

  // 신발 (신발 끈 돌발 상황)
  function shoe(c) {
    c.beginPath(); c.moveTo(-16, 6); c.lineTo(-16, -8); c.quadraticCurveTo(-8, -10, -4, -4); c.quadraticCurveTo(6, -2, 14, 0); c.quadraticCurveTo(19, 2, 17, 8); c.closePath(); paint(c, '#4d8df0', 2.4);
    c.beginPath(); rr(c, -17, 6, 35, 5, 2); paint(c, '#fff', 2.2);
    c.beginPath(); c.moveTo(-2, -3); c.lineTo(3, -7); c.moveTo(3, -1.5); c.lineTo(8, -5); c.lineWidth = 2; c.strokeStyle = '#fff'; c.stroke();
    c.beginPath(); c.moveTo(4, -7); c.quadraticCurveTo(12, -16, 16, -9); c.lineWidth = 1.8; c.strokeStyle = OL; c.stroke();
  }
  function drop(c, x, y, r, col) {
    c.beginPath(); c.moveTo(x, y - r * 1.5); c.bezierCurveTo(x + r * 1.2, y - r * 0.2, x + r, y + r, x, y + r); c.bezierCurveTo(x - r, y + r, x - r * 1.2, y - r * 0.2, x, y - r * 1.5); c.closePath();
    paint(c, col || '#6ec6ff', 1.8);
  }
  Art.drawDrop = drop;

  // 돌발 상황 아이콘
  Art.drawEventIcon = function (c, id, x, y, size, t) {
    var s = size / 40;
    c.save(); c.translate(x, y);
    switch (id) {
      case 'bees': Art.drawBee(c, -7 * s, 2 * s, s * 1.5, t); Art.drawBee(c, 10 * s, -8 * s, s * 1.1, t + 0.3); break;
      case 'moles': Art.drawMole(c, 0, 14 * s, s * 1.15, 1); break;
      case 'snack': Art.drawItemIcon(c, 'carrot', 0, 0, size); break;
      case 'crowd': Art.drawItemIcon(c, 'mega', 0, 0, size); break;
      case 'ufo': Art.drawUFO(c, 0, 5 * s, s * 0.62, t); break;
      case 'hurdles': Art.drawHurdle(c, 0, 16 * s, s * 1.15, 0); break;
      case 'slick': c.scale(s, s); drop(c, -6, 2, 9, '#8fd8ff'); drop(c, 9, -4, 6, '#b8e8ff'); break;
      case 'star': Art.drawStar(c, 0, 0, 17 * s, Math.sin(t * 3) * 0.2, '#ffd23f', 2.4 * s); break;
      case 'lace': c.scale(s, s); shoe(c); break;
      default:
        if (id.indexOf('wx_') === 0) Art.drawWeatherIcon(c, id.slice(3), 0, 0, size, t);
    }
    c.restore();
  };

  // 날씨 아이콘
  Art.drawWeatherIcon = function (c, id, x, y, size, t) {
    var s = size / 40, i;
    c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = 'round';
    function sun(cx, cy, r, col) {
      c.save(); c.translate(cx, cy); c.rotate(t * 0.6);
      c.strokeStyle = col; c.lineWidth = 3;
      for (var k = 0; k < 8; k++) { c.rotate(TAU / 8); c.beginPath(); c.moveTo(0, -r - 3); c.lineTo(0, -r - 8); c.stroke(); }
      c.restore();
      ell(c, cx, cy, r, r); paint(c, col, 2.2);
    }
    switch (id) {
      case 'sunny': sun(0, 0, 10, '#ffc93b'); break;
      case 'rain':
        Art.drawCloud(c, 0, -5, 0.55, '#9fb2cc', 2.2);
        for (i = 0; i < 3; i++) drop(c, -9 + i * 9, 13 + ((t * 20 + i * 5) % 6), 2.6, '#5db8ff');
        break;
      case 'snow':
        Art.drawCloud(c, 0, -5, 0.55, '#e6eef8', 2.2);
        for (i = 0; i < 3; i++) Art.drawStar(c, -9 + i * 9, 13 + ((t * 9 + i * 4) % 5), 3.4, t + i, '#fff', 1.4);
        break;
      case 'wind':
        c.strokeStyle = '#7fa3c7'; c.lineWidth = 3.4;
        c.beginPath(); c.moveTo(-16, -6); c.lineTo(4, -6); c.arc(4, -11, 5, Math.PI / 2, -Math.PI * 0.8, true); c.stroke();
        c.beginPath(); c.moveTo(-16, 2); c.lineTo(10, 2); c.arc(10, 7, 5, -Math.PI / 2, Math.PI * 0.8); c.stroke();
        c.beginPath(); c.moveTo(-10, 10); c.lineTo(-1, 10); c.stroke();
        break;
      case 'heat':
        sun(-3, -2, 10, '#ff7a2e');
        c.beginPath(); rr(c, 9, -12, 7, 20, 3.5); paint(c, '#fff', 2);
        ell(c, 12.5, 10, 5.5, 5.5); paint(c, '#ff4d5e', 2);
        c.beginPath(); c.moveTo(12.5, 8); c.lineTo(12.5, -6); c.lineWidth = 3; c.strokeStyle = '#ff4d5e'; c.stroke();
        break;
      case 'fog':
        c.strokeStyle = '#a9b8c9'; c.lineWidth = 4.2;
        for (i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-15 + (i % 2) * 5, -10 + i * 7); c.lineTo(11 + (i % 2) * 5, -10 + i * 7); c.stroke(); }
        break;
      case 'storm':
        Art.drawCloud(c, 0, -6, 0.58, '#5f6b82', 2.2);
        c.beginPath(); c.moveTo(2, 0); c.lineTo(-6, 10); c.lineTo(-1, 10); c.lineTo(-4, 19); c.lineTo(7, 6); c.lineTo(2, 6); c.lineTo(5, 0); c.closePath(); paint(c, '#ffd93b', 2);
        break;
    }
    c.restore();
  };

  // ───────────── 배경 조각 ─────────────
  Art.drawTree = function (c, x, y, s, col) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.beginPath(); rr(c, -4, -18, 8, 20, 3); paint(c, '#9a6a3c', 2.4);
    ell(c, 0, -34, 20, 20); paint(c, col || '#5cc26b', 2.4);
    ell(c, -13, -24, 11, 10); c.fillStyle = col || '#5cc26b'; c.fill(); ell(c, 13, -24, 11, 10); c.fill();
    c.beginPath(); c.arc(-13, -24, 11, Math.PI * 0.35, Math.PI * 1.35); c.lineWidth = 2.4; c.strokeStyle = OL; c.stroke();
    c.beginPath(); c.arc(13, -24, 11, -Math.PI * 0.35, Math.PI * 0.65); c.stroke();
    ell(c, -6, -40, 6, 4, -0.5); c.fillStyle = 'rgba(255,255,255,.22)'; c.fill();
    c.restore();
  };

  // 관중 한 명 (동그란 머리)
  var CROWD_COLS = ['#ff8fa3', '#ffd23f', '#8fd46b', '#7fb7ff', '#c79bff', '#ffb26b', '#fff4e3', '#a9bcd3', '#ff9f1c', '#b07a45'];
  Art.drawFan = function (c, x, y, r, k, t, excite) {
    var col = CROWD_COLS[k % CROWD_COLS.length];
    var hop = excite ? Math.abs(Math.sin(t * 9 + k * 1.7)) * r * 0.7 : Math.abs(Math.sin(t * 2.4 + k * 1.7)) * r * 0.16;
    ell(c, x, y - hop, r, r * 0.95); c.fillStyle = col; c.fill(); c.lineWidth = 1.4; c.strokeStyle = 'rgba(74,50,38,.75)'; c.stroke();
    // 귀
    if (k % 3 === 0) { ell(c, x - r * 0.7, y - hop - r * 0.75, r * 0.34, r * 0.34); c.fill(); c.stroke(); ell(c, x + r * 0.7, y - hop - r * 0.75, r * 0.34, r * 0.34); c.fill(); c.stroke(); }
    else if (k % 3 === 1) {
      c.beginPath(); c.moveTo(x - r * 0.9, y - hop - r * 0.4); c.lineTo(x - r * 0.7, y - hop - r * 1.4); c.lineTo(x - r * 0.2, y - hop - r * 0.85); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(x + r * 0.9, y - hop - r * 0.4); c.lineTo(x + r * 0.7, y - hop - r * 1.4); c.lineTo(x + r * 0.2, y - hop - r * 0.85); c.closePath(); c.fill(); c.stroke();
    }
    c.fillStyle = '#2b2018';
    ell(c, x - r * 0.3, y - hop - r * 0.05, r * 0.11, r * 0.15); c.fill();
    ell(c, x + r * 0.3, y - hop - r * 0.05, r * 0.11, r * 0.15); c.fill();
  };

  // 시상대
  Art.drawPodium = function (c, x, y, w, h, n, col) {
    rr(c, x - w / 2, y - h, w, h + 6, 8); paint(c, col, 3);
    c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x - w / 2 + 4, y - h + 4, w - 8, 8);
    c.fillStyle = '#fff'; c.font = '900 ' + Math.round(Math.min(h * 0.6, w * 0.42)) + 'px "Jua", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = 5; c.strokeStyle = OL; c.strokeText(String(n), x, y - h / 2 + 4); c.fillText(String(n), x, y - h / 2 + 4);
  };
})(typeof window !== 'undefined' ? window : globalThis);
