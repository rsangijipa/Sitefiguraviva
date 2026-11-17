"use client";

type Sound = {source:AudioBufferSourceNode|null;gain:GainNode;buffer:AudioBuffer;offset:number;startedAt:number;volume:number};
class ResourceAudioManager {
  private context: AudioContext | null = null;
  private channels = new Map<string, Sound>();
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
  private notify(){if(typeof window!=="undefined")window.dispatchEvent(new Event("fv:resource-audio-state"));}
  getPlayback(channel:string){
    const sound=this.channels.get(channel);
    if(!sound)return null;
    return {paused:!sound.source,duration:sound.buffer.duration,position:Math.min(sound.buffer.duration,sound.offset+(sound.source && this.context ? this.context.currentTime-sound.startedAt : 0)),volume:sound.volume};
  }
  pause(channel:string){
    const sound=this.channels.get(channel);
    if(!sound?.source || !this.context)return;
    sound.offset=Math.min(sound.buffer.duration,sound.offset+this.context.currentTime-sound.startedAt);
    sound.source.onended=null;sound.source.stop();sound.source.disconnect();sound.source=null;
    this.notify();
  }
  async resume(channel:string){
    const sound=this.channels.get(channel);
    if(!sound || sound.source || this.muted || document.hidden || !this.context)return false;
    if(Array.from(document.querySelectorAll("video,audio")).some(element=>element instanceof HTMLMediaElement && !element.paused && !element.muted))return false;
    await this.context.resume();
    if(this.channels.get(channel)!==sound || this.muted || document.hidden)return false;
    this.start(channel,sound);return true;
  }
  setVolume(channel:string,volume:number){
    const sound=this.channels.get(channel);
    if(!sound || !this.context)return;
    sound.volume=Math.max(0,Math.min(1,volume));
    sound.gain.gain.setTargetAtTime(sound.volume*.5,this.context.currentTime,.05);
    this.notify();
  }
  private start(channel:string,sound:Sound){
    const context=this.context;
    if(!context)return;
    const source=context.createBufferSource();source.buffer=sound.buffer;
    source.connect(sound.gain);sound.source=source;sound.startedAt=context.currentTime;
    source.onended=()=>{
      source.disconnect();
      if(this.channels.get(channel)?.source===source){sound.gain.disconnect();this.channels.delete(channel);this.notify();}
    };
    source.start(0,sound.offset);this.notify();
  }
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
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(.15, this.context.currentTime + .1);
    gain.connect(this.context.destination);
    const sound:Sound={source:null,gain,buffer,offset:0,startedAt:0,volume:.3};
    this.channels.set(channel,sound);
    this.start(channel,sound);
    return true;
  }
  stop(channel: string) {
    this.pending.get(channel)?.abort(); this.pending.delete(channel);
    const sound = this.channels.get(channel);
    if (!sound) return;
    this.channels.delete(channel);
    if(sound.source){sound.source.onended=null;try { sound.source.stop(); } catch { /* already ended */ }sound.source.disconnect();}
    sound.gain.disconnect();this.notify();
  }
  stopAll() { for (const key of new Set([...this.channels.keys(), ...this.pending.keys()])) this.stop(key); }
}
export const resourceAudioManager = new ResourceAudioManager();
