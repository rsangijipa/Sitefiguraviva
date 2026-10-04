/**
 * Serviço de Áudio Contemplativo - Instituto Figura Viva
 * Utiliza Web Audio API pura para gerar tons orgânicos sutis (sinos de meditação/campânula).
 * Áudio estritamente opcional com controle de silenciamento.
 */

class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true; // Padrão silenciado para conforto inicial

  constructor() {
    // Inicialização sob demanda para respeitar políticas de reprodução dos navegadores
    try {
      const storedMute = localStorage.getItem('figura_viva_audio_muted');
      if (storedMute !== null) {
        this.isMuted = storedMute === 'true';
      }
    } catch {
      this.isMuted = true;
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('figura_viva_audio_muted', String(this.isMuted));
    } catch {}
    if (!this.isMuted) {
      this.initContext();
      this.playHarmonicTone(440, 0.05, 0.4);
    }
    return this.isMuted;
  }

  /**
   * Toca um tom harmônico sutil ao selecionar uma família ou emoção
   */
  public playSelectTone(level: 1 | 2 | 3 = 1): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const baseFrequencies = {
      1: 329.63, // E4 - Família
      2: 440.00, // A4 - Secundária
      3: 523.25, // C5 - Nuance
    };

    const freq = baseFrequencies[level] || 440;
    this.playHarmonicTone(freq, 0.08, 0.6);
  }

  /**
   * Toca uma ressonância suave de sino contemplativo
   */
  public playChime(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.playHarmonicTone(528, 0.06, 1.2);
  }

  private playHarmonicTone(frequency: number, gainValue: number, durationSeconds: number) {
    try {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Oscilador senoidal puro (timbre orgânico e suave)
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);

      gainNode.gain.setValueAtTime(0, now);
      // Ataque suave
      gainNode.gain.linearRampToValueAtTime(gainValue, now + 0.04);
      // Decaimento exponencial longo
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durationSeconds);
    } catch {
      // Degradação graciosa caso a API esteja indisponível
    }
  }

  public dispose(): void {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export const audioService = new AudioService();
