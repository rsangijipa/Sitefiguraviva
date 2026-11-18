import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Compatibilidade das cenas portadas (escritas para three r128) com o three atual:
 * luzes físicas (×π), decaimento legado das luzes pontuais, codificação de saída
 * e gestão de cor desativada enquanto a cena existe. Tudo é desfeito em dispose().
 */
export interface LegacyRuntime { THREE: Record<string, unknown>; dispose(): void }

export function createLegacyRuntime(): LegacyRuntime {
  const previousColorManagement = T.ColorManagement.enabled;
  T.ColorManagement.enabled = false;
  const renderers: T.WebGLRenderer[] = [];
  const PI = Math.PI;

  class WebGLRenderer extends T.WebGLRenderer {
    constructor(options?: T.WebGLRendererParameters) {
      super(options); renderers.push(this); this.outputColorSpace = T.LinearSRGBColorSpace;
    }
    set outputEncoding(value: number) { this.outputColorSpace = value === 3001 ? T.SRGBColorSpace : T.LinearSRGBColorSpace; }
    get outputEncoding() { return this.outputColorSpace === T.SRGBColorSpace ? 3001 : 3000; }
  }
  class AmbientLight extends T.AmbientLight { constructor(c?: T.ColorRepresentation, i = 1) { super(c, i * PI); } }
  class HemisphereLight extends T.HemisphereLight { constructor(s?: T.ColorRepresentation, g?: T.ColorRepresentation, i = 1) { super(s, g, i * PI); } }
  class DirectionalLight extends T.DirectionalLight { constructor(c?: T.ColorRepresentation, i = 1) { super(c, i * PI); } }
  class PointLight extends T.PointLight { constructor(c?: T.ColorRepresentation, i = 1, d = 0) { super(c, i * PI, d, 0); } }
  class SpotLight extends T.SpotLight { constructor(c?: T.ColorRepresentation, i = 1, d = 0, a = PI / 3, p = 0) { super(c, i * PI, d, a, p, 0); } }

  const THREE = { ...T, OrbitControls, WebGLRenderer, AmbientLight, HemisphereLight, DirectionalLight, PointLight, SpotLight, sRGBEncoding: 3001, LinearEncoding: 3000 };
  return {
    THREE,
    dispose() {
      for (const renderer of renderers) { renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); }
      T.ColorManagement.enabled = previousColorManagement;
    },
  };
}

/** Ambiente de execução de uma cena legada: contêiner, temporizadores, eventos e áudio rastreados. */
export function createSceneEnv(root: HTMLElement) {
  const cleanups: (() => void)[] = [];
  let disposed = false;
  const audioContexts: AudioContext[] = [];
  const container = () => root.querySelector<HTMLElement>('[id="canvas-container"]');
  const env = {
    $: (id: string) => root.querySelector<HTMLElement>(`[id="${id}"]`),
    qsa: (selector: string) => root.querySelectorAll<HTMLElement>(selector),
    W: () => Math.max(1, container()?.clientWidth ?? root.clientWidth),
    H: () => Math.max(1, container()?.clientHeight ?? root.clientHeight),
    raf: (callback: FrameRequestCallback) => { if (disposed) return 0; return window.requestAnimationFrame(callback); },
    interval: (callback: () => void, ms?: number) => { const id = window.setInterval(callback, ms); cleanups.push(() => window.clearInterval(id)); return id; },
    timeout: (callback: () => void, ms?: number) => { const id = window.setTimeout(callback, ms); cleanups.push(() => window.clearTimeout(id)); return id; },
    listen: (type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => { window.addEventListener(type, handler, options); cleanups.push(() => window.removeEventListener(type, handler, options)); },
    audio: (): AudioContext => {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor(); audioContexts.push(ctx); return ctx;
    },
    isDisposed: () => disposed,
  };
  return { env, dispose() { disposed = true; cleanups.forEach(fn => fn()); audioContexts.forEach(ctx => { void ctx.close().catch(() => undefined); }); } };
}
export type SceneEnv = ReturnType<typeof createSceneEnv>["env"];
