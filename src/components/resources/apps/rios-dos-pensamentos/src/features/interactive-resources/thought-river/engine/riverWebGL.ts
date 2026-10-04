/**
 * Motor de Renderização WebGL - Rio dos Pensamentos
 * Instituto Figura Viva - Design System Confluência v1.0
 * 
 * Simula em alta performance e baixa latência:
 * - Camada 1: Leito fluvial profundo com correntes térmicas em Verde Igarapé (#07614C) e Verde Raiz (#005A1F)
 * - Camada 2: Filamentos de correnteza com deslocamento longitudinal e paralaxe
 * - Camada 3: Marolas e reflexos difusos de superfície
 * - Camada 4: Estelas e vórtices interativos ao redor das folhas flutuantes
 * - Camada 5: Margens fluviais em Areia (#F1E9DB) e contorno em Terra Barro (#96551F)
 * 
 * Desmontagem segura: cancela buffers, shaders e trata contexto perdido/restaurado.
 */

export interface LeafShaderData {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  // Inverte Y para sincronizar com o sistema de coordenadas do Canvas
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec2 v_uv;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_flow_speed;
uniform vec4 u_leaves[8]; // [x, y, scale, rotation]
uniform int u_leaf_count;
uniform vec3 u_pointer;   // [x, y, intensity]
uniform int u_ambience;   // 0: Manhã Serena, 1: Tarde Dourada, 2: Crepúsculo

// Paleta Confluência em espaço linear aproximado
const vec3 C_DEEP = vec3(0.027, 0.380, 0.298);       // Verde Igarapé #07614C
const vec3 C_DARK = vec3(0.0, 0.353, 0.122);         // Verde Raiz #005A1F
const vec3 C_MID = vec3(0.040, 0.440, 0.345);        // Verde Correnteza #0a6d56
const vec3 C_LIGHT = vec3(0.055, 0.510, 0.400);      // Verde Água Suave #0d7d63
const vec3 C_SAND = vec3(0.945, 0.914, 0.859);       // Areia #F1E9DB
const vec3 C_EARTH = vec3(0.588, 0.333, 0.122);      // Terra Barro #96551F
const vec3 C_CREME = vec3(0.992, 0.980, 0.957);      // Creme Papel #FDFAF4
const vec3 C_GOLD = vec3(0.890, 0.720, 0.420);       // Sol Dourado suave
const vec3 C_MOSS = vec3(0.005, 0.420, 0.180);       // Musgo Fluvial
const vec3 C_TWILIGHT = vec3(0.080, 0.220, 0.260);   // Tom crepuscular

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);

  // 1. Definição das Margens Fluviais Meandrosas (Top e Bottom)
  float topBank = 0.078 + sin(uv.x * 3.8 + u_time * 0.18) * 0.014 + cos(uv.x * 7.5) * 0.007;
  float bottomBank = 0.922 - sin(uv.x * 3.2 + u_time * 0.22) * 0.014 - cos(uv.x * 6.5) * 0.007;

  // Se o pixel estiver na margem de areia externa
  if (uv.y < topBank - 0.014 || uv.y > bottomBank + 0.014) {
    // Textura sutil de grãos minerais na areia
    float sandGrain = sin(uv.x * 240.0) * cos(uv.y * 240.0) * 0.03;
    gl_FragColor = vec4(clamp(C_SAND + sandGrain, 0.0, 1.0), 1.0);
    return;
  }

  // Linhas delimitadoras em Terra Barro (#96551F)
  float distToTopBank = abs(uv.y - topBank);
  float distToBottomBank = abs(uv.y - bottomBank);
  if (distToTopBank < 0.006 || distToBottomBank < 0.006) {
    gl_FragColor = vec4(C_EARTH, 1.0);
    return;
  }

  // 2. Campo de Fluxo e Coordenadas de Correnteza Longitudinal (Eixo X)
  float flowTime = u_time * (0.038 * u_flow_speed);
  float flowX = uv.x - flowTime;
  float flowY = uv.y;

  // Ondulações térmicas profundas em frequências harmônicas
  float wave1 = sin(flowX * 7.5 + sin(flowY * 10.0 + u_time * 0.4) * 1.6);
  float wave2 = sin(flowX * 15.0 - flowY * 5.5 + u_time * 0.65);
  float wave3 = cos(flowX * 22.0 + flowY * 13.0 + u_time * 1.05);
  float deepCurrent = (wave1 * 0.48 + wave2 * 0.32 + wave3 * 0.20);

  // Gradiente base: Centro do rio mais profundo, margens ligeiramente mais claras
  float riverDepth = smoothstep(0.0, 0.35, min(uv.y - topBank, bottomBank - uv.y));
  vec3 baseTone = mix(C_MID, C_DEEP, riverDepth);
  vec3 waterColor = mix(baseTone, C_DARK, clamp(deepCurrent * 0.5 + 0.5, 0.0, 1.0) * 0.45);

  // 3. Vegetação Aquática Submersa (Macrófitas e Algas Fluviais)
  // Plantas no fundo balançando ritmicamente com o fluxo d'água
  float weedX1 = uv.x * 12.0;
  float sway1 = sin(u_time * 1.8 + uv.y * 8.0) * 0.02;
  float weed1 = smoothstep(0.015, 0.0, abs(fract(weedX1 + sway1) - 0.5));
  float weedMask1 = weed1 * smoothstep(topBank + 0.18, topBank + 0.02, uv.y) * 0.38;
  waterColor = mix(waterColor, C_MOSS, weedMask1);

  float weedX2 = (uv.x + 0.35) * 10.0;
  float sway2 = cos(u_time * 1.5 + uv.y * 7.0) * 0.025;
  float weed2 = smoothstep(0.018, 0.0, abs(fract(weedX2 + sway2) - 0.5));
  float weedMask2 = weed2 * smoothstep(bottomBank - 0.20, bottomBank - 0.02, uv.y) * 0.35;
  waterColor = mix(waterColor, C_DARK, weedMask2);

  // 4. Caústicas Fluviais (Rede de Refração Solar no Fundo do Lago/Rio)
  vec2 cUV1 = uv * vec2(aspect * 8.0, 8.0) - vec2(flowTime * 2.2, 0.0);
  vec2 cUV2 = uv * vec2(aspect * 12.0, 12.0) - vec2(flowTime * 3.1, flowTime * 0.5);
  float cWave1 = sin(cUV1.x + sin(cUV1.y * 1.4 + u_time * 0.8));
  float cWave2 = cos(cUV2.y + sin(cUV2.x * 1.3 - u_time * 0.7));
  float caustics = pow(max(0.0, sin(cWave1 + cWave2) * 0.5 + 0.5), 4.2);
  vec3 causticColor = u_ambience == 1 ? C_GOLD : C_CREME;
  waterColor += causticColor * (caustics * 0.20 * riverDepth);

  // 5. Camada de Filamentos e Veios de Água Intermediários
  float filament1 = sin(uv.y * 36.0 + sin(flowX * 4.2) * 2.1 + u_time * 0.5);
  float filMask1 = smoothstep(0.70, 0.95, filament1);
  waterColor = mix(waterColor, C_MID, filMask1 * 0.30);

  float filament2 = sin(uv.y * 58.0 + cos(flowX * 6.5) * 2.5 - u_time * 0.75);
  float filMask2 = smoothstep(0.76, 0.98, filament2);
  waterColor = mix(waterColor, C_LIGHT, filMask2 * 0.25);

  // 6. Feixes de Luz Solar Filtrada (Sunbeams / Dappled Light através da mata ciliar)
  float sunDapple = sin((uv.x * 1.8 + uv.y * 0.8) * 4.0 + u_time * 0.15) *
                    cos((uv.x * 0.9 - uv.y * 1.2) * 3.0 + u_time * 0.12);
  float dappleMask = smoothstep(0.35, 0.88, sunDapple);
  vec3 dappleTint = u_ambience == 1 ? C_GOLD : C_CREME;
  waterColor += dappleTint * (dappleMask * (u_ambience == 1 ? 0.14 : 0.08));

  // 7. Marolas de Superfície e Brilho Especular Difuso
  float ripple = sin((uv.x + uv.y * 0.45) * 42.0 - u_time * 2.3) * 
                 cos((uv.x * 0.65 - uv.y) * 32.0 + u_time * 1.7);
  float rippleMask = smoothstep(0.55, 0.92, ripple);
  waterColor = mix(waterColor, C_CREME, rippleMask * 0.08);

  // 8. Ondulações Interativas do Ponteiro / Mouse
  if (u_pointer.z > 0.01) {
    vec2 ptrDelta = vec2((uv.x - u_pointer.x) * aspect, uv.y - u_pointer.y);
    float ptrDist = length(ptrDelta);
    if (ptrDist < 0.26) {
      float ptrWave = sin(ptrDist * 70.0 - u_time * 5.5) * exp(-ptrDist * 14.0) * u_pointer.z;
      waterColor += C_CREME * clamp(ptrWave * 0.35, -0.15, 0.45);
    }
  }

  // 9. Camada de Vórtices e Estelas Hidrodinâmicas das Folhas Flutuantes
  float leafDisturbance = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= u_leaf_count) break;
    vec4 leaf = u_leaves[i];
    
    vec2 delta = vec2((uv.x - leaf.x) * aspect, uv.y - leaf.y);
    float dist = length(delta);

    // Marolas concêntricas emanando da folha
    if (dist < 0.18) {
      float leafWave = sin(dist * 78.0 - u_time * 3.6) * exp(-dist * 16.0);
      
      // Esteira de água alongada à esquerda (popa da folha)
      float wakeX = (leaf.x - uv.x);
      if (wakeX > 0.0 && wakeX < 0.24 && abs(delta.y) < 0.042) {
        float wakeDecay = (1.0 - wakeX / 0.24) * (1.0 - abs(delta.y) / 0.042);
        float wakeFlow = sin(wakeX * 38.0 - u_time * 3.2) * wakeDecay;
        leafWave += wakeFlow * 0.85;
      }

      leafDisturbance += clamp(leafWave, -0.45, 0.65) * 0.40;
    }
  }

  waterColor += C_CREME * clamp(leafDisturbance, 0.0, 0.45) * 0.35;
  waterColor -= C_DARK * clamp(-leafDisturbance, 0.0, 0.35) * 0.22;

  // 10. Espuma Orgânica e Borda de Contato com a Areia (Shoreline Foam)
  float edgeTop = smoothstep(topBank + 0.042, topBank, uv.y);
  float edgeBottom = smoothstep(bottomBank - 0.042, bottomBank, uv.y);
  float shoreFoam = max(edgeTop, edgeBottom);
  // Micro-espumas onduladas na margem
  float foamNoise = sin(uv.x * 65.0 + u_time * 1.5) * 0.2 + 0.8;
  waterColor = mix(waterColor, C_SAND, shoreFoam * foamNoise * 0.32);

  // 11. Modulação de Ambiência (0: Manhã Serena, 1: Tarde Solar, 2: Crepúsculo)
  if (u_ambience == 1) {
    // Tarde Solar: calor dourado no espectro
    waterColor = mix(waterColor, waterColor * C_GOLD * 1.25, 0.18);
  } else if (u_ambience == 2) {
    // Crepúsculo: atmosfera profunda e introspectiva
    waterColor = mix(waterColor, C_TWILIGHT, 0.26);
  }

  gl_FragColor = vec4(waterColor, 1.0);
}
`;

export class RiverWebGLRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private isContextLost = false;

  // Uniform locations
  private uResolutionLoc: WebGLUniformLocation | null = null;
  private uTimeLoc: WebGLUniformLocation | null = null;
  private uFlowSpeedLoc: WebGLUniformLocation | null = null;
  private uLeavesLoc: WebGLUniformLocation | null = null;
  private uLeafCountLoc: WebGLUniformLocation | null = null;
  private uPointerLoc: WebGLUniformLocation | null = null;
  private uAmbienceLoc: WebGLUniformLocation | null = null;

  // Callbacks
  private onContextLostBound: (e: Event) => void;
  private onContextRestoredBound: (e: Event) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.onContextLostBound = this.handleContextLost.bind(this);
    this.onContextRestoredBound = this.handleContextRestored.bind(this);

    this.canvas.addEventListener('webglcontextlost', this.onContextLostBound, false);
    this.canvas.addEventListener('webglcontextrestored', this.onContextRestoredBound, false);

    this.initGL();
  }

  public isAvailable(): boolean {
    return this.gl !== null && this.program !== null && !this.isContextLost;
  }

  private initGL(): boolean {
    try {
      const gl = (
        this.canvas.getContext('webgl', {
          alpha: false,
          antialias: true,
          depth: false,
          stencil: false,
          powerPreference: 'high-performance',
        }) ||
        this.canvas.getContext('experimental-webgl')
      ) as WebGLRenderingContext | null;

      if (!gl) {
        console.warn('WebGL não suportado neste navegador/ambiente. Usando fallback 2D.');
        this.gl = null;
        return false;
      }

      this.gl = gl;
      return this.initShaders();
    } catch (err) {
      console.warn('Erro ao inicializar contexto WebGL:', err);
      this.gl = null;
      return false;
    }
  }

  private initShaders(): boolean {
    const gl = this.gl;
    if (!gl) return false;

    // Compila Vertex Shader
    const vs = gl.createShader(gl.VERTEX_SHADER);
    if (!vs) return false;
    gl.shaderSource(vs, VERTEX_SHADER_SOURCE);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      console.error('Falha ao compilar Vertex Shader WebGL:', gl.getShaderInfoLog(vs));
      gl.deleteShader(vs);
      return false;
    }

    // Compila Fragment Shader
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fs) {
      gl.deleteShader(vs);
      return false;
    }
    gl.shaderSource(fs, FRAGMENT_SHADER_SOURCE);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error('Falha ao compilar Fragment Shader WebGL:', gl.getShaderInfoLog(fs));
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return false;
    }

    // Link Program
    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return false;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Falha ao linkar Programa WebGL:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return false;
    }

    this.program = program;

    // Shaders podem ser excluídos uma vez linkados ao programa
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    // Configura Quad de tela cheia (2 triângulos)
    const vertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Vincula atributo de posição
    const aPosLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

    // Localiza Uniforms
    this.uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    this.uTimeLoc = gl.getUniformLocation(program, 'u_time');
    this.uFlowSpeedLoc = gl.getUniformLocation(program, 'u_flow_speed');
    this.uLeavesLoc = gl.getUniformLocation(program, 'u_leaves');
    this.uLeafCountLoc = gl.getUniformLocation(program, 'u_leaf_count');
    this.uPointerLoc = gl.getUniformLocation(program, 'u_pointer');
    this.uAmbienceLoc = gl.getUniformLocation(program, 'u_ambience');

    return true;
  }

  private handleContextLost(e: Event): void {
    e.preventDefault();
    this.isContextLost = true;
    console.warn('Contexto WebGL perdido. Aguardando restauração...');
  }

  private handleContextRestored(): void {
    console.log('Contexto WebGL restaurado. Reinicializando shaders...');
    this.isContextLost = false;
    this.initGL();
  }

  /**
   * Renderiza um quadro completo do leito do rio no WebGL
   */
  public render(
    width: number,
    height: number,
    time: number,
    speedMultiplier: number,
    leaves: LeafShaderData[],
    pointer: { x: number; y: number; intensity: number } = { x: 0.5, y: 0.5, intensity: 0 },
    ambience: number = 0
  ): void {
    const gl = this.gl;
    if (!gl || !this.program || this.isContextLost) return;

    gl.viewport(0, 0, width, height);
    gl.useProgram(this.program);

    // Atualiza Uniforms
    if (this.uResolutionLoc) {
      gl.uniform2f(this.uResolutionLoc, width, height);
    }
    if (this.uTimeLoc) {
      gl.uniform1f(this.uTimeLoc, time);
    }
    if (this.uFlowSpeedLoc) {
      gl.uniform1f(this.uFlowSpeedLoc, speedMultiplier);
    }

    if (this.uPointerLoc) {
      gl.uniform3f(this.uPointerLoc, pointer.x, pointer.y, pointer.intensity);
    }

    if (this.uAmbienceLoc) {
      gl.uniform1i(this.uAmbienceLoc, ambience);
    }

    // Prepara dados das folhas para o uniform u_leaves[8]
    const leavesArray = new Float32Array(32); // 8 * 4
    const count = Math.min(leaves.length, 8);
    for (let i = 0; i < count; i++) {
      const l = leaves[i];
      const offset = i * 4;
      leavesArray[offset] = l.x;
      leavesArray[offset + 1] = l.y;
      leavesArray[offset + 2] = l.scale;
      leavesArray[offset + 3] = l.rotation;
    }

    if (this.uLeavesLoc) {
      gl.uniform4fv(this.uLeavesLoc, leavesArray);
    }
    if (this.uLeafCountLoc) {
      gl.uniform1i(this.uLeafCountLoc, count);
    }

    // Desenha quad de tela cheia
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /**
   * Liberação rigorosa de recursos ao desmontar o componente
   */
  public destroy(): void {
    this.canvas.removeEventListener('webglcontextlost', this.onContextLostBound);
    this.canvas.removeEventListener('webglcontextrestored', this.onContextRestoredBound);

    const gl = this.gl;
    if (gl) {
      if (this.positionBuffer) {
        gl.deleteBuffer(this.positionBuffer);
        this.positionBuffer = null;
      }
      if (this.program) {
        gl.deleteProgram(this.program);
        this.program = null;
      }
    }
    this.gl = null;
  }
}
