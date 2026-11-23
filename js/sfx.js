/* 동물 달리기 1km — 소리 (Web Audio 로 직접 만든 효과음과 배경 음악, 소리 파일 없음) */
(function (root) {
  'use strict';
  var Sfx = { on: true, ctx: null, master: null, lastAt: {}, bgm: null };

  function ensure() {
    if (Sfx.ctx) return Sfx.ctx;
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    try {
      Sfx.ctx = new AC();
      Sfx.master = Sfx.ctx.createGain();
      Sfx.master.gain.value = 0.5;
      Sfx.master.connect(Sfx.ctx.destination);
    } catch (e) { Sfx.ctx = null; }
    return Sfx.ctx;
  }
  Sfx.unlock = function () {
    var c = ensure();
    if (c && c.state === 'suspended') { try { c.resume(); } catch (e) { /* 무시 */ } }
  };
  Sfx.setOn = function (v) {
    Sfx.on = !!v;
    if (!Sfx.on) Sfx.stopBgm();
  };

  // 음 하나 : type 파형, f0→f1 주파수, d 길이, v 크기, at 시작 지연
  function tone(type, f0, f1, d, v, at) {
    var c = Sfx.ctx, t = c.currentTime + (at || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(Sfx.master);
    o.start(t); o.stop(t + d + 0.03);
  }
  var noiseBuf = null;
  function noise(d, v, freq, q, at, sweepTo) {
    var c = Sfx.ctx, t = c.currentTime + (at || 0);
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
      var ch = noiseBuf.getChannelData(0);
      for (var i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    }
    var s = c.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(freq, t); f.Q.value = q || 1;
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + d);
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f); f.connect(g); g.connect(Sfx.master);
    s.start(t); s.stop(t + d + 0.03);
  }

  var SOUNDS = {
    beep: function () { tone('square', 660, 660, 0.14, 0.12); },
    go: function () { tone('square', 990, 990, 0.42, 0.14); tone('triangle', 1320, 1320, 0.42, 0.1); },
    click: function () { tone('triangle', 720, 900, 0.07, 0.1); },
    item: function () { tone('triangle', 880, 1320, 0.09, 0.11); tone('triangle', 1320, 1760, 0.12, 0.1, 0.08); },
    boost: function () { tone('sawtooth', 300, 900, 0.22, 0.07); },
    rocket: function () { noise(0.5, 0.16, 500, 0.8, 0, 3000); tone('sawtooth', 200, 1200, 0.45, 0.05); },
    skill: function () { tone('square', 523, 523, 0.07, 0.08); tone('square', 784, 784, 0.07, 0.08, 0.07); tone('square', 1046, 1046, 0.14, 0.08, 0.14); },
    throw: function () { noise(0.16, 0.1, 1200, 2, 0, 400); },
    slip: function () { tone('sine', 900, 200, 0.3, 0.12); },
    trip: function () { tone('triangle', 240, 80, 0.2, 0.16); noise(0.12, 0.1, 300, 1); },
    block: function () { tone('triangle', 1400, 1900, 0.1, 0.1); tone('sine', 2200, 2200, 0.12, 0.05, 0.05); },
    shield: function () { tone('sine', 600, 1200, 0.25, 0.09); },
    thunder: function () { noise(0.7, 0.3, 180, 0.6, 0, 60); tone('sawtooth', 110, 40, 0.5, 0.12); },
    swap: function () { tone('sine', 400, 1600, 0.18, 0.09); tone('sine', 1600, 400, 0.18, 0.09, 0.16); },
    cheer: function () { noise(0.8, 0.09, 1800, 0.5); tone('triangle', 784, 784, 0.1, 0.06, 0.05); tone('triangle', 988, 988, 0.1, 0.06, 0.17); tone('triangle', 1175, 1175, 0.2, 0.06, 0.29); },
    grow: function () { tone('square', 200, 600, 0.35, 0.08); },
    lullaby: function () { tone('sine', 784, 784, 0.22, 0.09); tone('sine', 659, 659, 0.22, 0.09, 0.22); tone('sine', 523, 523, 0.36, 0.09, 0.44); },
    wind: function () { noise(0.9, 0.12, 500, 0.7, 0, 1500); },
    weather: function () { tone('sine', 523, 523, 0.18, 0.09); tone('sine', 659, 659, 0.18, 0.09, 0.15); tone('sine', 784, 784, 0.3, 0.09, 0.3); },
    bees: function () { tone('sawtooth', 220, 240, 0.5, 0.05); tone('sawtooth', 233, 215, 0.5, 0.05); },
    pop: function () { tone('sine', 300, 900, 0.09, 0.14); },
    ufo: function () { tone('sine', 500, 1100, 0.25, 0.08); tone('sine', 1100, 500, 0.25, 0.08, 0.25); tone('sine', 500, 1100, 0.25, 0.08, 0.5); },
    star: function () { for (var i = 0; i < 5; i++) tone('triangle', 880 * Math.pow(1.19, i), 0, 0.1, 0.08, i * 0.06); },
    crash: function () { noise(0.25, 0.22, 900, 0.5, 0, 200); },
    hop: function () { tone('sine', 400, 800, 0.12, 0.09); },
    magnet: function () { tone('sawtooth', 150, 400, 0.4, 0.05); },
    ult: function () { tone('sawtooth', 220, 880, 0.35, 0.08); tone('square', 440, 440, 0.08, 0.09, 0.3); tone('square', 660, 660, 0.08, 0.09, 0.38); tone('square', 880, 1320, 0.3, 0.1, 0.46); noise(0.5, 0.12, 800, 0.6, 0.3, 4000); },
    goal: function () { tone('triangle', 784, 784, 0.1, 0.09); tone('triangle', 1046, 1046, 0.18, 0.09, 0.1); },
    win: function () {
      var n = [523, 659, 784, 1046, 784, 1046, 1318];
      var at = [0, 0.12, 0.24, 0.36, 0.54, 0.66, 0.78];
      for (var i = 0; i < n.length; i++) { tone('square', n[i], n[i], i === 6 ? 0.5 : 0.11, 0.09, at[i]); tone('triangle', n[i] / 2, n[i] / 2, i === 6 ? 0.5 : 0.11, 0.09, at[i]); }
      noise(1.4, 0.1, 2000, 0.4, 0.1);
    }
  };

  Sfx.play = function (id) {
    if (!Sfx.on) return;
    var c = ensure();
    if (!c || c.state !== 'running') return;
    var now = c.currentTime;
    if (Sfx.lastAt[id] && now - Sfx.lastAt[id] < 0.09) return;   // 같은 소리가 겹치지 않게
    Sfx.lastAt[id] = now;
    var f = SOUNDS[id];
    if (f) { try { f(); } catch (e) { /* 무시 */ } }
  };

  // 배경 음악 : 통통 튀는 8마디 반복
  var BPM = 152;
  var CHORDS = [[262, 330, 392], [262, 330, 392], [349, 440, 523], [349, 440, 523], [392, 494, 587], [392, 494, 587], [262, 330, 392], [392, 494, 587]];
  var LEAD = [[0, 2, 1, 2], [2, 1, 2, 1], [0, 2, 1, 2], [2, 1, 0, 1], [0, 2, 1, 2], [2, 1, 2, 1], [2, 1, 0, 1], [0, 1, 2, 2]];
  Sfx.startBgm = function (rate) {
    if (!Sfx.on) return;
    var c = ensure();
    if (!c || Sfx.bgm) return;
    var st = { bar: 0, next: c.currentTime + 0.1, timer: null, rate: rate || 1 };
    Sfx.bgm = st;
    function sched() {
      if (!Sfx.bgm || !Sfx.on) return;
      var beat = 60 / (BPM * st.rate);
      while (st.next < c.currentTime + 0.4) {
        var ch = CHORDS[st.bar % 8], ld = LEAD[st.bar % 8], t0 = st.next - c.currentTime;
        for (var b = 0; b < 4; b++) {
          tone('triangle', ch[0] / 2, ch[0] / 2, beat * 0.5, b % 2 ? 0.035 : 0.06, t0 + b * beat);
          tone('square', ch[ld[b]] * 2, ch[ld[b]] * 2, beat * 0.28, 0.018, t0 + b * beat);
          tone('square', ch[(ld[b] + 1) % 3] * 2, ch[(ld[b] + 1) % 3] * 2, beat * 0.22, 0.014, t0 + b * beat + beat * 0.5);
          noise(0.04, b % 2 ? 0.035 : 0.015, 6000, 1, t0 + b * beat + beat * 0.5);
        }
        st.next += beat * 4;
        st.bar++;
      }
      st.timer = setTimeout(sched, 120);
    }
    sched();
  };
  Sfx.stopBgm = function () {
    if (Sfx.bgm) { clearTimeout(Sfx.bgm.timer); Sfx.bgm = null; }
  };
  Sfx.setBgmRate = function (r) { if (Sfx.bgm) Sfx.bgm.rate = r; };

  root.Sfx = Sfx;
})(window);
