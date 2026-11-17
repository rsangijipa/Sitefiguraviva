/** Detecta WebGL sem manter um contexto aberto (jsdom e dispositivos sem GPU retornam false). */
export function webglSupported(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch { return false; }
}
