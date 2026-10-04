/**
 * Gerenciador de estado visual da cena do rio.
 * Mantido fora do ciclo do React para evitar re-renderizações por frame.
 * Princípio ético: as frases das folhas existem apenas na memória efêmera da cena;
 * ao saírem do campo de visão, são imediatamente descartadas.
 */

import { LeafThought } from '../../../../types';
import { generateRandomLeaf } from './leafMotion';
import { LeafShaderData } from './riverWebGL';

export interface FluvialSediment {
  id: number;
  x: number; // 0 to 1
  y: number; // 0.1 to 0.9
  speed: number;
  radius: number;
  layer: 'deep' | 'mid' | 'surface';
  opacity: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  tint: 'areia' | 'broto' | 'creme';
}

export class RiverSceneEngine {
  private leaves: LeafThought[] = [];
  private sediments: FluvialSediment[] = [];
  private maxLeaves: number = 8;
  private onLeafExitCallback: ((leaf: LeafThought) => void) | null = null;
  private isPaused: boolean = false;
  private flowSpeedMultiplier: number = 1.0;

  constructor(maxLeaves: number = 8) {
    this.maxLeaves = maxLeaves;
    this.initSediments();
  }

  /**
   * Inicializa partículas e sedimentos orgânicos que derivam em camadas de paralaxe
   */
  private initSediments(): void {
    this.sediments = [];
    const count = 22;
    for (let i = 0; i < count; i++) {
      const layerRank = i % 3;
      const layer: FluvialSediment['layer'] = layerRank === 0 ? 'deep' : layerRank === 1 ? 'mid' : 'surface';
      const tint: FluvialSediment['tint'] = layerRank === 0 ? 'creme' : layerRank === 1 ? 'broto' : 'areia';

      this.sediments.push({
        id: i,
        x: Math.random(),
        y: 0.15 + Math.random() * 0.7,
        speed: (layer === 'deep' ? 0.015 : layer === 'mid' ? 0.028 : 0.038) + Math.random() * 0.01,
        radius: layer === 'deep' ? 1.2 : layer === 'mid' ? 1.8 : 2.4,
        layer,
        opacity: layer === 'deep' ? 0.15 : layer === 'mid' ? 0.28 : 0.45,
        wobbleSpeed: 1.0 + Math.random() * 2.0,
        wobbleAmp: 4 + Math.random() * 8,
        tint,
      });
    }
  }

  public getSediments(): FluvialSediment[] {
    return this.sediments;
  }

  public getSpeedMultiplier(): number {
    return this.flowSpeedMultiplier;
  }

  /**
   * Gera dados de coordenadas normalizadas para os uniforms do WebGL
   */
  public getShaderLeavesData(canvasHeight: number): LeafShaderData[] {
    const h = Math.max(canvasHeight, 1);
    return this.leaves.map(leaf => {
      const yOffset = Math.sin(leaf.xProgress * 12 + leaf.tintSeed) * 16;
      return {
        x: leaf.xProgress,
        y: leaf.yLane + yOffset / h,
        scale: leaf.scale,
        rotation: leaf.rotation,
      };
    });
  }

  public setMaxLeaves(limit: number): void {
    this.maxLeaves = limit;
  }

  public setSpeedMultiplier(multiplier: number): void {
    this.flowSpeedMultiplier = Math.max(0.2, Math.min(multiplier, 2.5));
  }

  public onLeafExit(callback: (leaf: LeafThought) => void): void {
    this.onLeafExitCallback = callback;
  }

  public addLeaf(text: string): { success: boolean; leaf?: LeafThought; reason?: string } {
    if (this.leaves.length >= this.maxLeaves) {
      return {
        success: false,
        reason: 'O rio já acolhe 8 folhas no momento. Aguarde uma delas seguir seu curso.',
      };
    }

    const leaf = generateRandomLeaf(text, this.leaves.length);
    this.leaves.push(leaf);
    return { success: true, leaf };
  }

  public removeLeaf(id: string): boolean {
    const initialLen = this.leaves.length;
    this.leaves = this.leaves.filter(l => l.id !== id);
    return this.leaves.length < initialLen;
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public togglePause(): boolean {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public getLeaves(): LeafThought[] {
    return [...this.leaves];
  }

  public clear(): void {
    this.leaves = [];
  }

  /**
   * Atualiza a posição de cada folha com base no delta time em segundos
   */
  public update(deltaTime: number): void {
    if (this.isPaused) return;

    // Limita dt máximo para evitar saltos se o frame demorar
    const clampedDt = Math.min(deltaTime, 0.1);

    const survivingLeaves: LeafThought[] = [];

    for (const leaf of this.leaves) {
      // Progresso normalizado de 0 a 1 atravessa o rio
      leaf.xProgress += leaf.speed * this.flowSpeedMultiplier * clampedDt;
      leaf.rotation += leaf.angularVelocity * clampedDt;

      // Se a folha cruzou completamente a margem direita
      if (leaf.xProgress >= 1.06) {
        if (this.onLeafExitCallback) {
          this.onLeafExitCallback(leaf);
        }
        // Folha é descartada da memória
      } else {
        survivingLeaves.push(leaf);
      }
    }

    this.leaves = survivingLeaves;

    // Atualiza partículas e sedimentos que fluem no rio em paralaxe
    for (const sed of this.sediments) {
      sed.x += sed.speed * this.flowSpeedMultiplier * clampedDt;
      if (sed.x > 1.05) {
        sed.x = -0.05;
        sed.y = 0.15 + Math.random() * 0.7; // reorganiza altura
      }
    }
  }
}
