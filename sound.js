// sound.js - Lightweight Web Audio synthesizer for GitQuest
(function(){
  let ctx = null;
  function getCtx() {
    if (!ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(function(){});
    }
    return ctx;
  }

  function getSettings() {
    try {
      const gq = JSON.parse(localStorage.getItem("gq")) || {};
      return {
        unlocked: !!gq.soundUnlocked,
        enabled: gq.soundEnabled !== false
      };
    } catch(e) {
      return { unlocked: false, enabled: false };
    }
  }

  window.playGQSound = function(type, force) {
    const s = getSettings();
    if (!force && (!s.unlocked || !s.enabled)) return;
    const ac = getCtx();
    if (!ac) return;

    const t = ac.currentTime;
    if (type === 'key') {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.02);
      gain.gain.setValueAtTime(0.03, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.025);
    } else if (type === 'cmd') {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(520, t + 0.04);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    } else if (type === 'success') {
      [523.25, 659.25].forEach((freq, idx) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);
        gain.gain.setValueAtTime(0, t);
        gain.gain.setValueAtTime(0.08, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.16);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.18);
      });
    } else if (type === 'error') {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.linearRampToValueAtTime(90, t + 0.14);
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } else if (type === 'win') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);
        gain.gain.setValueAtTime(0, t);
        gain.gain.setValueAtTime(0.1, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.24);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.26);
      });
    }
  };
})();
