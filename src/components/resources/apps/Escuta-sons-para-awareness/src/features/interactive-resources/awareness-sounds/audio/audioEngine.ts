/**
 * Web Audio Engine para Sons para Awareness
 * Instituto Figura Viva - Registro Confluência
 *
 * Características arquiteturais:
 * - AudioContext instanciado apenas mediante gesto voluntário do usuário.
 * - Volume seguro inicial (ganho 0.2), ajustável sem exibição enganosa de dB.
 * - Transições suaves com rampas de ganho (50ms) para suprimir estalos (pop/click).
 * - Espacialização 3D via PannerNode HRTF com fallback transparente para StereoPannerNode.
 * - Fontes AudioBuffer descartáveis: pausa salva offset, retoma no ponto correto sem duplicar nós.
 * - Gerador de síntese natural de alta fidelidade para os 4 sons (água, folhas, chuva, pássaro)
 *   garantindo funcionamento acústico autêntico e imediato em qualquer ambiente.
 */

import { SoundId, SoundPosition } from '../types';

export interface SpatialEngineStatus {
  active: boolean;
  type: 'hrtf' | 'stereo' | 'none';
  contextState: AudioContextState | 'uninitialized';
  volume: number;
  isMuted: boolean;
  isPlaying: boolean;
  activeSoundId: SoundId | null;
  offsetSeconds: number;
  durationSeconds: number;
}

