// Gobble Getaway — all sound is synthesized with WebAudio. No audio files,
// no network: every gobble, thud and banjo pluck is an oscillator here.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  // Browsers only allow audio after a user gesture; call this from one.
  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopMusic();
    return this.muted;
  }

  tone(freq, dur, type, vol, when = 0, slideTo = 0) {
    if (this.muted || !this.ctx) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo > 0) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  noise(dur, vol, when = 0) {
    if (this.muted || !this.ctx) return;
    const t0 = this.ctx.currentTime + when;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start(t0);
  }

  // The turkey's signature: two quick gobbles.
  gobble() {
    this.tone(320, 0.09, 'square', 0.16, 0, 180);
    this.tone(300, 0.09, 'square', 0.16, 0.1, 170);
    this.tone(360, 0.12, 'square', 0.14, 0.2, 200);
  }

  jump() {
    this.tone(280, 0.16, 'sine', 0.18, 0, 560);
  }

  slide() {
    this.noise(0.18, 0.12);
  }

  // A wet squelch for the mud puddles.
  squelch() {
    this.tone(180, 0.14, 'sine', 0.16, 0, 90);
    this.noise(0.12, 0.1, 0.05);
  }

  pickup() {
    this.tone(880, 0.09, 'triangle', 0.16);
    this.tone(1318, 0.12, 'triangle', 0.14, 0.07);
  }

  feather() {
    [660, 880, 1100, 1320].forEach((f, i) => this.tone(f, 0.1, 'triangle', 0.14, i * 0.06));
  }

  thud() {
    this.noise(0.22, 0.28);
    this.tone(120, 0.2, 'sine', 0.3, 0, 55);
  }

  spotted() {
    this.tone(520, 0.14, 'sawtooth', 0.2, 0, 760);
    this.tone(760, 0.2, 'sawtooth', 0.18, 0.13, 520);
  }

  sneaky() {
    [523, 659, 784].forEach((f, i) => this.tone(f, 0.12, 'sine', 0.14, i * 0.08));
  }

  stageUp() {
    [392, 523, 659, 784].forEach((f, i) => this.tone(f, 0.14, 'triangle', 0.16, i * 0.09));
  }

  fanfare() {
    [523, 659, 784, 1046, 784, 1046].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.18, i * 0.14));
  }

  caught() {
    [392, 370, 349, 311].forEach((f, i) => this.tone(f, 0.3, 'sawtooth', 0.16, i * 0.22));
    this.noise(0.4, 0.1, 0.9);
  }

  click() {
    this.tone(700, 0.05, 'square', 0.1);
  }

  // A lazy banjo-ish pluck loop: a I–V–vi–IV walk in G, triangle wave.
  startMusic() {
    if (!this.ctx || this.musicTimer || this.muted) return;
    const bass = [98, 98, 123, 82, 98, 123, 82, 98];
    const pluck = [392, 494, 587, 494, 392, 494, 659, 587];
    this.musicStep = 0;
    this.musicTimer = setInterval(() => {
      if (this.muted || !this.ctx) return;
      const i = this.musicStep % 8;
      this.tone(bass[i], 0.32, 'triangle', 0.07);
      this.tone(pluck[i], 0.16, 'triangle', 0.06);
      if (i % 2 === 0) this.tone(pluck[i] * 2, 0.1, 'sine', 0.04);
      this.musicStep++;
    }, 300);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}
