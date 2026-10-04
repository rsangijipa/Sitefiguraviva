// Web Audio API gentle mindfulness chime and Web Speech API narration helper

class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private isPaused = false;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play a soft, organic Tibetan singing bowl / meditative chime
  public playChime(pitchModifier: number = 1.0) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const baseFreq = 440 * pitchModifier;

      // Master gain node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.2, now + 0.04);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
      masterGain.connect(ctx.destination);

      // Main fundamental harmonic
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.connect(masterGain);
      osc1.start(now);
      osc1.stop(now + 1.6);

      // Soft overtone
      const overtoneGain = ctx.createGain();
      overtoneGain.gain.setValueAtTime(0.0001, now);
      overtoneGain.gain.exponentialRampToValueAtTime(0.08, now + 0.03);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      overtoneGain.connect(ctx.destination);

      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(baseFreq * 2.02, now); // subtle beating shimmer
      osc2.connect(overtoneGain);
      osc2.start(now);
      osc2.stop(now + 1.2);
    } catch {
      // AudioContext policy gracefully caught
    }
  }

  // Speech narration
  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: () => void,
  ) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onError?.();
      return;
    }

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    utterance.lang = "pt-BR";
    utterance.rate = 0.88; // Calm, deliberate pacing
    utterance.pitch = 0.98; // Natural tone

    // Try finding Portuguese voice
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find((v) => v.lang.toLowerCase().includes("pt"));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      onError?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public pauseSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        this.isPaused = true;
      }
    }
  }

  public resumeSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        this.isPaused = false;
      }
    }
  }

  public stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
    }
  }

  public getSpeakingState() {
    return {
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
    };
  }
}

export const soundEngine = new SoundEngine();
