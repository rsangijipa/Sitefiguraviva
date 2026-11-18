/** Sons sintetizados no navegador para as práticas da Sala de Pausa (sem arquivos nem licenças). Tudo começa só após um gesto. */
export type LoopName = "vento" | "agua" | "chuva" | "sinos" | "gotas";
export type OneShot = "passaro" | "sino" | "gota" | "toque";
const PENTATONIC = [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3];

export class SoundLab {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private noise: AudioBuffer | null = null;
  private data: Uint8Array<ArrayBuffer> | null = null;
  private stops = new Map<string, () => void>();
  private volume = 0.55;
  private impulse: AudioBuffer | null = null;

  /** Cria o contexto de áudio (chamar a partir de um clique). */
  async ensure(): Promise<AudioContext | null> {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain(); this.master.gain.value = this.volume;
      this.analyser = this.ctx.createAnalyser(); this.analyser.fftSize = 256; this.data = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
      this.master.connect(this.analyser); this.analyser.connect(this.ctx.destination);
      const length = this.ctx.sampleRate * 2, buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate), channel = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) channel[i] = Math.random() * 2 - 1;
      this.noise = buffer;
      const irLength = Math.floor(this.ctx.sampleRate * 2.4), ir = this.ctx.createBuffer(2, irLength, this.ctx.sampleRate);
      for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < irLength; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLength, 2.6); }
      this.impulse = ir;
    }
    await this.ctx.resume();
    return this.ctx;
  }
  get ready() { return !!this.ctx; }
  setVolume(value: number) { this.volume = value; if (this.master && this.ctx) this.master.gain.setTargetAtTime(value, this.ctx.currentTime, 0.05); }
  /** Energia atual do som (0–1), para animar elementos visuais no ritmo do que se ouve. */
  level(): number {
    if (!this.analyser || !this.data) return 0;
    this.analyser.getByteTimeDomainData(this.data); let sum = 0;
    for (let i = 0; i < this.data.length; i++) { const v = (this.data[i] - 128) / 128; sum += v * v; }
    return Math.min(1, Math.sqrt(sum / this.data.length) * 4);
  }
  isPlaying(name: string) { return this.stops.has(name); }

  private noiseSource(destination: AudioNode) {
    const source = this.ctx!.createBufferSource(); source.buffer = this.noise; source.loop = true; source.connect(destination); source.start(); return source;
  }
  private schedule(name: string, task: () => void, min: number, max: number) {
    let timer = 0; const loop = () => { timer = window.setTimeout(() => { task(); loop(); }, min + Math.random() * (max - min)); }; loop();
    return () => clearTimeout(timer);
  }

  /** Inicia um som contínuo; devolve nada, use stop(name). */
  start(name: LoopName) {
    if (!this.ctx || !this.master || this.stops.has(name)) return;
    const ctx = this.ctx, out = ctx.createGain(); out.gain.value = 0; out.connect(this.master); out.gain.setTargetAtTime(1, ctx.currentTime, 0.6);
    const cleanups: (() => void)[] = [];
    const filter = (type: BiquadFilterType, frequency: number, q = 0.7) => { const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = frequency; f.Q.value = q; return f; };
    const lfo = (target: AudioParam, rate: number, depth: number) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = rate; g.gain.value = depth; o.connect(g); g.connect(target); o.start(); cleanups.push(() => o.stop()); };
    if (name === "vento") {
      const band = filter("bandpass", 450, 0.5), gain = ctx.createGain(); gain.gain.value = 0.45; band.connect(gain); gain.connect(out);
      const src = this.noiseSource(band); lfo(gain.gain, 0.12, 0.25); lfo(band.frequency, 0.07, 220); cleanups.push(() => src.stop());
    } else if (name === "agua") {
      const band = filter("bandpass", 1100, 1.1), gain = ctx.createGain(); gain.gain.value = 0.3; band.connect(gain); gain.connect(out);
      const src = this.noiseSource(band); lfo(band.frequency, 0.4, 350); cleanups.push(() => src.stop());
      cleanups.push(this.schedule(name, () => this.ping(out, 500 + Math.random() * 900, 0.09, 0.09), 160, 520));
    } else if (name === "chuva") {
      const high = filter("highpass", 1800, 0.5), gain = ctx.createGain(); gain.gain.value = 0.32; high.connect(gain); gain.connect(out);
      const src = this.noiseSource(high); cleanups.push(() => src.stop());
      cleanups.push(this.schedule(name, () => this.ping(out, 1500 + Math.random() * 2500, 0.03, 0.05), 40, 140));
    } else if (name === "sinos") {
      cleanups.push(this.schedule(name, () => this.bell(out, PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)], 0.3, 4.5), 1800, 4500));
      this.bell(out, PENTATONIC[2], 0.3, 4.5);
    } else if (name === "gotas") {
      cleanups.push(this.schedule(name, () => this.ping(out, 420 + Math.random() * 700, 0.14, 0.22), 500, 1700));
    }
    this.stops.set(name, () => { out.gain.setTargetAtTime(0, ctx.currentTime, 0.25); window.setTimeout(() => { cleanups.forEach(fn => { try { fn(); } catch { /* já parado */ } }); out.disconnect(); }, 900); });
  }
  stop(name: string) { this.stops.get(name)?.(); this.stops.delete(name); }
  stopAll() { for (const name of [...this.stops.keys()]) this.stop(name); }

  private ping(destination: AudioNode, frequency: number, gain: number, decay: number) {
    const ctx = this.ctx!, now = ctx.currentTime, osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = "sine"; osc.frequency.setValueAtTime(frequency, now); osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + decay * 0.6);
    g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(gain, now + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, now + decay);
    osc.connect(g); g.connect(destination); osc.start(now); osc.stop(now + decay + 0.05);
  }
  private bell(destination: AudioNode, base: number, gain: number, decay: number) {
    const ctx = this.ctx!, now = ctx.currentTime;
    for (const [ratio, level, time] of [[1, 1, 1], [2.76, 0.4, 0.6], [5.4, 0.18, 0.35]] as const) {
      const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = "sine"; osc.frequency.value = base * ratio;
      g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(gain * level, now + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, now + decay * time);
      osc.connect(g); g.connect(destination); osc.start(now); osc.stop(now + decay * time + 0.1);
    }
  }
  /** Um som isolado (para toques e feedback). */
  shot(kind: OneShot, frequency?: number) {
    if (!this.ctx || !this.master) return;
    if (kind === "toque") this.ping(this.master, frequency ?? 700, 0.12, 0.12);
    else if (kind === "gota") this.ping(this.master, frequency ?? 600, 0.16, 0.25);
    else if (kind === "sino") this.bell(this.master, frequency ?? 392, 0.28, 5);
    else this.chirp(this.master, 1);
  }
  private chirp(destination: AudioNode, count: number) {
    const ctx = this.ctx!;
    for (let i = 0; i < count; i++) {
      const t = ctx.currentTime + i * 0.17, osc = ctx.createOscillator(), mod = ctx.createOscillator(), modGain = ctx.createGain(), g = ctx.createGain();
      osc.type = "sine"; osc.frequency.setValueAtTime(2600, t); osc.frequency.exponentialRampToValueAtTime(3700, t + 0.09); osc.frequency.exponentialRampToValueAtTime(3000, t + 0.15);
      mod.frequency.value = 38; modGain.gain.value = 260; mod.connect(modGain); modGain.connect(osc.frequency);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.16, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.connect(g); g.connect(destination); osc.start(t); mod.start(t); osc.stop(t + 0.2); mod.stop(t + 0.2);
    }
  }

  /**
   * Fonte espacial: o som passa por filtro passa-baixa, volume e reverberação conforme a distância (0 = perto, 1 = longe),
   * com pan estéreo. Devolve controles e a função que toca o som escolhido já no espaço.
   */
  spatial() {
    const ctx = this.ctx!, input = ctx.createGain(), low = ctx.createBiquadFilter(), dry = ctx.createGain(), wet = ctx.createGain(), conv = ctx.createConvolver(), pan = ctx.createStereoPanner();
    low.type = "lowpass"; conv.buffer = this.impulse; input.connect(low); low.connect(dry); low.connect(conv); conv.connect(wet); dry.connect(pan); wet.connect(pan); pan.connect(this.master!);
    const set = (distance: number, side = 0) => {
      const d = Math.min(1, Math.max(0, distance)), t = ctx.currentTime;
      dry.gain.setTargetAtTime(Math.pow(1 - d, 1.7) * 0.95 + 0.04, t, 0.12); wet.gain.setTargetAtTime(0.1 + d * 0.9, t, 0.12);
      low.frequency.setTargetAtTime(7500 - d * 6200, t, 0.12); pan.pan.setTargetAtTime(side * (0.2 + d * 0.5), t, 0.12);
    };
    set(0.1);
    return {
      set,
      play: (kind: "passaro" | "sino" | "gota" | "vento") => {
        if (kind === "passaro") this.chirp(input, 3 + Math.floor(Math.random() * 3));
        else if (kind === "sino") this.bell(input, PENTATONIC[Math.floor(Math.random() * 4)] * 0.75, 0.55, 5);
        else if (kind === "gota") this.ping(input, 450 + Math.random() * 600, 0.4, 0.3);
        else { const src = this.ctx!.createBufferSource(), g = ctx.createGain(), band = ctx.createBiquadFilter(); src.buffer = this.noise; band.type = "bandpass"; band.frequency.value = 500; band.Q.value = 0.6; const t = ctx.currentTime; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t + 1.2); g.gain.linearRampToValueAtTime(0, t + 3.4); src.connect(band); band.connect(g); g.connect(input); src.start(t); src.stop(t + 3.5); }
      },
      dispose: () => { input.disconnect(); },
    };
  }
  dispose() { this.stopAll(); void this.ctx?.close().catch(() => undefined); this.ctx = null; this.master = null; this.analyser = null; }
}
