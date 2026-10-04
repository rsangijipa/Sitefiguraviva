/**
 * Organic nature sound synthesizer using standard Web Audio API
 * No external sound files, purely procedural, gentle and soothing.
 */
class NatureAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private noiseNode: AudioNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private chimeGain: GainNode | null = null;

  public init() {
    if (this.ctx) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
  }

  public start() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    if (this.isPlaying) return;

    try {
      // Create pink noise buffer for soft leaf rustle & gentle wind
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.035, this.ctx.currentTime + 2.5);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseSource.start();
      this.noiseNode = noiseSource;
      this.filterNode = filter;
      this.gainNode = gain;

      // Master chime bus
      this.chimeGain = this.ctx.createGain();
      this.chimeGain.gain.setValueAtTime(0.045, this.ctx.currentTime);
      this.chimeGain.connect(this.ctx.destination);

      this.isPlaying = true;
    } catch {
      // Ignore if user hasn't interacted yet
    }
  }

  public updateWind(speed: number) {
    if (!this.ctx || !this.filterNode || !this.gainNode) return;
    const targetFreq = 220 + speed * 280;
    const targetGain = 0.015 + speed * 0.04;
    this.filterNode.frequency.setTargetAtTime(
      targetFreq,
      this.ctx.currentTime,
      0.5,
    );
    this.gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.4);
  }

  public playChime(pitchMultiplier = 1) {
    if (!this.ctx || !this.isPlaying || !this.chimeGain) return;
    try {
      const frequencies = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // Pentatonic C Major
      const baseFreq =
        frequencies[Math.floor(Math.random() * frequencies.length)] *
        pitchMultiplier;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        this.ctx.currentTime + 2.8,
      );

      osc.connect(gain);
      gain.connect(this.chimeGain);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 3.0);
    } catch {
      // Audio fallback safe
    }
  }

  public stop() {
    if (!this.ctx || !this.isPlaying) return;
    if (this.gainNode) {
      this.gainNode.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.4);
    }
    setTimeout(() => {
      this.isPlaying = false;
    }, 450);
  }
}

export const natureAudio = new NatureAudioEngine();
