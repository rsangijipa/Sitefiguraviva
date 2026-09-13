/**
 * Gerador de ambiência sonora procedural para o Rio dos Pensamentos.
 * Usa Web Audio API - não requer arquivos de áudio externos.
 * Totalmente opcional, mutado por padrão, respeitando as diretrizes de acessibilidade do Design System Figura Viva.
 */

class RiverAudioEngine {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;

  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 2; // 2 segundos de buffer com loop
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    // Ruído browniano suave (mais profundo e acolhedor que ruído branco)
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // normalização suave
    }
    return buffer;
  }

  public start(): void {
    if (this.isPlaying) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      // Filtro passa-baixo para simular água corrente calma
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(320, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(1.2, this.ctx.currentTime);

      // Controle de ganho suave
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 1.5); // volume sereno

      const buffer = this.createNoiseBuffer(this.ctx);
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;

      this.noiseNode.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.noiseNode.start();
      this.isPlaying = true;
    } catch (e) {
      console.warn('Web Audio não disponível ou restrito pelo navegador:', e);
    }
  }

  public stop(): void {
    if (!this.isPlaying) return;

    try {
      if (this.gainNode && this.ctx) {
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
      }
      setTimeout(() => {
        if (this.noiseNode) {
          this.noiseNode.stop();
          this.noiseNode.disconnect();
          this.noiseNode = null;
        }
        if (this.ctx) {
          this.ctx.close();
          this.ctx = null;
        }
        this.isPlaying = false;
      }, 450);
    } catch {
      this.isPlaying = false;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getActive(): boolean {
    return this.isPlaying;
  }
}

export const riverAudio = new RiverAudioEngine();
