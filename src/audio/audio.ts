/**
 * All sound is synthesised with Web Audio (no audio files): rain, a soft music-box lullaby,
 * chimes, paper rustle, distant thunder, footsteps, a door creak. Starts only after a user gesture.
 */
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export class Sound {
  private ac: AudioContext | null = null;
  private master!: GainNode;
  private rainGain!: GainNode;
  private musicGain!: GainNode;
  private musicTimer = 0;
  music = true;
  ambience = true;
  rainWanted = true;

  start() {
    if (this.ac) return;
    try {
      this.ac = new AudioContext();
    } catch {
      return;
    }
    const ac = this.ac;
    this.master = ac.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(ac.destination);
    // rain: looping brown-ish noise through a low-pass, with sparse drips
    const len = ac.sampleRate * 4,
      buf = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.2 + (Math.random() < 0.0012 ? rnd(-0.5, 0.5) : 0);
      }
    }
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1500;
    this.rainGain = ac.createGain();
    this.rainGain.gain.value = 0;
    src.connect(lp).connect(this.rainGain).connect(this.master);
    src.start();
    this.musicGain = ac.createGain();
    this.musicGain.gain.value = 0;
    this.musicGain.connect(this.master);
    this.apply();
    this.scheduleMusic();
    document.addEventListener('visibilitychange', () => (document.hidden ? ac.suspend() : ac.resume()));
  }

  apply() {
    if (!this.ac) return;
    const t = this.ac.currentTime;
    this.rainGain.gain.linearRampToValueAtTime(this.ambience && this.rainWanted ? 0.55 : 0, t + 2);
    this.musicGain.gain.linearRampToValueAtTime(this.music ? 0.22 : 0, t + 1.5);
  }

  /** A slow music-box progression (I–vi–IV–V in C), notes picked gently at random. */
  private scheduleMusic() {
    const ac = this.ac!;
    const chords = [
      [523, 659, 784, 1047],
      [440, 523, 659, 880],
      [349, 440, 523, 698],
      [392, 494, 587, 784],
    ];
    let bar = 0;
    const playBar = () => {
      const t0 = ac.currentTime + 0.05;
      const ch = chords[bar % chords.length];
      for (let i = 0; i < 6; i++)
        this.pluck(ch[(i * 2 + (bar % 2)) % ch.length] * (i === 5 ? 2 : 1), t0 + i * 0.42, 0.06);
      this.pluck(ch[0] / 2, t0, 0.05);
      bar++;
    };
    playBar();
    this.musicTimer = window.setInterval(playBar, 2520);
  }

  private pluck(freq: number, t: number, vol: number, out: AudioNode = this.musicGain) {
    const ac = this.ac!;
    const o = ac.createOscillator(),
      o2 = ac.createOscillator(),
      g = ac.createGain();
    o.type = 'sine';
    o2.type = 'triangle';
    o.frequency.value = freq;
    o2.frequency.value = freq * 2.01;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    const g2 = ac.createGain();
    g2.gain.value = 0.25;
    o.connect(g);
    o2.connect(g2).connect(g);
    g.connect(out);
    o.start(t);
    o2.start(t);
    o.stop(t + 1.7);
    o2.stop(t + 1.7);
  }

  chime() {
    if (!this.ac) return;
    const t = this.ac.currentTime;
    [659, 784, 988].forEach((f, i) => this.pluck(f, t + i * 0.08, 0.07, this.master));
  }

  fanfare() {
    if (!this.ac) return;
    const t = this.ac.currentTime;
    [523, 659, 784, 988, 1175, 1568].forEach((f, i) => this.pluck(f, t + i * 0.18, 0.07, this.master));
  }

  private noise(dur: number, freq: number, vol: number, type: BiquadFilterType, rumble = false) {
    if (!this.ac || !this.ambience) return;
    const ac = this.ac,
      n = Math.floor(ac.sampleRate * dur),
      b = ac.createBuffer(1, n, ac.sampleRate),
      d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      last = rumble ? (last + 0.03 * w) / 1.03 : w;
      d[i] = last * (rumble ? 6 : 1) * Math.pow(1 - i / n, rumble ? 1.2 : 2);
    }
    const s = ac.createBufferSource(),
      f = ac.createBiquadFilter(),
      g = ac.createGain();
    f.type = type;
    f.frequency.value = freq;
    g.gain.value = vol;
    s.buffer = b;
    s.connect(f).connect(g).connect(this.master);
    s.start();
  }

  paper() {
    this.noise(0.22, 2000, 0.22, 'highpass');
  }
  step() {
    this.noise(0.08, 380, 0.12, 'lowpass');
  }
  thunder() {
    setTimeout(() => this.noise(3.2, 180, 0.9, 'lowpass', true), rnd(500, 1400));
  }
  door() {
    if (!this.ac) return;
    const ac = this.ac,
      o = ac.createOscillator(),
      g = ac.createGain(),
      t = ac.currentTime;
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(140, t);
    o.frequency.linearRampToValueAtTime(95, t + 0.9);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.025, t + 0.1);
    g.gain.linearRampToValueAtTime(0, t + 0.9);
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    o.connect(lp).connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 1);
  }

  dispose() {
    clearInterval(this.musicTimer);
    this.ac?.close();
  }
}