export class AwarenessAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private spatialPanner: PannerNode | null = null;
  private stereoPanner: StereoPannerNode | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private currentGain: GainNode | null = null;

  private bufferCache = new Map<SoundId, AudioBuffer>();
  private activeSoundId: SoundId | null = null;
  private isPlaying = false;
  private isMuted = false;
  private currentVolume = 0.2; // Volume inicial confortável e seguro
  private previousVolumeBeforeMute = 0.2;
  private startTime = 0;
  private pauseOffset = 0;
  private spatialMode: 'hrtf' | 'stereo' | 'none' = 'none';

  private statusListeners = new Set<(status: SpatialEngineStatus) => void>();

  constructor() {
    // Não inicializa AudioContext no construtor para respeitar política de autoplay
  }

  public subscribe(listener: (status: SpatialEngineStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.getStatus());
    return () => this.statusListeners.delete(listener);
  }

  private notify() {
    const status = this.getStatus();
    this.statusListeners.forEach((fn) => fn(status));
  }

  public getStatus(): SpatialEngineStatus {
    return {
      active: !!this.ctx && this.ctx.state === 'running',
      type: this.spatialMode,
      contextState: this.ctx ? this.ctx.state : 'uninitialized',
      volume: this.currentVolume,
      isMuted: this.isMuted,
      isPlaying: this.isPlaying,
      activeSoundId: this.activeSoundId,
      offsetSeconds: this.pauseOffset,
      durationSeconds: 60,
    };
  }

  /**
   * Ativação explícita do AudioContext por clique do usuário
   */
  public async activateAudio(): Promise<boolean> {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) {
          this.spatialMode = 'none';
          this.notify();
          return false;
        }
        this.ctx = new AudioCtx();
        this.setupAudioGraph();
      }

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.notify();
      return true;
    } catch (e) {
      console.warn('Falha ao ativar AudioContext:', e);
      return false;
    }
  }

  private setupAudioGraph() {
    if (!this.ctx) return;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.currentVolume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Tentativa de PannerNode HRTF 3D
    try {
      if (typeof this.ctx.createPanner === 'function') {
        this.spatialPanner = this.ctx.createPanner();
        this.spatialPanner.panningModel = 'HRTF';
        this.spatialPanner.distanceModel = 'inverse';
        this.spatialPanner.refDistance = 1.0;
        this.spatialPanner.maxDistance = 10.0;
        this.spatialPanner.rolloffFactor = 0.8;
        this.spatialPanner.coneInnerAngle = 360;

        // Ouvinte voltado para frente (Z negativo no padrão Web Audio)
        if (this.ctx.listener.forwardX) {
          this.ctx.listener.forwardX.setValueAtTime(0, this.ctx.currentTime);
          this.ctx.listener.forwardY.setValueAtTime(0, this.ctx.currentTime);
          this.ctx.listener.forwardZ.setValueAtTime(-1, this.ctx.currentTime);
          this.ctx.listener.upX.setValueAtTime(0, this.ctx.currentTime);
          this.ctx.listener.upY.setValueAtTime(1, this.ctx.currentTime);
          this.ctx.listener.upZ.setValueAtTime(0, this.ctx.currentTime);
        } else {
          // Fallback para API antiga
          this.ctx.listener.setOrientation(0, 0, -1, 0, 1, 0);
        }

        this.spatialPanner.connect(this.masterGain);
        this.spatialMode = 'hrtf';
        return;
      }
    } catch {
      // Fallback para StereoPanner
    }

    try {
      if (typeof this.ctx.createStereoPanner === 'function') {
        this.stereoPanner = this.ctx.createStereoPanner();
        this.stereoPanner.connect(this.masterGain);
        this.spatialMode = 'stereo';
      } else {
        this.spatialMode = 'none';
      }
    } catch {
      this.spatialMode = 'none';
    }
  }

  /**
   * Atualiza a posição espacial da fonte sonora
   * x: -1 (esquerda) a +1 (direita)
   * y: -1 (trás) a +1 (frente)
   */
  public updatePosition(pos: SoundPosition) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Distância radial baseada no tier
    let distanceScale = 1.5;
    if (pos.distanceTier === 'perto') distanceScale = 0.8;
    if (pos.distanceTier === 'longe') distanceScale = 3.0;

    // Coordenadas espaciais (X = horizontal, Z = profundidade: frente é -Z, trás é +Z)
    const posX = pos.x * distanceScale;
    const posZ = -pos.y * distanceScale; // Frente = Z negativo
    const posY = 0.0;

    if (this.spatialPanner && this.spatialMode === 'hrtf') {
      try {
        if (this.spatialPanner.positionX) {
          this.spatialPanner.positionX.setTargetAtTime(posX, now, 0.08);
          this.spatialPanner.positionY.setTargetAtTime(posY, now, 0.08);
          this.spatialPanner.positionZ.setTargetAtTime(posZ, now, 0.08);
        } else {
          this.spatialPanner.setPosition(posX, posY, posZ);
        }
      } catch {
        // Fallback defensivo
      }
    } else if (this.stereoPanner && this.spatialMode === 'stereo') {
      try {
        const panValue = Math.max(-1, Math.min(1, pos.x));
        this.stereoPanner.pan.setTargetAtTime(panValue, now, 0.08);
      } catch {
        // Fallback defensivo
      }
    }
  }

  /**
   * Gera organicamente o buffer acústico em alta fidelidade para o som selecionado
   */
  private getOrCreateBuffer(soundId: SoundId): AudioBuffer {
    const cached = this.bufferCache.get(soundId);
    if (cached) return cached;

    if (!this.ctx) {
      throw new Error('AudioContext não inicializado');
    }

    const sampleRate = this.ctx.sampleRate;
    const duration = 60; // 60 segundos de loop natural
    const frameCount = sampleRate * duration;
    const buffer = this.ctx.createBuffer(2, frameCount, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    switch (soundId) {
      case 'agua-corrente':
        // Ruído marrom/rosa filtrado + borbulhas ressonantes senoidais orgânicas
        this.synthesizeFlowingWater(left, right, sampleRate, frameCount);
        break;
      case 'folhas-vento':
        // Frêmito e atrito suave de vento através de folhas com modulação passa-faixa
        this.synthesizeWindLeaves(left, right, sampleRate, frameCount);
        break;
      case 'chuva-suave':
        // Chuva mansa: ruído rosa de fundo acolhedor + microgotas estocásticas
        this.synthesizeSoftRain(left, right, sampleRate, frameCount);
        break;
      case 'passaro-distante':
        // Atmosfera sutil de floresta com trinados melódicos espaçados
        this.synthesizeDistantBird(left, right, sampleRate, frameCount);
        break;
    }

    this.bufferCache.set(soundId, buffer);
    return buffer;
  }

  private synthesizeFlowingWater(left: Float32Array, right: Float32Array, sampleRate: number, len: number) {
    let b0L = 0, b1L = 0, b2L = 0;
    let b0R = 0, b1R = 0, b2R = 0;

    for (let i = 0; i < len; i++) {
      const whiteL = (Math.random() * 2 - 1) * 0.18;
      const whiteR = (Math.random() * 2 - 1) * 0.18;

      // Filtro marrom/rosa suave
      b0L = 0.992 * b0L + whiteL * 0.08;
      b1L = 0.96 * b1L + whiteL * 0.12;
      b2L = 0.88 * b2L + whiteL * 0.18;

      b0R = 0.992 * b0R + whiteR * 0.08;
      b1R = 0.96 * b1R + whiteR * 0.12;
      b2R = 0.88 * b2R + whiteR * 0.18;

      // Textura líquida com modulação sutil
      const mod = 0.8 + 0.2 * Math.sin((i / sampleRate) * 2.5 * Math.PI);
      const bubble = Math.sin((i / sampleRate) * 820 * Math.PI) * (Math.random() > 0.998 ? 0.08 : 0);

      left[i] = (b0L + b1L + b2L) * 0.4 * mod + bubble;
      right[i] = (b0R + b1R + b2R) * 0.4 * mod + bubble * 0.8;
    }
  }

  private synthesizeWindLeaves(left: Float32Array, right: Float32Array, sampleRate: number, len: number) {
    let lastL = 0;
    let lastR = 0;

    for (let i = 0; i < len; i++) {
      const t = i / sampleRate;
      // Rajadas lentas e suaves de vento
      const gust = 0.4 + 0.3 * Math.sin(t * 0.3) + 0.2 * Math.sin(t * 0.8 + 1.2);
      const flutter = 1.0 + 0.15 * Math.sin(t * 12.0);

      const whiteL = (Math.random() * 2 - 1) * 0.12;
      const whiteR = (Math.random() * 2 - 1) * 0.12;

      // Passa-faixa simulado no farfalhar de folhas
      lastL = lastL * 0.92 + whiteL * 0.08;
      lastR = lastR * 0.92 + whiteR * 0.08;

      left[i] = lastL * gust * flutter * 1.2;
      right[i] = lastR * gust * (flutter * 0.9 + 0.1) * 1.2;
    }
  }

  private synthesizeSoftRain(left: Float32Array, right: Float32Array, sampleRate: number, len: number) {
    let pinkL = 0;
    let pinkR = 0;

    for (let i = 0; i < len; i++) {
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;

      pinkL = pinkL * 0.95 + whiteL * 0.05;
      pinkR = pinkR * 0.95 + whiteR * 0.05;

      // Microgotas pontuais estocásticas
      const dropL = Math.random() > 0.997 ? (Math.random() * 0.08) : 0;
      const dropR = Math.random() > 0.997 ? (Math.random() * 0.08) : 0;

      left[i] = pinkL * 0.2 + dropL;
      right[i] = pinkR * 0.2 + dropR;
    }
  }

  private synthesizeDistantBird(left: Float32Array, right: Float32Array, sampleRate: number, len: number) {
    // Ambiente suave de fundo
    for (let i = 0; i < len; i++) {
      left[i] = (Math.random() * 2 - 1) * 0.015;
      right[i] = (Math.random() * 2 - 1) * 0.015;
    }

    // Intervalos de chilreios a cada ~6-10 segundos
    const chirpDuration = 0.28;
    const intervals = [4.5, 11.2, 18.0, 26.5, 34.2, 42.0, 50.5, 57.0];

    intervals.forEach((startTime) => {
      const startSample = Math.floor(startTime * sampleRate);
      const chirpSamples = Math.floor(chirpDuration * sampleRate);

      for (let j = 0; j < chirpSamples && startSample + j < len; j++) {
        const progress = j / chirpSamples;
        // Modulação de frequência do trinado (2800 Hz -> 3600 Hz -> 2600 Hz)
        const freq = 2800 + 800 * Math.sin(progress * Math.PI * 2) + Math.cos(progress * 15) * 200;
        const envelope = Math.sin(progress * Math.PI) * 0.09;
        const t = (startSample + j) / sampleRate;

        const val = Math.sin(2 * Math.PI * freq * t) * envelope;
        left[startSample + j] += val * 0.9;
        right[startSample + j] += val * 0.7; // sutil assimetria espacial
      }
    });
  }

  /**
   * Inicia a reprodução de um som com posição especificada
   */
  public async playSound(soundId: SoundId, position: SoundPosition, startOffsetSeconds?: number): Promise<void> {
    const ready = await this.activateAudio();
    if (!ready || !this.ctx) return;

    // Se já estiver tocando outro som, para o anterior com rampa suave
    if (this.currentSource && this.isPlaying) {
      this.pauseSoundInternal();
    }

    this.activeSoundId = soundId;
    this.updatePosition(position);

    const buffer = this.getOrCreateBuffer(soundId);

    // AudioBufferSourceNode descartável (padrão Web Audio)
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Gain específico com rampa suave para entrada sem cliques
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(1.0, this.ctx.currentTime + 0.05);

    source.connect(gainNode);

    if (this.spatialPanner && this.spatialMode === 'hrtf') {
      gainNode.connect(this.spatialPanner);
    } else if (this.stereoPanner && this.spatialMode === 'stereo') {
      gainNode.connect(this.stereoPanner);
    } else if (this.masterGain) {
      gainNode.connect(this.masterGain);
    }

    const offset = startOffsetSeconds ?? this.pauseOffset;
    source.start(0, offset % buffer.duration);

    this.currentSource = source;
    this.currentGain = gainNode;
    this.startTime = this.ctx.currentTime - offset;
    this.isPlaying = true;

    this.notify();
  }

  private pauseSoundInternal() {
    if (!this.ctx || !this.currentSource || !this.isPlaying) return;

    // Atualiza o offset em segundos
    const elapsed = this.ctx.currentTime - this.startTime;
    this.pauseOffset = elapsed >= 0 ? elapsed % 60 : 0;

    const sourceToStop = this.currentSource;
    const gainToFade = this.currentGain;

    if (gainToFade) {
      try {
        gainToFade.gain.setValueAtTime(gainToFade.gain.value, this.ctx.currentTime);
        gainToFade.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      } catch {
        // Ignora erro se já estiver pausado
      }
    }

    setTimeout(() => {
      try {
        sourceToStop.stop();
        sourceToStop.disconnect();
      } catch {
        // Fonte descartável já parada
      }
    }, 60);

    this.currentSource = null;
    this.currentGain = null;
    this.isPlaying = false;
  }

  public pauseSound() {
    this.pauseSoundInternal();
    this.notify();
  }

  public resumeSound(position: SoundPosition) {
    if (!this.activeSoundId) return;
    this.playSound(this.activeSoundId, position, this.pauseOffset);
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.masterGain && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ctx && this.masterGain) {
      if (this.isMuted) {
        this.previousVolumeBeforeMute = this.currentVolume;
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } else {
        this.masterGain.gain.setValueAtTime(this.previousVolumeBeforeMute, this.ctx.currentTime);
      }
    }
    this.notify();
  }

  /**
   * Encerramento e liberação de recursos
   */
  public stopAndReset() {
    this.pauseSoundInternal();
    this.pauseOffset = 0;
    this.activeSoundId = null;
    this.notify();
  }

  public cleanup() {
    this.stopAndReset();
    this.statusListeners.clear();
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.suspend();
      } catch {
        // Nada a fazer
      }
    }
  }
}

// Instância singleton para ser compartilhada com segurança pelo portal
export const globalAwarenessAudioEngine = new AwarenessAudioEngine();
