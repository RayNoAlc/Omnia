// Procedural Reactive Background Music (BGM) Engine for Omnia
// Generates infinite, lush, non-repetitive ambient generative soundscapes using Web Audio API.
// Seamlessly adapts key, chords, filter resonance, and texture to the active tab and user actions.

const TAB_SOUNDSCAPES = {
  hoje: {
    name: "Serenidade Matinal",
    subtitle: "Clareza e Motivação",
    root: 130.81, // C3
    // Cmaj7 -> Fmaj7 -> Gsus4 -> Am7
    chords: [
      [130.81, 164.81, 196.00, 246.94], // C3, E3, G3, B3
      [174.61, 220.00, 261.63, 329.63], // F3, A3, C4, E4
      [196.00, 261.63, 293.66, 392.00], // G3, C4, D4, G4
      [220.00, 261.63, 329.63, 392.00], // A3, C4, E4, G4
    ],
    cutoff: 420,
    tempoSec: 8.5,
    pulseSpeed: 0,
    binauralDiff: 0,
  },
  foco: {
    name: "Foco Profundo",
    subtitle: "Ondas Theta & Concentração",
    root: 146.83, // D3
    // Dm9 -> Am7 -> Bbmaj7 -> Dm
    chords: [
      [146.83, 174.61, 220.00, 261.63, 329.63], // D3, F3, A3, C4, E4
      [110.00, 164.81, 220.00, 261.63],         // A2, E3, A3, C4
      [116.54, 174.61, 233.08, 293.66],         // Bb2, F3, Bb3, D4
      [146.83, 220.00, 293.66, 349.23],         // D3, A3, D4, F4
    ],
    cutoff: 280,
    tempoSec: 10.0,
    pulseSpeed: 1.2,
    binauralDiff: 7.5, // 7.5 Hz Theta wave binaural beat
  },
  agenda: {
    name: "Fluxo Tranquilo",
    subtitle: "Organização e Equilíbrio",
    root: 116.54, // Bb2
    // Bbmaj7 -> Gm7 -> Ebmaj7 -> Fsus4
    chords: [
      [116.54, 174.61, 233.08, 293.66], // Bb2, F3, Bb3, D4
      [98.00,  146.83, 196.00, 233.08], // G2, D3, G3, Bb3
      [155.56, 196.00, 233.08, 293.66], // Eb3, G3, Bb3, D4
      [174.61, 220.00, 293.66, 349.23], // F3, A3, D4, F4
    ],
    cutoff: 380,
    tempoSec: 7.5,
    pulseSpeed: 0,
    binauralDiff: 0,
  },
  rotina: {
    name: "Rotina Consciente",
    subtitle: "Constância e Ritmo",
    root: 116.54,
    chords: [
      [116.54, 174.61, 233.08, 293.66],
      [155.56, 196.00, 233.08, 293.66],
      [98.00,  146.83, 196.00, 233.08],
      [130.81, 196.00, 261.63, 329.63],
    ],
    cutoff: 360,
    tempoSec: 8.0,
    pulseSpeed: 0,
    binauralDiff: 0,
  },
  biblioteca: {
    name: "Santuário de Estudos",
    subtitle: "Contemplativo & Acadêmico",
    root: 164.81, // E3
    // Em7 -> Cmaj7 -> Gmaj7 -> Dadd9
    chords: [
      [164.81, 196.00, 246.94, 293.66], // E3, G3, B3, D4
      [130.81, 196.00, 261.63, 329.63], // C3, G3, C4, E4
      [196.00, 246.94, 293.66, 369.99], // G3, B3, D4, F#4
      [146.83, 220.00, 293.66, 329.63], // D3, A3, D4, E4
    ],
    cutoff: 460,
    tempoSec: 9.0,
    pulseSpeed: 0,
    binauralDiff: 0,
  },
  secretaria: {
    name: "Assistente Cósmica",
    subtitle: "Curiosidade & Inspiração",
    root: 103.83, // Ab2
    // Abmaj7 -> Dbmaj7 -> Fm9 -> Eb
    chords: [
      [103.83, 155.56, 207.65, 261.63], // Ab2, Eb3, Ab3, C4
      [138.59, 174.61, 207.65, 261.63], // Db3, F3, Ab3, C4
      [87.31,  130.81, 174.61, 207.65], // F2, C3, F3, Ab3
      [155.56, 196.00, 233.08, 311.13], // Eb3, G3, Bb3, Eb4
    ],
    cutoff: 500,
    tempoSec: 8.0,
    pulseSpeed: 0,
    binauralDiff: 0,
  },
  desempenho: {
    name: "Vitória Dourada",
    subtitle: "Celebração e Conquista",
    root: 146.83, // D3
    // Dmaj7 -> Gmaj7 -> Bm7 -> A6
    chords: [
      [146.83, 220.00, 277.18, 329.63], // D3, A3, C#4, E4
      [196.00, 246.94, 293.66, 369.99], // G3, B3, D4, F#4
      [123.47, 185.00, 246.94, 293.66], // B2, F#3, B3, D4
      [220.00, 277.18, 329.63, 440.00], // A3, C#4, E4, A4
    ],
    cutoff: 520,
    tempoSec: 7.5,
    pulseSpeed: 0,
    binauralDiff: 0,
  },
  config: {
    name: "Tranquilidade",
    subtitle: "Paz & Ajustes",
    root: 130.81,
    chords: [
      [130.81, 164.81, 196.00, 246.94],
      [174.61, 220.00, 261.63, 329.63],
    ],
    cutoff: 350,
    tempoSec: 8.0,
    pulseSpeed: 0,
    binauralDiff: 0,
  }
};

class ReactiveBgmEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isDucked = false;
    this.volume = 0.35;
    this.activeTab = "hoje";
    this.presetOverride = null; // null = auto
    this.currentChordIndex = 0;
    this.timerId = null;
    this.listeners = new Set();

    // Audio node references
    this.masterGain = null;
    this.filterNode = null;
    this.subBassGain = null;
    this.currentVoices = [];
    this.binauralOscL = null;
    this.binauralOscR = null;

    // Load initial preference
    this.loadConfig();
  }

  loadConfig() {
    if (typeof window === "undefined") return;
    try {
      const cfg = JSON.parse(localStorage.getItem("omnia_config") || "{}");
      if (typeof cfg.enableReactiveBgm === "boolean") {
        this.enabledInConfig = cfg.enableReactiveBgm;
      } else {
        this.enabledInConfig = false;
      }
      if (typeof cfg.reactiveBgmVolume === "number") {
        this.volume = Math.max(0, Math.min(1, cfg.reactiveBgmVolume));
      }
      if (cfg.reactiveBgmPreset) {
        this.presetOverride = cfg.reactiveBgmPreset === "auto" ? null : cfg.reactiveBgmPreset;
      }
    } catch (e) {
      this.enabledInConfig = false;
    }
  }

  saveConfig() {
    if (typeof window === "undefined") return;
    try {
      const cfg = JSON.parse(localStorage.getItem("omnia_config") || "{}");
      cfg.enableReactiveBgm = this.isPlaying;
      cfg.reactiveBgmVolume = this.volume;
      cfg.reactiveBgmPreset = this.presetOverride || "auto";
      localStorage.setItem("omnia_config", JSON.stringify(cfg));
    } catch (e) {}
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.getState()));
  }

  getState() {
    const currentEnv = this.getCurrentSoundscape();
    return {
      isPlaying: this.isPlaying,
      volume: this.volume,
      activeTab: this.activeTab,
      presetOverride: this.presetOverride,
      name: currentEnv.name,
      subtitle: currentEnv.subtitle,
    };
  }

  getAudioContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  getCurrentSoundscape() {
    const key = this.presetOverride || this.activeTab;
    return TAB_SOUNDSCAPES[key] || TAB_SOUNDSCAPES.hoje;
  }

  start() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (this.isPlaying) return;
    this.isPlaying = true;
    this.saveConfig();

    // Create audio graph
    this.setupAudioGraph();
    this.scheduleChordLoop();
    this.notify();
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.saveConfig();

    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (this.masterGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
        setTimeout(() => {
          this.cleanupVoices();
        }, 1100);
      } catch (e) {
        this.cleanupVoices();
      }
    } else {
      this.cleanupVoices();
    }

    this.notify();
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      const targetGain = this.isDucked ? this.volume * 0.15 : this.volume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    this.saveConfig();
    this.notify();
  }

  duck(isDucked) {
    this.isDucked = Boolean(isDucked);
    if (this.masterGain && this.ctx) {
      const target = this.isDucked ? this.volume * 0.15 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.4);
    }
  }

  setTab(tabId) {
    if (this.activeTab === tabId) return;
    this.activeTab = tabId;

    if (this.isPlaying) {
      // Smoothly transition soundscape
      this.transitionToCurrentSoundscape();
    }
    this.notify();
  }

  setPreset(presetId) {
    this.presetOverride = presetId === "auto" ? null : presetId;
    if (this.isPlaying) {
      this.transitionToCurrentSoundscape();
    }
    this.saveConfig();
    this.notify();
  }

  setupAudioGraph() {
    const ctx = this.ctx;
    if (!ctx) return;

    // Master Gain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 1.2);

    // Warm Low-pass Filter
    this.filterNode = ctx.createBiquadFilter();
    this.filterNode.type = "lowpass";
    const env = this.getCurrentSoundscape();
    this.filterNode.frequency.setValueAtTime(env.cutoff, ctx.currentTime);
    this.filterNode.Q.setValueAtTime(1.2, ctx.currentTime);

    // Filter LFO for breathing warmth
    try {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.04, ctx.currentTime); // 0.04 Hz = very slow breath
      lfoGain.gain.setValueAtTime(45, ctx.currentTime); // +/- 45 Hz swell
      lfo.connect(lfoGain);
      lfoGain.connect(this.filterNode.frequency);
      lfo.start();
    } catch (e) {}

    // Master Compressor for smooth cohesion
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-24, ctx.currentTime);
    comp.knee.setValueAtTime(30, ctx.currentTime);
    comp.ratio.setValueAtTime(3, ctx.currentTime);
    comp.attack.setValueAtTime(0.05, ctx.currentTime);
    comp.release.setValueAtTime(0.3, ctx.currentTime);

    // Routing: Filter -> MasterGain -> Compressor -> Destination
    this.filterNode.connect(this.masterGain);
    this.masterGain.connect(comp);
    comp.connect(ctx.destination);
  }

  scheduleChordLoop() {
    if (!this.isPlaying || !this.ctx) return;

    const env = this.getCurrentSoundscape();
    const chords = env.chords;
    const chord = chords[this.currentChordIndex % chords.length];
    this.currentChordIndex = (this.currentChordIndex + 1) % chords.length;

    this.playChordPads(chord, env.tempoSec);

    // Schedule next chord crossfade
    this.timerId = setTimeout(() => {
      this.scheduleChordLoop();
    }, (env.tempoSec - 1.2) * 1000);
  }

  playChordPads(frequencies, durationSec) {
    const ctx = this.ctx;
    if (!ctx || !this.isPlaying) return;

    const now = ctx.currentTime;
    const fadeTime = 1.6;

    frequencies.forEach((freq, i) => {
      // 2 detuned oscillators per note for rich lush chorus
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const voiceGain = ctx.createGain();

      // Pan spread across stereo field
      let panner = null;
      if (ctx.createStereoPanner) {
        panner = ctx.createStereoPanner();
        const panPos = ((i % 3) - 1) * 0.45; // -0.45, 0, +0.45
        panner.pan.setValueAtTime(panPos, now);
      }

      osc1.type = i === 0 ? "sine" : "triangle";
      osc2.type = "sine";

      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 1.002, now); // +3.5 cents detune

      // Gentle pad envelope: swell in -> sustain -> fade out
      const maxVol = (0.08 / Math.sqrt(frequencies.length));
      voiceGain.gain.setValueAtTime(0, now);
      voiceGain.gain.linearRampToValueAtTime(maxVol, now + fadeTime);
      voiceGain.gain.setValueAtTime(maxVol, now + durationSec - fadeTime);
      voiceGain.gain.linearRampToValueAtTime(0.0001, now + durationSec);

      osc1.connect(voiceGain);
      osc2.connect(voiceGain);

      if (panner) {
        voiceGain.connect(panner);
        panner.connect(this.filterNode);
      } else {
        voiceGain.connect(this.filterNode);
      }

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + durationSec + 0.1);
      osc2.stop(now + durationSec + 0.1);

      this.currentVoices.push(osc1, osc2);
    });

    // Clean up expired oscillator references
    setTimeout(() => {
      this.currentVoices = this.currentVoices.filter(v => v.playbackState !== 3);
    }, (durationSec + 0.2) * 1000);
  }

  transitionToCurrentSoundscape() {
    if (!this.ctx || !this.isPlaying) return;

    const env = this.getCurrentSoundscape();
    const now = this.ctx.currentTime;

    // Smoothly shift cutoff
    if (this.filterNode) {
      this.filterNode.frequency.cancelScheduledValues(now);
      this.filterNode.frequency.setTargetAtTime(env.cutoff, now, 0.8);
    }

    // Reset chord cycle with next chord of new scale
    this.currentChordIndex = 0;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.scheduleChordLoop();
    }
  }

  // Reactive action response: delicate musical chime or ripple in key
  pulseAction(actionType = "click") {
    if (!this.isPlaying || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const env = this.getCurrentSoundscape();

      if (actionType === "complete" || actionType === "task") {
        // Sparkling harmonic resonance in key
        const chord = env.chords[0];
        const highNote = (chord[chord.length - 1] || 440) * 2;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(highNote, now);
        osc.frequency.exponentialRampToValueAtTime(highNote * 1.25, now + 0.08);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04 * this.volume, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 1.2);
      } else if (actionType === "tab") {
        // Filter gentle opening swell for a breath of air
        if (this.filterNode) {
          this.filterNode.frequency.cancelScheduledValues(now);
          this.filterNode.frequency.setValueAtTime(env.cutoff + 80, now);
          this.filterNode.frequency.setTargetAtTime(env.cutoff, now + 0.1, 0.6);
        }
      }
    } catch (e) {}
  }

  cleanupVoices() {
    this.currentVoices.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    this.currentVoices = [];
  }
}

export const reactiveBgm = new ReactiveBgmEngine();
