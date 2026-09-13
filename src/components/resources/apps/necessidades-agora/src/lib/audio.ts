/**
 * Gerenciador de áudio ambiental e avisos sonoros opcionais
 * Utiliza síntese de ondas puras (Web Audio API) sem carregar arquivos pesados.
 * Respeita preferências do usuário e desligamento completo ao desmontar.
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true; // Sempre desmutado somente sob escolha explícita

  constructor() {
    // Inicialização atrasada para evitar avisos de autoplay do navegador
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!muted && !this.ctx) {
      this.initContext();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private initContext() {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    } catch {
      // Audio context não disponível
    }
  }

  /**
   * Toca um sino sutil e orgânico na frequência indicada (ex: 432Hz ou 528Hz)
   */
  public playGentleChime(freq = 432, duration = 0.8) {
    if (this.isMuted) return;
    try {
      if (!this.ctx) {
        this.initContext();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Fade-in e fade-out ultra suave
      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Falha silenciosa em caso de restrição do navegador
    }
  }

  public stopAll() {
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch {
        // Ignora erro de fechamento
      }
      this.ctx = null;
    }
  }
}

export const audioManager = new AudioManager();
