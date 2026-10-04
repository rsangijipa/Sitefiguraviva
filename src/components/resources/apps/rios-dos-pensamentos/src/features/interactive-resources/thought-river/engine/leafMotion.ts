/**
 * Motor de trajetórias e renderização de folhas e água para o Rio dos Pensamentos.
 * Usa Canvas 2D puro sem bibliotecas externas pesadas.
 * Movimento orgânico, lento e sereno (20 a 40 segundos por travessia).
 */

import { LeafThought } from '../../../../types';
import type { FluvialSediment } from './riverScene';

export const COLORS = {
  cremePapel: '#FDFAF4',
  areia: '#F1E9DB',
  verdeRaiz: '#005A1F',
  verdeIgarape: '#07614C',
  verdeAguaSuave: '#0d7d63',
  verdeCorrenteza: '#0a6d56',
  terraBarro: '#96551F',
  mata: '#262B22',
  nevoa: '#D8CFBE',
  pedra: '#6B6B63',
  aurora: '#FE538B',
  vazante: '#FED701',
  broto: '#01C94D',
};

// Formatos botânicos variados e naturais
export function generateRandomLeaf(text: string, existingCount: number): LeafThought {
  const shapes: LeafThought['leafShape'][] = ['oval', 'willow', 'broad', 'lanceolate'];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  
  // yLane distribuído suavemente para evitar sobreposição total entre as folhas
  const baseLane = (existingCount % 4) * 0.2 + 0.2 + (Math.random() * 0.1 - 0.05);

  return {
    id: 'leaf-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
    text: text.trim(),
    createdAt: Date.now(),
    xProgress: -0.05, // Inicia suavemente antes da borda esquerda
    yLane: Math.min(Math.max(baseLane, 0.18), 0.82),
    // Velocidade normalizada: 1.0 travessia a cada 25-35 segundos
    speed: 0.025 + Math.random() * 0.012, 
    rotation: (Math.random() * 0.2 - 0.1),
    angularVelocity: (Math.random() * 0.08 - 0.04),
    leafShape: shape,
    scale: 0.95 + Math.random() * 0.15,
    tintSeed: Math.random() * 10,
  };
}

/**
 * Desenha o leito do rio e as margens suaves no Canvas
 */
export function drawRiverBed(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  // 1. Fundo do rio: Verde Igarapé (#07614C)
  ctx.fillStyle = COLORS.verdeIgarape;
  ctx.fillRect(0, 0, width, height);

  // 2. Ondulações da correnteza (curvas sutis e serenas de água em Verde Igarapé claro)
  ctx.save();
  ctx.strokeStyle = 'rgba(253, 250, 244, 0.08)'; // Creme papel com opacidade baixa
  ctx.lineWidth = 2;

  const waveCount = 5;
  for (let i = 0; i < waveCount; i++) {
    const yBase = (height / (waveCount + 1)) * (i + 1);
    const speedMultiplier = 0.4 + i * 0.1;
    const waveOffset = (time * speedMultiplier * 40) % width;

    ctx.beginPath();
    for (let x = -50; x < width + 50; x += 40) {
      const yWave = yBase + Math.sin((x + waveOffset) * 0.012 + i) * 10;
      if (x === -50) {
        ctx.moveTo(x, yWave);
      } else {
        ctx.lineTo(x, yWave);
      }
    }
    ctx.stroke();
  }

  // 3. Margens suaves em Areia (#F1E9DB) e Creme Papel (#FDFAF4)
  // Margem Superior
  ctx.fillStyle = COLORS.areia;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(width, 28);
  ctx.bezierCurveTo(
    width * 0.75, 34 + Math.sin(time * 0.2) * 2,
    width * 0.25, 22 + Math.cos(time * 0.2) * 2,
    0, 28
  );
  ctx.closePath();
  ctx.fill();

  // Linha delimitadora da margem superior (Terra Barro suave)
  ctx.strokeStyle = COLORS.terraBarro;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 28);
  ctx.bezierCurveTo(
    width * 0.75, 34 + Math.sin(time * 0.2) * 2,
    width * 0.25, 22 + Math.cos(time * 0.2) * 2,
    width, 28
  );
  ctx.stroke();

  // Margem Inferior
  ctx.fillStyle = COLORS.areia;
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(width, height);
  ctx.lineTo(width, height - 28);
  ctx.bezierCurveTo(
    width * 0.65, height - 34 + Math.sin(time * 0.25) * 2,
    width * 0.35, height - 24 + Math.cos(time * 0.25) * 2,
    0, height - 28
  );
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = COLORS.terraBarro;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, height - 28);
  ctx.bezierCurveTo(
    width * 0.65, height - 34 + Math.sin(time * 0.25) * 2,
    width * 0.35, height - 24 + Math.cos(time * 0.25) * 2,
    width, height - 28
  );
  ctx.stroke();

  ctx.restore();
}

