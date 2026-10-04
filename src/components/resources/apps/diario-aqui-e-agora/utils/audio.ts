// Web Audio API soft singing chime for mindful transitions
let audioCtx: AudioContext | null = null;

export function playGentleBell(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Harmonic frequencies for a warm, organic meditation bell (Tibetan bowl sound)
    const fundamental = 392.0; // G4
    const partials = [
      { freq: fundamental, gain: 0.12, decay: 2.8 },
      { freq: fundamental * 2.01, gain: 0.04, decay: 2.2 },
      { freq: fundamental * 3.02, gain: 0.02, decay: 1.8 },
    ];

    partials.forEach(({ freq, gain, decay }) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(gain, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + decay + 0.1);
    });
  } catch {
    // Gracefully ignore audio autoplay policies or errors
  }
}
