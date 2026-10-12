"use client";

class ResourceAudioManager {
  private context: AudioContext | null = null;
  private channels = new Map<string, { source: AudioBufferSourceNode; gain: GainNode }>();
  private muted = true;
  private listening = false;
  private pending = new Map<string, AbortController>();
  async activateFromGesture() {
    if (typeof window === "undefined" || !window.AudioContext) return false;
    this.context ??= new AudioContext();
    if (!this.listening) {
      document.addEventListener("visibilitychange", () => { if (document.hidden) this.stopAll(); });
      window.addEventListener("fv:lesson-audio-start", () => this.mute());
      document.addEventListener("play", event => { if (event.target instanceof HTMLMediaElement) this.mute(); }, true);
      this.listening = true;
    }
    await this.context.resume();
    this.muted = false;
    return true;
  }
  isMuted() { return this.muted; }
  mute() { this.muted = true; this.stopAll(); if(typeof window!=="undefined")window.dispatchEvent(new Event("fv:resource-audio-muted")); }
  async play(channel: string, path: string) {
    if (this.muted || !this.context || document.hidden) return false;
    // Lessons have priority even when an older player does not emit the event.
    if (Array.from(document.querySelectorAll("video,audio")).some(element => element instanceof HTMLMediaElement && !element.paused && !element.muted)) return false;
    if (!/^\/brand\/audio\/[a-zA-Z0-9/_-]+\.(mp3|ogg|wav)$/.test(path)) return false;
    this.stop(channel);
    const controller = new AbortController(); this.pending.set(channel, controller);
    const response = await fetch(path, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]) });
    if (!response.ok) return false;
    const buffer = await this.context.decodeAudioData(await response.arrayBuffer());
    if (this.muted || document.hidden || controller.signal.aborted || this.pending.get(channel) !== controller || document.documentElement.dataset.lessonAudioPlaying === "true") return false;
    this.pending.delete(channel);
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(0, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(.15, this.context.currentTime + .1);
    source.connect(gain); gain.connect(this.context.destination);
    this.channels.set(channel, { source, gain });
    source.onended = () => { source.disconnect(); gain.disconnect(); if (this.channels.get(channel)?.source === source) this.channels.delete(channel); };
    source.start();
    return true;
  }
  stop(channel: string) {
    this.pending.get(channel)?.abort(); this.pending.delete(channel);
    const sound = this.channels.get(channel);
    if (!sound) return;
    this.channels.delete(channel);
    try { sound.source.stop(); } catch { /* already ended */ }
    sound.source.disconnect(); sound.gain.disconnect();
  }
  stopAll() { for (const key of new Set([...this.channels.keys(), ...this.pending.keys()])) this.stop(key); }
}
export const resourceAudioManager = new ResourceAudioManager();