/**
 * Desenha sedimentos orgânicos e partículas de água em camadas de profundidade
 */
export function drawSediments(
  ctx: CanvasRenderingContext2D,
  sediments: FluvialSediment[],
  width: number,
  height: number,
  time: number,
  targetLayer?: 'deep' | 'mid' | 'surface'
): void {
  ctx.save();
  for (const sed of sediments) {
    if (targetLayer && sed.layer !== targetLayer) continue;

    const x = sed.x * width;
    const yWobble = Math.sin(time * sed.wobbleSpeed + sed.id) * sed.wobbleAmp;
    const y = sed.y * height + yWobble;

    let fillStyle = 'rgba(241, 233, 219, ' + sed.opacity + ')'; // Areia
    if (sed.tint === 'broto') {
      fillStyle = 'rgba(1, 201, 77, ' + (sed.opacity * 0.7) + ')'; // Broto
    } else if (sed.tint === 'creme') {
      fillStyle = 'rgba(253, 250, 244, ' + sed.opacity + ')'; // Creme Papel
    }

    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.arc(x, y, sed.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Desenha ondulações e esteira de água ao redor de cada folha flutuante
 */
export function drawLeafRipples(
  ctx: CanvasRenderingContext2D,
  leaf: LeafThought,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  const x = leaf.xProgress * canvasWidth;
  const yOffset = Math.sin(leaf.xProgress * 12 + leaf.tintSeed) * 16;
  const y = leaf.yLane * canvasHeight + yOffset;

  ctx.save();
  ctx.lineWidth = 1.2;

  // Marola concêntrica expandindo suavemente
  const ripplePhase = (time * 1.8 + leaf.tintSeed) % 1;
  const r1 = 30 + ripplePhase * 26;
  const alpha1 = (1 - ripplePhase) * 0.18;

  ctx.strokeStyle = `rgba(253, 250, 244, ${alpha1})`;
  ctx.beginPath();
  ctx.ellipse(x, y, r1, r1 * 0.45, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Esteira de fluxo na popa da folha (à esquerda)
  const wakeLen = 42 * leaf.scale;
  ctx.strokeStyle = 'rgba(253, 250, 244, 0.12)';
  ctx.beginPath();
  ctx.moveTo(x - 20, y);
  ctx.lineTo(x - 20 - wakeLen, y - 6);
  ctx.moveTo(x - 20, y);
  ctx.lineTo(x - 20 - wakeLen, y + 6);
  ctx.stroke();

  ctx.restore();
}

/**
 * Desenha uma folha botânica vetorial carregando uma reflexão/pensamento
 */
export function drawLeaf(
  ctx: CanvasRenderingContext2D,
  leaf: LeafThought,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  // Posição no mundo
  const x = leaf.xProgress * canvasWidth;
  // Ondulação vertical suave
  const yOffset = Math.sin(leaf.xProgress * 12 + leaf.tintSeed) * 16;
  const y = leaf.yLane * canvasHeight + yOffset;

  // Rotação suave sincronizada com o balanço da água
  const wobble = Math.sin(time * 1.5 + leaf.tintSeed) * 0.08;
  const totalAngle = leaf.rotation + wobble;

  // Dimensões da folha
  const length = 76;
  const halfWidth = 26;

  // 0. Sombra Submersa no Leito Fluvial (Profundidade Óptica)
  ctx.save();
  ctx.translate(x + 8, y + 14);
  ctx.rotate(totalAngle);
  ctx.scale(leaf.scale * 1.05, leaf.scale * 0.95);
  ctx.fillStyle = 'rgba(0, 35, 20, 0.28)';
  ctx.beginPath();
  ctx.moveTo(-length * 0.45, 0);
  ctx.bezierCurveTo(-length * 0.2, -halfWidth, length * 0.25, -halfWidth * 0.9, length * 0.5, 0);
  ctx.bezierCurveTo(length * 0.25, halfWidth * 0.9, -length * 0.2, halfWidth, -length * 0.45, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(totalAngle);
  ctx.scale(leaf.scale, leaf.scale);

  // 1. Corpo da folha: Creme Papel quente com preenchimento limpo
  ctx.beginPath();
  ctx.moveTo(-length * 0.45, 0);
  // Curva superior
  ctx.bezierCurveTo(
    -length * 0.2, -halfWidth,
    length * 0.25, -halfWidth * 0.9,
    length * 0.5, 0
  );
  // Curva inferior
  ctx.bezierCurveTo(
    length * 0.25, halfWidth * 0.9,
    -length * 0.2, halfWidth,
    -length * 0.45, 0
  );
  ctx.closePath();

  // Preenchimento: Creme Papel (#FDFAF4) sobre a água escura
  ctx.fillStyle = COLORS.cremePapel;
  ctx.fill();

  // Contorno da folha em traço de 2px (Terra Barro #96551F)
  ctx.strokeStyle = COLORS.terraBarro;
  ctx.lineWidth = 2;
  ctx.stroke();

  // 2. Nervura central da folha
  ctx.beginPath();
  ctx.moveTo(-length * 0.45, 0);
  ctx.lineTo(length * 0.45, 0);
  ctx.strokeStyle = 'rgba(150, 85, 31, 0.45)'; // Terra barro suave
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3. Nervuras laterais
  const ribs = 3;
  for (let r = 1; r <= ribs; r++) {
    const rx = -length * 0.3 + (r * length * 0.2);
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.lineTo(rx + 10, -halfWidth * 0.5);
    ctx.moveTo(rx, 0);
    ctx.lineTo(rx + 10, halfWidth * 0.5);
    ctx.strokeStyle = 'rgba(150, 85, 31, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 4. Cabo da folha (pecíolo) com acento de Confluência (Aurora -> Vazante -> Broto)
  ctx.beginPath();
  ctx.moveTo(-length * 0.45, 0);
  ctx.quadraticCurveTo(-length * 0.55, -4, -length * 0.65, -8);
  
  const grad = ctx.createLinearGradient(-length * 0.65, -8, -length * 0.45, 0);
  grad.addColorStop(0, COLORS.aurora);
  grad.addColorStop(0.5, COLORS.vazante);
  grad.addColorStop(1, COLORS.broto);

  ctx.strokeStyle = grad;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 5. Gotícula de orvalho na folha (micro-detalhe translúcido de água)
  ctx.beginPath();
  ctx.arc(length * 0.12, -halfWidth * 0.28, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(7, 97, 76, 0.35)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(length * 0.11, -halfWidth * 0.29, 0.9, 0, Math.PI * 2);
  ctx.fillStyle = '#FDFAF4';
  ctx.fill();

  // 6. Cartão / Etiqueta de texto da folha
  drawLeafTextCard(ctx, leaf.text, length);

  ctx.restore();
}

/**
 * Desenha nenúfares, flores aquáticas e vegetação flutuante nas margens calmas do lago/rio
 */
export function drawAquaticFlora(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  ctx.save();

  // Posições serenas das vitórias-régias/nenúfares nas águas mansas
  const pads = [
    { xRatio: 0.14, yRatio: 0.15, radius: 18, color: '#005A1F', rot: 0.4, flower: true },
    { xRatio: 0.28, yRatio: 0.12, radius: 14, color: '#07614C', rot: 1.2, flower: false },
    { xRatio: 0.72, yRatio: 0.14, radius: 16, color: '#005A1F', rot: 2.1, flower: true },
    { xRatio: 0.88, yRatio: 0.16, radius: 13, color: '#07614C', rot: 3.5, flower: false },
    { xRatio: 0.18, yRatio: 0.84, radius: 15, color: '#07614C', rot: 0.9, flower: false },
    { xRatio: 0.52, yRatio: 0.86, radius: 20, color: '#005A1F', rot: 2.8, flower: true },
    { xRatio: 0.84, yRatio: 0.83, radius: 17, color: '#005A1F', rot: 4.2, flower: false },
  ];

  for (const pad of pads) {
    const swayX = Math.sin(time * 0.8 + pad.xRatio * 10) * 3;
    const swayY = Math.cos(time * 0.9 + pad.yRatio * 8) * 2;
    const px = pad.xRatio * width + swayX;
    const py = pad.yRatio * height + swayY;

    // Sombra do nenúfar
    ctx.beginPath();
    ctx.arc(px + 3, py + 4, pad.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 30, 15, 0.25)';
    ctx.fill();

    // Nenúfar com fenda botânica em V
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(pad.rot + Math.sin(time * 0.5) * 0.05);

    ctx.beginPath();
    ctx.arc(0, 0, pad.radius, 0.25, Math.PI * 2 - 0.25);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fillStyle = pad.color;
    ctx.fill();
    ctx.strokeStyle = COLORS.terraBarro;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Flor aquática branca/creme no centro (quando aplicável)
    if (pad.flower) {
      for (let p = 0; p < 6; p++) {
        const petalAngle = (p * Math.PI * 2) / 6;
        const petX = Math.cos(petalAngle) * (pad.radius * 0.4);
        const petY = Math.sin(petalAngle) * (pad.radius * 0.4);
        ctx.beginPath();
        ctx.arc(petX, petY, pad.radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = '#FDFAF4';
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, 0, pad.radius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.aurora; // Centro amarelo dourado
      ctx.fill();
    }

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Desenha o texto do pensamento sobre ou ao lado da folha de forma nítida e legível
 */
function drawLeafTextCard(ctx: CanvasRenderingContext2D, text: string, leafLength: number): void {
  ctx.save();
  // Posiciona a etiqueta logo acima da folha
  ctx.translate(0, -38);

  ctx.font = '500 13px "Karla", sans-serif';
  const maxChars = 36;
  const displayLine = text.length > maxChars ? text.substring(0, maxChars - 1) + '…' : text;
  const metrics = ctx.measureText(displayLine);
  const paddingX = 14;
  const cardWidth = Math.max(metrics.width + paddingX * 2, 80);
  const cardHeight = 28;
  const radius = 14;

  // Caixa da frase em Creme Papel com borda 2px Névoa/Terra Barro
  ctx.fillStyle = COLORS.cremePapel;
  ctx.strokeStyle = COLORS.nevoa;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, radius);
  ctx.fill();
  ctx.stroke();

  // Pequeno conector visual entre a etiqueta e a folha
  ctx.beginPath();
  ctx.moveTo(0, cardHeight / 2);
  ctx.lineTo(0, cardHeight / 2 + 8);
  ctx.strokeStyle = COLORS.nevoa;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Texto em Mata (#262B22) para máxima legibilidade e contraste
  ctx.fillStyle = COLORS.mata;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayLine, 0, 0);

  ctx.restore();
}
