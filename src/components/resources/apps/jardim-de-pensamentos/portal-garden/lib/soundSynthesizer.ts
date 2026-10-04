// Ambient sound synthesizer using native Web Audio API
// Lightweight, completely safe from broken network asset links, easily paused/muted.

class GardenSoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true; // Audio is strictly optional and starts muted by default
  private masterGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private isRunning: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.initContext();

    if (this.ctx && this.masterGain) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const targetGain = this.isMuted ? 0 : 0.08;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.2);

      if (!this.isMuted && !this.isRunning) {
        this.startGentleDrone();
      }
    }
    return !this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private startGentleDrone() {
    if (!this.ctx || !this.masterGain || this.isRunning) return;
    try {
      this.isRunning = true;
      // Gentle harmonic frequencies tuned to calming natural intervals (D3 & A3)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc2 = this.ctx.createOscillator();

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(146.83, this.ctx.currentTime); // D3

      this.droneOsc2.type = 'sine';
      this.droneOsc2.frequency.setValueAtTime(220.0, this.ctx.currentTime); // A3

      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

      this.droneOsc1.connect(filter);
      this.droneOsc2.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(this.masterGain);

      this.droneOsc1.start();
      this.droneOsc2.start();
    } catch {
      // Ignored if browser audio policy blocks
    }
  }

  // Play a soft wind chime when placing, releasing or contemplating a thought leaf
  public playLeafTone(action: string) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const freqs: Record<string, number> = {
        'deixar-aqui': 293.66, // D4
        'aproximar': 369.99,   // F#4
        'afastar': 440.0,      // A4
        'guardar': 587.33,     // D5
        'soltar': 659.25,      // E5
      };

      const freq = freqs[action] || 329.63; // E4
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.09, now + 0.1);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.8);
    } catch {
      // safe fallback
    }
  }

  public dispose() {
    try {
      if (this.droneOsc1) {
        this.droneOsc1.stop();
        this.droneOsc1.disconnect();
      }
      if (this.droneOsc2) {
        this.droneOsc2.stop();
        this.droneOsc2.disconnect();
      }
      if (this.ctx && this.ctx.state !== 'closed') {
        this.ctx.close();
      }
    } catch {
      // safe cleanup
    }
    this.isRunning = false;
    this.ctx = null;
  }
}

export const soundSynthesizer = new GardenSoundSynthesizer();
