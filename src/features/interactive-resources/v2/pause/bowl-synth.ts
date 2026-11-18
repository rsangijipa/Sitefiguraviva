/** Tigelas tibetanas sintetizadas no navegador (sem arquivo de áudio nem licença): parciais inarmônicos com batimento suave. */
const NOTES = [174.6, 196, 220, 261.6, 293.7];
const PARTIALS = [{ ratio: 1, gain: 0.55, decay: 11 }, { ratio: 2.71, gain: 0.26, decay: 7 }, { ratio: 5.19, gain: 0.13, decay: 4 }, { ratio: 8.4, gain: 0.06, decay: 2.2 }];

export class BowlSynth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private volume = 0.5;
  playing = false;

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain(); this.master.gain.value = this.volume * 0.6;
    const filter = this.ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 4200;
    this.master.connect(filter); filter.connect(this.ctx.destination);
    return this.ctx;
  }
  setVolume(value: number) { this.volume = value; this.master?.gain.setTargetAtTime(value * 0.6, this.ctx?.currentTime ?? 0, 0.05); }
  /** Uma batida de tigela; pode ser chamada à mão. */
  strike() {
    const ctx = this.ensure(); void ctx.resume();
    if (!this.master) return;
    const base = NOTES[Math.floor(Math.random() * NOTES.length)], now = ctx.currentTime;
    for (const partial of PARTIALS) {
      for (const detune of [1, 1.0035]) {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = "sine"; osc.frequency.value = base * partial.ratio * detune;
        gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime((partial.gain / 2) * 0.9, now + 0.012); gain.gain.exponentialRampToValueAtTime(0.0001, now + partial.decay);
        osc.connect(gain); gain.connect(this.master); osc.start(now); osc.stop(now + partial.decay + 0.3);
      }
    }
  }
  start() {
    this.playing = true; this.strike();
    const loop = () => { this.timer = window.setTimeout(() => { if (!this.playing) return; this.strike(); loop(); }, 11000 + Math.random() * 6000); };
    loop();
  }
  stop() { this.playing = false; if (this.timer) { clearTimeout(this.timer); this.timer = null; } }
  dispose() { this.stop(); void this.ctx?.close().catch(() => undefined); this.ctx = null; this.master = null; }
}
