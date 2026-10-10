// Procedural Reactive Background Music (BGM) Engine for Omnia
// Generates infinite, lush, non-repetitive ambient generative soundscapes using Web Audio API.
// Seamlessly adapts key, chords, filter resonance, melodic plucks, and dynamics to active tabs and user actions.

export const TAB_SOUNDSCAPES = {
  hoje: {
    name: "Serenidade Matinal",
    subtitle: "Clareza, Motivação e Vitalidade",
    root: 130.81, // C3
    chords: [
      [130.81, 164.81, 196.00, 246.94, 329.63], // Cmaj7(9)
      [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj7(9)
      [196.00, 261.63, 293.66, 392.00, 440.00], // Gsus4(add9)
      [220.00, 261.63, 329.63, 392.00, 493.88], // Am7(9)
    ],
    melodyScale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25],
    bassFreqs: [65.41, 87.31, 98.00, 110.00],
    cutoff: 1500,
    tempoSec: 6.5,
    pulseSpeed: 0.8,
    arpeggioRate: 1.8,
    binauralDiff: 0,
  },
  foco: {
    name: "Foco Profundo",
    subtitle: "Ondas Theta & Concentração Imersiva",
    root: 146.83, // D3
    chords: [
      [146.83, 174.61, 220.00, 261.63, 329.63], // Dm9
      [110.00, 164.81, 220.00, 261.63, 329.63], // Am7
      [116.54, 174.61, 233.08, 293.66, 349.23], // Bbmaj7
      [146.83, 220.00, 261.63, 293.66, 349.23], // Dm11
    ],
    melodyScale: [220.00, 261.63, 293.66, 329.63, 349.23, 440.00, 523.25],
    bassFreqs: [73.42, 55.00, 58.27, 73.42],
    cutoff: 1200,
    tempoSec: 7.2,
    pulseSpeed: 1.4,
    arpeggioRate: 1.5,
    binauralDiff: 7.5, // 7.5 Hz Theta wave
  },
  diario: {
    name: "Reflexão Íntima",
    subtitle: "Paz Mental, Acolhimento e Diário",
    root: 174.61, // F3
    chords: [
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [146.83, 174.61, 220.00, 261.63], // Dm7
      [116.54, 174.61, 220.00, 293.66], // Bbmaj9
    ],
    melodyScale: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 523.25],
    bassFreqs: [87.31, 65.41, 73.42, 58.27],
    cutoff: 1350,
    tempoSec: 7.0,
    pulseSpeed: 0.5,
    arpeggioRate: 2.2,
    binauralDiff: 0,
  },
  agenda: {
    name: "Fluxo Tranquilo",
    subtitle: "Organização, Calendário e Equilíbrio",
    root: 116.54, // Bb2
    chords: [
      [116.54, 174.61, 233.08, 293.66, 349.23], // Bbmaj7
      [98.00,  146.83, 196.00, 233.08, 293.66], // Gm9
      [155.56, 196.00, 233.08, 293.66, 392.00], // Ebmaj7
      [174.61, 220.00, 261.63, 293.66, 349.23], // Fsus4
    ],
    melodyScale: [233.08, 261.63, 293.66, 349.23, 392.00, 466.16, 523.25],
    bassFreqs: [58.27, 49.00, 77.78, 87.31],
    cutoff: 1600,
    tempoSec: 6.2,
    pulseSpeed: 0.9,
    arpeggioRate: 1.6,
    binauralDiff: 0,
  },
  rotina: {
    name: "Rotina Consciente",
    subtitle: "Constância, Ritmo e Produtividade",
    root: 116.54,
    chords: [
      [116.54, 174.61, 233.08, 293.66],
      [155.56, 196.00, 233.08, 293.66],
      [98.00,  146.83, 196.00, 233.08],
      [130.81, 196.00, 261.63, 329.63],
    ],
    melodyScale: [233.08, 261.63, 293.66, 349.23, 392.00, 466.16],
    bassFreqs: [58.27, 77.78, 49.00, 65.41],
    cutoff: 1450,
    tempoSec: 6.4,
    pulseSpeed: 0.7,
    arpeggioRate: 1.7,
    binauralDiff: 0,
  },
  biblioteca: {
    name: "Santuário de Estudos",
    subtitle: "Sabedoria, Livros e Contemplação",
    root: 164.81, // E3
    chords: [
      [164.81, 196.00, 246.94, 293.66, 369.99], // Em9
      [130.81, 196.00, 261.63, 329.63, 392.00], // Cmaj7
      [196.00, 246.94, 293.66, 369.99, 440.00], // Gmaj7
      [146.83, 220.00, 293.66, 329.63, 440.00], // D6/9
    ],
    melodyScale: [246.94, 293.66, 329.63, 369.99, 392.00, 493.88, 587.33],
    bassFreqs: [82.41, 65.41, 98.00, 73.42],
    cutoff: 1800,
    tempoSec: 6.8,
    pulseSpeed: 0.6,
    arpeggioRate: 1.9,
    binauralDiff: 0,
  },
  secretaria: {
    name: "Assistente Cósmica",
    subtitle: "IA, Curiosidade e Horizontes",
    root: 103.83, // Ab2
    chords: [
      [103.83, 155.56, 207.65, 261.63, 311.13], // Abmaj7
      [138.59, 174.61, 207.65, 261.63, 349.23], // Dbmaj7
      [87.31,  130.81, 174.61, 207.65, 311.13], // Fm9
      [155.56, 196.00, 233.08, 311.13, 349.23], // Ebadd9
    ],
    melodyScale: [207.65, 261.63, 311.13, 349.23, 415.30, 523.25, 622.25],
    bassFreqs: [51.91, 69.30, 43.65, 77.78],
    cutoff: 2000,
    tempoSec: 6.0,
    pulseSpeed: 1.1,
    arpeggioRate: 1.5,
    binauralDiff: 0,
  },
  desempenho: {
    name: "Vitória Dourada",
    subtitle: "Celebração, Conquista e Progresso",
    root: 146.83, // D3
    chords: [
      [146.83, 220.00, 277.18, 329.63, 440.00], // Dmaj9
      [196.00, 246.94, 293.66, 369.99, 440.00], // Gmaj7
      [123.47, 185.00, 246.94, 293.66, 369.99], // Bm7
      [220.00, 277.18, 329.63, 440.00, 493.88], // A6/9
    ],
    melodyScale: [293.66, 329.63, 369.99, 440.00, 493.88, 587.33, 659.25],
    bassFreqs: [73.42, 98.00, 61.74, 110.00],
    cutoff: 2200,
    tempoSec: 5.8,
    pulseSpeed: 1.0,
    arpeggioRate: 1.4,
    binauralDiff: 0,
  },
  config: {
    name: "Tranquilidade",
    subtitle: "Ajustes e Serenidade",
    root: 130.81,
    chords: [
      [130.81, 164.81, 196.00, 246.94],
      [174.61, 220.00, 261.63, 329.63],
    ],
    melodyScale: [261.63, 329.63, 392.00, 440.00, 523.25],
    bassFreqs: [65.41, 87.31],
    cutoff: 1350,
    tempoSec: 6.5,
    pulseSpeed: 0.4,
    arpeggioRate: 2.0,
    binauralDiff: 0,
  }
};

class ReactiveBgmEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isDucked = false;
    this.volume = 0.55; // Volume base audível e presente
    this.activeTab = "hoje";
    this.presetOverride = null; // null = auto
    this.currentChordIndex = 0;
    this.timerId = null;
    this.melodyTimerId = null;
    this.listeners = new Set();
    this.lastClickPulse = 0;

    // Audio node references
    this.masterGain = null;
    this.filterNode = null;
    this.reverbBus = null;
    this.comp = null;
    this.currentVoices = [];
    this.binauralOscL = null;
    this.binauralOscR = null;

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
        this.volume = Math.max(0.05, Math.min(1, cfg.reactiveBgmVolume));
      } else {
        this.volume = 0.55;
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

    this.setupAudioGraph();
    this.scheduleChordLoop();
    this.scheduleMelodyLoop();
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
    if (this.melodyTimerId) {
      clearTimeout(this.melodyTimerId);
      this.melodyTimerId = null;
    }

    if (this.masterGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        setTimeout(() => {
          this.cleanupVoices();
        }, 900);
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
      const targetGain = this.isDucked ? this.volume * 0.12 : this.volume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    this.saveConfig();
    this.notify();
  }

  duck(isDucked) {
    this.isDucked = Boolean(isDucked);
    if (this.masterGain && this.ctx) {
      const target = this.isDucked ? this.volume * 0.12 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.35);
    }
  }

  setTab(tabId) {
    if (this.activeTab === tabId) return;
    const oldTab = this.activeTab;
    this.activeTab = tabId;

    if (this.isPlaying) {
      this.transitionToCurrentSoundscape(oldTab);
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
    this.masterGain.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 0.8);

    // Warm Resonant Low-pass Filter
    this.filterNode = ctx.createBiquadFilter();
    this.filterNode.type = "lowpass";
    const env = this.getCurrentSoundscape();
    this.filterNode.frequency.setValueAtTime(env.cutoff, ctx.currentTime);
    this.filterNode.Q.setValueAtTime(1.4, ctx.currentTime);

    // Slow organic filter breathing LFO
    try {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.06, ctx.currentTime); // ~16 sec gentle breath
      lfoGain.gain.setValueAtTime(80, ctx.currentTime); // +/- 80 Hz swell
      lfo.connect(lfoGain);
      lfoGain.connect(this.filterNode.frequency);
      lfo.start();
    } catch (e) {}

    // Spatial Reverb / Ambient Delay Bus
    try {
      const delay = ctx.createDelay();
      const delayFeedback = ctx.createGain();
      const delayFilter = ctx.createBiquadFilter();
      const delaySend = ctx.createGain();

      delay.delayTime.setValueAtTime(0.38, ctx.currentTime);
      delayFeedback.gain.setValueAtTime(0.30, ctx.currentTime);
      delayFilter.type = "lowpass";
      delayFilter.frequency.setValueAtTime(1800, ctx.currentTime);
      delaySend.gain.setValueAtTime(0.40, ctx.currentTime);

      delay.connect(delayFeedback);
      delayFeedback.connect(delayFilter);
      delayFilter.connect(delay);
      delay.connect(delaySend);
      delaySend.connect(this.masterGain);

      this.reverbBus = delay;
    } catch (e) {
      this.reverbBus = this.masterGain;
    }

    // Master Compressor for punchy cohesion
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-18, ctx.currentTime);
    comp.knee.setValueAtTime(24, ctx.currentTime);
    comp.ratio.setValueAtTime(3.5, ctx.currentTime);
    comp.attack.setValueAtTime(0.03, ctx.currentTime);
    comp.release.setValueAtTime(0.25, ctx.currentTime);
    this.comp = comp;

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
    const bassFreq = env.bassFreqs ? env.bassFreqs[this.currentChordIndex % env.bassFreqs.length] : chord[0] / 2;
    this.currentChordIndex = (this.currentChordIndex + 1) % chords.length;

    this.playChordPads(chord, bassFreq, env.tempoSec);

    // Schedule next chord crossfade
    this.timerId = setTimeout(() => {
      this.scheduleChordLoop();
    }, (env.tempoSec - 1.0) * 1000);
  }

  scheduleMelodyLoop() {
    if (!this.isPlaying || !this.ctx) return;
    const env = this.getCurrentSoundscape();

    // Play an expressive melodic note in key
    this.playMelodyNote(env);

    // Dynamic pacing: humanized timing
    const nextInterval = (env.arpeggioRate || 1.8) * (0.8 + Math.random() * 0.5);
    this.melodyTimerId = setTimeout(() => {
      this.scheduleMelodyLoop();
    }, nextInterval * 1000);
  }

  playMelodyNote(env) {
    const ctx = this.ctx;
    if (!ctx || !this.isPlaying || this.isDucked) return;

    const now = ctx.currentTime;
    const scale = env.melodyScale || [261.63, 329.63, 392.00, 523.25];
    const noteFreq = scale[Math.floor(Math.random() * scale.length)];

    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc2.type = "triangle";
    osc.frequency.setValueAtTime(noteFreq, now);
    osc2.frequency.setValueAtTime(noteFreq * 2.001, now); // soft harmonic octave

    const noteVol = 0.14 * this.volume;
    const noteDuration = 1.4;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(noteVol, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + noteDuration);

    let panner = null;
    if (ctx.createStereoPanner) {
      panner = ctx.createStereoPanner();
      const panPos = (Math.random() - 0.5) * 0.7; // Stereo spread
      panner.pan.setValueAtTime(panPos, now);
    }

    osc.connect(gain);
    osc2.connect(gain);

    const targetBus = panner || gain;
    if (panner) gain.connect(panner);

    targetBus.connect(this.filterNode);
    if (this.reverbBus) {
      const reverbSend = ctx.createGain();
      reverbSend.gain.setValueAtTime(0.45, now);
      targetBus.connect(reverbSend);
      reverbSend.connect(this.reverbBus);
    }

    osc.start(now);
    osc2.start(now);
    osc.stop(now + noteDuration + 0.1);
    osc2.stop(now + noteDuration + 0.1);

    this.currentVoices.push(osc, osc2);
  }

  playChordPads(frequencies, bassFreq, durationSec) {
    const ctx = this.ctx;
    if (!ctx || !this.isPlaying) return;

    const now = ctx.currentTime;
    const fadeTime = 1.4;

    // 1. Play warm root sub-bass
    if (bassFreq) {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = "triangle";
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      const bassVol = 0.18 * this.volume;
      bassGain.gain.setValueAtTime(0, now);
      bassGain.gain.linearRampToValueAtTime(bassVol, now + fadeTime);
      bassGain.gain.setValueAtTime(bassVol, now + durationSec - fadeTime);
      bassGain.gain.linearRampToValueAtTime(0.0001, now + durationSec);

      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain);

      bassOsc.start(now);
      bassOsc.stop(now + durationSec + 0.1);
      this.currentVoices.push(bassOsc);
    }

    // 2. Play lush stereo chord voices
    frequencies.forEach((freq, i) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const voiceGain = ctx.createGain();

      let panner = null;
      if (ctx.createStereoPanner) {
        panner = ctx.createStereoPanner();
        const panPos = ((i % 3) - 1) * 0.55;
        panner.pan.setValueAtTime(panPos, now);
      }

      osc1.type = i === 0 ? "sine" : "triangle";
      osc2.type = "sine";

      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 1.0025, now); // detune for rich analog chorus

      // Clear, audible pad presence
      const maxVol = (0.19 / Math.sqrt(frequencies.length)) * this.volume;
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

      if (this.reverbBus && i % 2 === 0) {
        const reverbSend = ctx.createGain();
        reverbSend.gain.setValueAtTime(0.25, now);
        voiceGain.connect(reverbSend);
        reverbSend.connect(this.reverbBus);
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

  // Instant palpable transition when switching tabs
  transitionToCurrentSoundscape(prevTab) {
    if (!this.ctx || !this.isPlaying) return;

    const env = this.getCurrentSoundscape();
    const now = this.ctx.currentTime;

    // 1. Instantly sweep the filter to the new soundscape's cutoff
    if (this.filterNode) {
      this.filterNode.frequency.cancelScheduledValues(now);
      this.filterNode.frequency.setValueAtTime(env.cutoff + 400, now);
      this.filterNode.frequency.exponentialRampToValueAtTime(env.cutoff, now + 1.2);
    }

    // 2. Play immediate welcome chord strike in the new tab's key
    this.playTransitionStinger(env);

    // 3. Reset chord index and restart cycle immediately in the new key
    this.currentChordIndex = 0;
    if (this.timerId) clearTimeout(this.timerId);
    if (this.melodyTimerId) clearTimeout(this.melodyTimerId);

    this.scheduleChordLoop();
    this.scheduleMelodyLoop();
  }

  // Signature harmonic chord swell on tab change
  playTransitionStinger(env) {
    const ctx = this.ctx;
    if (!ctx || !this.isPlaying) return;
    const now = ctx.currentTime;
    const chord = env.chords[0];

    chord.slice(0, 3).forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * 1.5, now + idx * 0.04);

      gain.gain.setValueAtTime(0, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.12 * this.volume, now + idx * 0.04 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.04);
      osc.stop(now + 1.7);
    });
  }

  // Deep interactive response to actions
  pulseAction(actionType = "click") {
    if (!this.isPlaying || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const env = this.getCurrentSoundscape();

      if (actionType === "complete" || actionType === "task") {
        // Triumphant 3-note ascending arpeggio chord in current key
        const scale = env.melodyScale || [261.63, 329.63, 392.00, 523.25];
        const notes = [scale[0], scale[2] || scale[1], scale[4] || scale[3], scale[scale.length - 1]];

        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const t = now + idx * 0.07;

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.16 * this.volume, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);

          osc.connect(gain);
          gain.connect(this.masterGain);

          if (this.reverbBus) {
            const send = this.ctx.createGain();
            send.gain.setValueAtTime(0.5, t);
            gain.connect(send);
            send.connect(this.reverbBus);
          }

          osc.start(t);
          osc.stop(t + 1.5);
        });
      } else if (actionType === "click") {
        // Delicate harmonic water-droplet note in key
        const nowMs = Date.now();
        if (nowMs - this.lastClickPulse < 120) return;
        this.lastClickPulse = nowMs;

        const scale = env.melodyScale || [261.63, 329.63, 392.00];
        const note = scale[Math.floor(Math.random() * scale.length)];

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note * 1.5, now);
        osc.frequency.exponentialRampToValueAtTime(note * 1.48, now + 0.15);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.06 * this.volume, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.45);
      } else if (actionType === "timer_start") {
        // Empowering focus pulse & opening filter
        if (this.filterNode) {
          this.filterNode.frequency.cancelScheduledValues(now);
          this.filterNode.frequency.setValueAtTime(env.cutoff + 350, now);
          this.filterNode.frequency.exponentialRampToValueAtTime(env.cutoff, now + 1.8);
        }
      } else if (actionType === "timer_pause") {
        // Gentle contemplative suspension
        if (this.filterNode) {
          this.filterNode.frequency.cancelScheduledValues(now);
          this.filterNode.frequency.setValueAtTime(env.cutoff * 0.65, now);
          this.filterNode.frequency.exponentialRampToValueAtTime(env.cutoff, now + 1.2);
        }
      } else if (actionType === "tab") {
        // Filter swell on tab switch
        if (this.filterNode) {
          this.filterNode.frequency.cancelScheduledValues(now);
          this.filterNode.frequency.setValueAtTime(env.cutoff + 300, now);
          this.filterNode.frequency.setTargetAtTime(env.cutoff, now + 0.1, 0.7);
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
