// Web Audio API procedural sound synthesizer for Omnia
// Provides delightful, zero-latency micro-sound effects across the entire app.
import { reactiveBgm } from "./reactiveBgm";

class SoundEffectsManager {
  constructor() {
    this.ctx = null;
    this.volume = 0.55;
    this.lastPlayTime = 0;
    this._globalClickAttached = false;

    if (typeof window !== "undefined") {
      this.attachGlobalClickAudio();
    }
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

  isEnabled() {
    if (typeof window === "undefined") return false;
    try {
      const cfg = JSON.parse(localStorage.getItem("omnia_config") || "{}");
      if (cfg.enableSfx === false) return false;
    } catch (e) {}
    return true;
  }

  markPlayed() {
    this.lastPlayTime = Date.now();
  }

  attachGlobalClickAudio() {
    if (typeof window === "undefined" || this._globalClickAttached) return;
    this._globalClickAttached = true;

    // Listens to any interactive click in the app to prevent silent/unsatisfying clicks
    window.addEventListener(
      "click",
      (e) => {
        if (!this.isEnabled()) return;
        const target = e.target;
        if (!target || typeof target.closest !== "function") return;

        const interactive = target.closest(
          "button, [role='button'], input[type='checkbox'], input[type='radio'], a, summary, [data-sound-click]"
        );
        if (!interactive) return;

        // Skip disabled elements
        if (
          interactive.disabled ||
          interactive.getAttribute("aria-disabled") === "true" ||
          interactive.classList.contains("disabled")
        ) {
          return;
        }

        // If an explicit sound was played in the last 70ms (e.g. sfx.complete, sfx.pop), skip generic click
        if (Date.now() - this.lastPlayTime < 70) return;

        this.click();
      },
      { capture: false, passive: true }
    );
  }

  // 1. Task complete / Checkbox: Rewarding bell chime
  complete() {
    if (!this.isEnabled()) return;
    this.markPlayed();
    try {
      reactiveBgm.pulseAction("complete");
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";

      osc1.frequency.setValueAtTime(659.25, now); // E5
      osc1.frequency.setValueAtTime(987.77, now + 0.08); // B5
      osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.24 * this.volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } catch(e) {}
  }

  // 2. Coin / Reward (Wardrobe purchase, streak, points)
  coin() {
    if (!this.isEnabled()) return;
    this.markPlayed();
    try {
      reactiveBgm.pulseAction("complete");
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.07); // E6

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.26 * this.volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch(e) {}
  }

  // 3. Pop (Bubbly UI select, dressing the owl, habit toggle)
  pop() {
    if (!this.isEnabled()) return;
    this.markPlayed();
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.02);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.06);

      gain.gain.setValueAtTime(0.18 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch(e) {}
  }

  // 4. Click / Tap (Subtle tactile navigation)
  click() {
    if (!this.isEnabled()) return;
    this.markPlayed();
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.025);

      gain.gain.setValueAtTime(0.14 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch(e) {}
  }

  // 5. Tab switch (Warm, acoustic navigation tick)
  tab() {
    if (!this.isEnabled()) return;
    this.markPlayed();
    try {
      reactiveBgm.pulseAction("tab");
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

      gain.gain.setValueAtTime(0.12 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch(e) {}
  }

  // 6. Switch / Toggle (Cute tactile tick)
  toggle(on = true) {
    if (!this.isEnabled()) return;
    this.markPlayed();
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      const startFreq = on ? 420 : 620;
      const endFreq = on ? 620 : 420;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.04);

      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch(e) {}
  }

  // 7. Trash / Delete (Soft crumple thud)
  trash() {
    if (!this.isEnabled()) return;
    this.markPlayed();
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.07);

      gain.gain.setValueAtTime(0.16 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch(e) {}
  }

  // 8. Timer Start (Focus begin)
  timerStart() {
    if (!this.isEnabled()) return;
    this.markPlayed();
    try {
      reactiveBgm.pulseAction("complete");
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.06;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.18 * this.volume, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.2);
      });
    } catch(e) {}
  }

  // 9. Timer Pause
  timerPause() {
    if (!this.isEnabled()) return;
    this.markPlayed();
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const notes = [783.99, 523.25]; // G5, C5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.06;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.14 * this.volume, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.18);
      });
    } catch(e) {}
  }

  // 10. Timer Finish / Zen chime (Meditation singing bowl chord)
  timerFinish() {
    if (!this.isEnabled()) return;
    this.markPlayed();
    try {
      reactiveBgm.pulseAction("complete");
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const freqs = [349.23, 440.00, 523.25, 659.25, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime((0.24 / (idx + 1)) * this.volume, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 2.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 2.5);
      });
    } catch(e) {}
  }

  // 11. Level Up / Triumphant Achievement Fanfare
  levelUp() {
    if (!this.isEnabled()) return;
    this.markPlayed();
    try {
      reactiveBgm.pulseAction("complete");
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const arpeggio = [523.25, 783.99, 1046.50, 1318.51];
      arpeggio.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.09;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.24 * this.volume, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (idx === arpeggio.length - 1 ? 0.8 : 0.25));

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + (idx === arpeggio.length - 1 ? 0.8 : 0.25));
      });
    } catch(e) {}
  }
}

export const sfx = new SoundEffectsManager();
