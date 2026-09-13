/**
 * @license
 * Instituto Figura Viva - Serviço de Áudio Ambiental Sintético e Seguro
 * 100% Web Audio API - Sem dependência de microfone, sem gravação, sem downloads pesados.
 */

class WebAudioService {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playGentleStream(): void {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.audioCtx || !this.masterGain) return;

    try {
      // Gerador de ruído rosa filtrado com ressonância suave simulando água corrente de igarapé
      const bufferSize = 2 * this.audioCtx.sampleRate;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.11;
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filtro passa-baixas suave
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, this.audioCtx.currentTime);
      filter.Q.setValueAtTime(1.2, this.audioCtx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.masterGain);
      whiteNoise.start();

      this.noiseNode = whiteNoise;
      this.isPlaying = true;
    } catch (e) {
      console.warn('Web Audio indisponível no navegador:', e);
    }
  }

  public playGentleChime(): void {
    // Tom discreto e acolhedor (não é alarme estridente)
    this.initContext();
    if (!this.audioCtx || this.isMuted) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, this.audioCtx.currentTime); // Dó5 suave
      osc.frequency.exponentialRampToValueAtTime(329.63, this.audioCtx.currentTime + 1.2); // Mi4

      gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1.2);

      osc.connect(gain);
      if (this.masterGain) {
        gain.connect(this.masterGain);
      } else {
        gain.connect(this.audioCtx.destination);
      }

      osc.start();
      osc.stop(this.audioCtx.currentTime + 1.25);
    } catch {
      // Ignora falhas de áudio
    }
  }

  public stop(): void {
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioScheduledSourceNode).stop();
      } catch {
        // Já parado
      }
      this.noiseNode = null;
    }
    this.isPlaying = false;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(
        muted ? 0 : 0.08,
        this.audioCtx.currentTime
      );
    }
    if (muted) {
      this.stop();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const webAudio = new WebAudioService();
