import type { ScenePosition } from "../types";

export class AwarenessAudioEngine {
  private context: AudioContext | null = null;
  private gain: GainNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private buffer: AudioBuffer | null = null;
  private startedAt = 0;
  private offset = 0;
  async activate() {
    this.context ??= new AudioContext();
    await this.context.resume();
    this.gain ??= this.context.createGain();
    this.gain.gain.value = 0.2;
    this.gain.connect(this.context.destination);
    return this.context;
  }
  setBuffer(buffer: AudioBuffer) {
    this.buffer = buffer;
    this.offset = 0;
  }
  setVolume(volume: number) {
    if (this.gain && this.context)
      this.gain.gain.linearRampToValueAtTime(
        Math.max(0, Math.min(1, volume)),
        this.context.currentTime + 0.03,
      );
  }
  play(position: ScenePosition = "center") {
    if (!this.context || !this.gain || !this.buffer)
      throw new Error("not_ready");
    this.stop(false);
    const source = this.context.createBufferSource();
    source.buffer = this.buffer;
    const panner = this.context.createPanner();
    panner.panningModel = "HRTF";
    panner.positionX.value =
      position === "left" ? -1 : position === "right" ? 1 : 0;
    panner.positionZ.value = position === "behind" ? 1 : -1;
    source.connect(panner).connect(this.gain);
    source.onended = () => {
      if (this.source === source) this.source = null;
    };
    source.start(0, this.offset);
    this.startedAt = this.context.currentTime;
    this.source = source;
  }
  pause() {
    if (!this.context || !this.source) return;
    this.offset += this.context.currentTime - this.startedAt;
    this.stop(false);
  }
  stop(reset = true) {
    this.source?.stop();
    this.source?.disconnect();
    this.source = null;
    if (reset) this.offset = 0;
  }
  destroy() {
    this.stop();
    this.gain?.disconnect();
    this.gain = null;
    void this.context?.close();
    this.context = null;
  }
}
