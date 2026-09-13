/**
 * @license
 * Instituto Figura Viva - Motor Reativo do Rio dos Pensamentos
 * Barramento reativo em tempo real (Reactive Stream / Subject Pattern).
 * Emite pulsos hídricos, coordenadas de folhas/seixos flutuantes e eventos de dissolução.
 */

import { FloatingThought, RiverSpeed } from '../../../types';

export interface RiverWaterRipple {
  id: string;
  x: number;
  y: number;
  radius: number;
  opacity: number;
}

export interface RiverStreamState {
  thoughts: FloatingThought[];
  ripples: RiverWaterRipple[];
  speed: RiverSpeed;
  speedMultiplier: number;
  totalReleasedCount: number;
  isStreaming: boolean;
}

type StreamSubscriber = (state: RiverStreamState) => void;

export class RiverStreamEngine {
  private thoughts: FloatingThought[] = [];
  private ripples: RiverWaterRipple[] = [];
  private speed: RiverSpeed = 'serene';
  private totalReleasedCount: number = 0;
  private isStreaming: boolean = false;
  private subscribers: Set<StreamSubscriber> = new Set();
  private rafId: number | null = null;
  private lastTickTime: number = performance.now();

  constructor() {
    // Inicializa com duas sementes contemplativas neutras
    this.depositThought('O momento presente', 'observacao');
  }

  public subscribe(subscriber: StreamSubscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber(this.getState());

    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notify() {
    const currentState = this.getState();
    this.subscribers.forEach(sub => {
      try {
        sub(currentState);
      } catch (e) {
        console.error('Erro no subscriber do rio:', e);
      }
    });
  }

  public getState(): RiverStreamState {
    return {
      thoughts: [...this.thoughts],
      ripples: [...this.ripples],
      speed: this.speed,
      speedMultiplier: this.getSpeedMultiplier(),
      totalReleasedCount: this.totalReleasedCount,
      isStreaming: this.isStreaming,
    };
  }

  public setSpeed(speed: RiverSpeed) {
    this.speed = speed;
    this.notify();
  }

  private getSpeedMultiplier(): number {
    switch (this.speed) {
      case 'still':
        return 0.15;
      case 'calm':
        return 0.5;
      case 'serene':
      default:
        return 0.85;
    }
  }

  public depositThought(text: string, category: FloatingThought['category'] = 'livre') {
    const tones: FloatingThought['colorTone'][] = ['areia', 'folha', 'seixo', 'creme'];
    const selectedTone = tones[Math.floor(Math.random() * tones.length)];

    const newThought: FloatingThought = {
      id: 'thought-' + Math.random().toString(36).substring(2, 9),
      text: text.trim().slice(0, 120),
      category,
      colorTone: selectedTone,
      positionX: 20 + Math.random() * 60, // 20% a 80% da largura
      positionY: -5, // Inicia no topo do rio
      speed: (0.4 + Math.random() * 0.3),
      rotation: (Math.random() - 0.5) * 16,
      createdAt: performance.now(),
      dissolved: false,
    };

    this.thoughts.push(newThought);
    this.totalReleasedCount += 1;

    // Cria ondulação suave onde a folha pousou
    this.addRipple(newThought.positionX, 5);

    this.notify();
  }

  public dissolveThought(id: string) {
    const target = this.thoughts.find(t => t.id === id);
    if (target) {
      this.addRipple(target.positionX, target.positionY);
      this.thoughts = this.thoughts.filter(t => t.id !== id);
      this.notify();
    }
  }

  private addRipple(x: number, y: number) {
    const newRipple: RiverWaterRipple = {
      id: 'rip-' + Math.random().toString(36).substring(2, 7),
      x,
      y,
      radius: 5,
      opacity: 0.7,
    };
    this.ripples.push(newRipple);
  }

  public start() {
    if (this.isStreaming) return;
    this.isStreaming = true;
    this.lastTickTime = performance.now();

    const loop = (currentTime: number) => {
      if (!this.isStreaming) return;
      const deltaTime = (currentTime - this.lastTickTime) / 1000;
      this.lastTickTime = currentTime;

      const speedMult = this.getSpeedMultiplier();

      // Atualiza pensamentos
      let changed = false;
      const remainingThoughts: FloatingThought[] = [];

      for (const thought of this.thoughts) {
        // Desloca para baixo ao longo da correnteza
        const newY = thought.positionY + (thought.speed * 8 * speedMult * deltaTime * 10);
        // Leve oscilação lateral orgânica da correnteza
        const wobble = Math.sin((currentTime / 1000) + thought.createdAt) * 0.05;
        const newX = Math.max(10, Math.min(90, thought.positionX + wobble));

        if (newY > 105) {
          // Dissolveu naturalmente no final do curso das águas
          this.addRipple(newX, 98);
          changed = true;
        } else {
          remainingThoughts.push({
            ...thought,
            positionY: newY,
            positionX: newX,
            rotation: thought.rotation + (wobble * 0.5),
          });
        }
      }

      if (remainingThoughts.length !== this.thoughts.length) {
        changed = true;
      }
      this.thoughts = remainingThoughts;

      // Atualiza ondulações
      const remainingRipples: RiverWaterRipple[] = [];
      for (const rip of this.ripples) {
        const nextRadius = rip.radius + (35 * deltaTime);
        const nextOpacity = rip.opacity - (0.5 * deltaTime);
        if (nextOpacity > 0.02 && nextRadius < 80) {
          remainingRipples.push({
            ...rip,
            radius: nextRadius,
            opacity: nextOpacity,
          });
        }
      }
      this.ripples = remainingRipples;

      // Notifica os componentes reativos
      this.notify();

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  public pause() {
    this.isStreaming = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.notify();
  }

  public destroy() {
    this.pause();
    this.subscribers.clear();
    this.thoughts = [];
    this.ripples = [];
  }
}
