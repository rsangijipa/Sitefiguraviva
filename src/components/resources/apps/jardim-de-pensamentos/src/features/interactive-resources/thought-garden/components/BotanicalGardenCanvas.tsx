import React, { useEffect, useRef } from 'react';
import { GardenViewPreset, WindIntensity } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  color: string;
  type: 'pollen' | 'spore' | 'petal' | 'firefly';
  phase: number;
  phaseSpeed: number;
}

interface RiverFish {
  progress: number; // 0 to 1 along igarapé stream
  speed: number;
  laneOffset: number;
  wigglePhase: number;
  wiggleSpeed: number;
  length: number;
  bodyWidth: number;
  color: string;
  fleeTimer: number;
}

interface Dragonfly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  angle: number;
  wingPhase: number;
  hoverTimer: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface WaterStreak {
  progress: number;
  speed: number;
  lane: number;
  length: number;
  width: number;
}

interface BotanicalGardenCanvasProps {
  reducedMotion: boolean;
  isPaused: boolean;
  windIntensity?: WindIntensity;
  viewPreset?: GardenViewPreset;
  className?: string;
}

export const BotanicalGardenCanvas: React.FC<BotanicalGardenCanvasProps> = ({
  reducedMotion,
  isPaused,
  windIntensity = 'gentle',
  viewPreset = 'panoramic',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const streaksRef = useRef<WaterStreak[]>([]);
  const fishesRef = useRef<RiverFish[]>([]);
  const dragonflyRef = useRef<Dragonfly>({
    x: 300,
    y: 200,
    vx: 0,
    vy: 0,
    targetX: 450,
    targetY: 280,
    angle: 0,
    wingPhase: 0,
    hoverTimer: 0,
  });
  const cameraRef = useRef<{
    currentZoom: number;
    targetZoom: number;
    currentPanX: number;
    targetPanX: number;
    currentPanY: number;
    targetPanY: number;
  }>({
    currentZoom: 1.0,
    targetZoom: 1.0,
    currentPanX: 0,
    targetPanX: 0,
    currentPanY: 0,
    targetPanY: 0,
  });
  const lastTimeRef = useRef<number>(performance.now());
  const globalWindPhaseRef = useRef<number>(0);

  // Mapeia preset de visualização para valores de câmera
  useEffect(() => {
    const cam = cameraRef.current;
    if (viewPreset === 'stream') {
      cam.targetZoom = 1.28;
      cam.targetPanX = -60;
      cam.targetPanY = -40;
    } else if (viewPreset === 'clearing') {
      cam.targetZoom = 1.18;
      cam.targetPanX = 0;
      cam.targetPanY = 30;
    } else if (viewPreset === 'canopy') {
      cam.targetZoom = 1.25;
      cam.targetPanX = 70;
      cam.targetPanY = -80;
    } else {
      // panoramic
      cam.targetZoom = 1.0;
      cam.targetPanX = 0;
      cam.targetPanY = 0;
    }
  }, [viewPreset]);

  // Inicializa partículas e peixinhos
  const initEntities = (width: number, height: number) => {
    const count = Math.min(80, Math.floor((width * height) / 12000));
    const particles: Particle[] = [];

    const colors = {
      pollen: '#FED701',  // Vazante
      spore: '#01C94D',   // Broto
      petal: '#FE538B',   // Aurora
      firefly: '#FDFAF4', // Creme Papel brilhante
    };

    for (let i = 0; i < count; i++) {
      const typeRand = Math.random();
      let type: Particle['type'] = 'pollen';
      let color = colors.pollen;
      let size = 1.8 + Math.random() * 2.2;
      let maxAlpha = 0.45 + Math.random() * 0.4;

      if (typeRand < 0.42) {
        type = 'pollen';
        color = colors.pollen;
      } else if (typeRand < 0.68) {
        type = 'spore';
        color = colors.spore;
        size = 1.4 + Math.random() * 1.8;
      } else if (typeRand < 0.86) {
        type = 'petal';
        color = colors.petal;
        size = 2.4 + Math.random() * 2.6;
        maxAlpha = 0.35 + Math.random() * 0.35;
      } else {
        type = 'firefly';
        color = colors.firefly;
        size = 2.0 + Math.random() * 2.5;
        maxAlpha = 0.75 + Math.random() * 0.25;
      }

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.35) * 0.45,
        vy: (Math.random() - 0.6) * 0.4,
        size,
        alpha: Math.random() * maxAlpha,
        maxAlpha,
        color,
        type,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.015 + Math.random() * 0.03,
      });
    }

    // Estrias de correnteza do igarapé
    const streaks: WaterStreak[] = [];
    for (let i = 0; i < 22; i++) {
      streaks.push({
        progress: Math.random(),
        speed: 0.0006 + Math.random() * 0.0012,
        lane: (Math.random() - 0.5) * 44,
        length: 25 + Math.random() * 50,
        width: 1.2 + Math.random() * 1.6,
      });
    }

    // Peixes ornamentais fluviais (piabinhas amazônicas)
    const fishes: RiverFish[] = [];
    for (let i = 0; i < 5; i++) {
      fishes.push({
        progress: 0.15 + (i * 0.16) + Math.random() * 0.05,
        speed: 0.00035 + Math.random() * 0.00025,
        laneOffset: (Math.random() - 0.5) * 26,
        wigglePhase: Math.random() * Math.PI * 2,
        wiggleSpeed: 0.18 + Math.random() * 0.1,
        length: 12 + Math.random() * 6,
        bodyWidth: 3 + Math.random() * 1.5,
        color: i % 2 === 0 ? '#07614C' : '#005A1F',
        fleeTimer: 0,
      });
    }

    particlesRef.current = particles;
    streaksRef.current = streaks;
    fishesRef.current = fishes;

    // Inicializa libélula
    dragonflyRef.current = {
      x: width * 0.5,
      y: height * 0.4,
      vx: 0,
      vy: 0,
      targetX: width * 0.45,
      targetY: height * 0.35,
      angle: 0,
      wingPhase: 0,
      hoverTimer: 0,
    };
  };

  // Traçado da curva do igarapé (coordenadas Bézier cúbica da água)
  const getIgarapePoint = (t: number, width: number, height: number, laneOffset: number) => {
    const p0x = width * 0.08;
    const p0y = height * 1.05;
    const p1x = width * 0.24;
    const p1y = height * 0.65;
    const p2x = width * 0.48;
    const p2y = height * 0.42;
    const p3x = width * 0.88;
    const p3y = height * 0.18;

    const clampedT = Math.max(0, Math.min(1, t));
    const mt = 1 - clampedT;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = clampedT * clampedT;
    const t3 = t2 * clampedT;

    const x = mt3 * p0x + 3 * mt2 * clampedT * p1x + 3 * mt * t2 * p2x + t3 * p3x;
    const y = mt3 * p0y + 3 * mt2 * clampedT * p1y + 3 * mt * t2 * p2y + t3 * p3y;

    const dx = 3 * mt2 * (p1x - p0x) + 6 * mt * clampedT * (p2x - p1x) + 3 * t2 * (p3x - p2x);
    const dy = 3 * mt2 * (p1y - p0y) + 6 * mt * clampedT * (p2y - p1y) + 3 * t2 * (p3y - p2y);
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    return {
      x: x + nx * laneOffset,
      y: y + ny * laneOffset,
      angle: Math.atan2(dy, dx),
    };
  };

  // Interação de ondas e dispersão de partículas com física ao tocar/clicar
  const handlePointerInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;

    // Converter para espaço transformado da câmera
    const cam = cameraRef.current;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = (rawX - centerX - cam.currentPanX) / cam.currentZoom + centerX;
    const y = (rawY - centerY - cam.currentPanY) / cam.currentZoom + centerY;

    ripplesRef.current.push({
      x,
      y,
      radius: 4,
      maxRadius: 45 + Math.random() * 30,
      alpha: 0.6,
      color: '#07614C',
    });

    // Peixes fogem ao toque
    fishesRef.current.forEach((fish) => {
      const pt = getIgarapePoint(fish.progress, rect.width, rect.height, fish.laneOffset);
      const dist = Math.hypot(pt.x - x, pt.y - y);
      if (dist < 120) {
        fish.fleeTimer = 40;
        fish.speed *= 2.2;
      }
    });

    // Libélula se assusta sutilmente e procura outro alvo
    const df = dragonflyRef.current;
    const distDf = Math.hypot(df.x - x, df.y - y);
    if (distDf < 150) {
      df.targetX = Math.random() * rect.width * 0.8 + rect.width * 0.1;
      df.targetY = Math.random() * rect.height * 0.7 + rect.height * 0.15;
      df.hoverTimer = 0;
    }

    // Dispersão com física nas partículas
    particlesRef.current.forEach((p) => {
      const dist = Math.hypot(p.x - x, p.y - y);
      if (dist < 120 && dist > 1) {
        const force = (120 - dist) / 120;
        p.vx += ((p.x - x) / dist) * force * 2.2;
        p.vy += ((p.y - y) / dist) * force * 2.2;
      }
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      initEntities(width, height);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    // Fator do multiplicador de vento
    const windMultiplier =
      windIntensity === 'calm' ? 0.45 : windIntensity === 'breeze' ? 1.9 : 1.0;

    // Loop de animação física contínuo
    const render = (now: number) => {
      const dt = Math.min(now - lastTimeRef.current, 50);
      lastTimeRef.current = now;

      // Interpolação suave de Câmera (LERP)
      const cam = cameraRef.current;
      cam.currentZoom += (cam.targetZoom - cam.currentZoom) * 0.05;
      cam.currentPanX += (cam.targetPanX - cam.currentPanX) * 0.05;
      cam.currentPanY += (cam.targetPanY - cam.currentPanY) * 0.05;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Aplica transformação de Câmera
      const centerX = width / 2;
      const centerY = height / 2;
      ctx.translate(centerX + cam.currentPanX, centerY + cam.currentPanY);
      ctx.scale(cam.currentZoom, cam.currentZoom);
      ctx.translate(-centerX, -centerY);

      // Atualiza fase global do vento
      if (!reducedMotion && !isPaused) {
        globalWindPhaseRef.current += 0.012 * windMultiplier * (dt / 16);
      }
      const windGust = Math.sin(globalWindPhaseRef.current) * 0.4 * windMultiplier;
      const windBaseX = (0.25 + windGust) * windMultiplier;
      const windBaseY = (0.05 + Math.cos(globalWindPhaseRef.current * 0.8) * 0.15) * windMultiplier;

      // 1. Feixes de Luz Solar Volumétricos (God Rays Suaves)
      if (width > 0 && height > 0) {
        ctx.save();
        const rayAlpha = 0.035 + Math.sin(globalWindPhaseRef.current * 0.5) * 0.015;
        const gradRay = ctx.createLinearGradient(0, 0, width * 0.85, height * 0.9);
        gradRay.addColorStop(0, `rgba(254, 215, 1, ${rayAlpha * 1.5})`);
        gradRay.addColorStop(0.4, `rgba(253, 250, 244, ${rayAlpha})`);
        gradRay.addColorStop(1, 'rgba(253, 250, 244, 0)');

        ctx.fillStyle = gradRay;
        ctx.beginPath();
        ctx.moveTo(width * 0.15, 0);
        ctx.lineTo(width * 0.4, 0);
        ctx.lineTo(width * 0.95, height);
        ctx.lineTo(width * 0.65, height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // 2. Fluxo do Igarapé com física de correnteza
      if (width > 0 && height > 0) {
        ctx.save();
        ctx.lineCap = 'round';

        streaksRef.current.forEach((s) => {
          if (!reducedMotion && !isPaused) {
            s.progress = (s.progress + s.speed * windMultiplier * (dt / 16)) % 1;
          }

          const ptStart = getIgarapePoint(s.progress, width, height, s.lane);
          const tEnd = Math.min(1, s.progress + s.length / Math.hypot(width, height));
          const ptEnd = getIgarapePoint(tEnd, width, height, s.lane);

          const grad = ctx.createLinearGradient(ptStart.x, ptStart.y, ptEnd.x, ptEnd.y);
          grad.addColorStop(0, 'rgba(253, 250, 244, 0)');
          grad.addColorStop(0.5, 'rgba(253, 250, 244, 0.45)');
          grad.addColorStop(1, 'rgba(7, 97, 76, 0)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = s.width;
          ctx.beginPath();
          ctx.moveTo(ptStart.x, ptStart.y);
          ctx.lineTo(ptEnd.x, ptEnd.y);
          ctx.stroke();
        });
        ctx.restore();
      }

      // 3. Cardume de Peixinhos no Igarapé (Com nado senoidal fluídico)
      if (width > 0 && height > 0) {
        ctx.save();
        fishesRef.current.forEach((fish) => {
          if (!reducedMotion && !isPaused) {
            if (fish.fleeTimer > 0) {
              fish.fleeTimer--;
              if (fish.fleeTimer === 0) {
                fish.speed = 0.00035 + Math.random() * 0.00025;
              }
            }

            fish.progress = (fish.progress + fish.speed * (dt / 16)) % 1;
            fish.wigglePhase += fish.wiggleSpeed * (dt / 16);
          }

          const pt = getIgarapePoint(fish.progress, width, height, fish.laneOffset);
          const wiggleOffset = Math.sin(fish.wigglePhase) * 2.5;

          ctx.save();
          ctx.translate(pt.x, pt.y);
          ctx.rotate(pt.angle);

          // Corpo do peixinho
          ctx.fillStyle = fish.color;
          ctx.globalAlpha = 0.45;
          ctx.beginPath();
          ctx.ellipse(0, 0, fish.length * 0.6, fish.bodyWidth, 0, 0, Math.PI * 2);
          ctx.fill();

          // Cauda articulada que balança
          ctx.beginPath();
          ctx.moveTo(-fish.length * 0.5, 0);
          ctx.lineTo(-fish.length * 0.85, wiggleOffset - 3.5);
          ctx.lineTo(-fish.length * 0.85, wiggleOffset + 3.5);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        });
        ctx.restore();
      }

      // 4. Libélula das Águas
      if (width > 0 && height > 0) {
        const df = dragonflyRef.current;
        if (!reducedMotion && !isPaused) {
          df.wingPhase += 0.8 * (dt / 16);
          const dx = df.targetX - df.x;
          const dy = df.targetY - df.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 8) {
            df.angle = Math.atan2(dy, dx);
            df.vx += (dx / dist) * 0.12 * (dt / 16);
            df.vy += (dy / dist) * 0.12 * (dt / 16);
            df.vx *= 0.94;
            df.vy *= 0.94;
            df.x += df.vx * (dt / 16);
            df.y += df.vy * (dt / 16);
          } else {
            df.hoverTimer += dt;
            if (df.hoverTimer > 2500) {
              df.hoverTimer = 0;
              df.targetX = Math.random() * width * 0.7 + width * 0.15;
              df.targetY = Math.random() * height * 0.6 + height * 0.2;
            }
          }
        }

        ctx.save();
        ctx.translate(df.x, df.y);
        ctx.rotate(df.angle);

        // Corpo da libélula
        ctx.fillStyle = '#07614C';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 1.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Olhos
        ctx.fillStyle = '#FED701';
        ctx.beginPath();
        ctx.arc(6, -1.2, 1.2, 0, Math.PI * 2);
        ctx.arc(6, 1.2, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Asas translúcidas vibrantes
        const wingSpread = 0.75 + Math.sin(df.wingPhase) * 0.25;
        ctx.fillStyle = 'rgba(253, 250, 244, 0.7)';
        ctx.strokeStyle = 'rgba(7, 97, 76, 0.4)';
        ctx.lineWidth = 0.6;

        // Par de asas dianteiras
        ctx.beginPath();
        ctx.ellipse(1, -7 * wingSpread, 2.5, 6 * wingSpread, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(1, 7 * wingSpread, 2.5, 6 * wingSpread, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }

      // 5. Ondulações (Ripples) no curso d'água
      if (ripplesRef.current.length > 0) {
        ctx.save();
        ctx.lineWidth = 1.5;
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          const r = ripplesRef.current[i];
          if (!reducedMotion && !isPaused) {
            r.radius += (r.maxRadius - r.radius) * 0.08;
            r.alpha *= 0.94;
          }

          ctx.strokeStyle = `rgba(7, 97, 76, ${r.alpha * 0.45})`;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.stroke();

          if (r.radius > 12) {
            ctx.strokeStyle = `rgba(254, 215, 1, ${r.alpha * 0.28})`;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius * 0.65, 0, Math.PI * 2);
            ctx.stroke();
          }

          if (r.alpha < 0.02 || r.radius >= r.maxRadius - 1) {
            ripplesRef.current.splice(i, 1);
          }
        }
        ctx.restore();
      }

      // 6. Partículas botânicas (Pólen, Esporos, Pétalas, Vaga-lumes) com física aprimorada
      particlesRef.current.forEach((p) => {
        if (!reducedMotion && !isPaused) {
          p.phase += p.phaseSpeed * (dt / 16);
          const swayX = Math.sin(p.phase) * 0.35;
          const swayY = Math.cos(p.phase * 0.8) * 0.25;

          // Aplicação de forças vetoriais de vento e inércia
          p.x += (p.vx + swayX + windBaseX) * (dt / 16);
          p.y += (p.vy + swayY + windBaseY) * (dt / 16);

          p.vx *= 0.97;
          p.vy *= 0.97;

          // Reposição contínua na borda
          if (p.x < -30) p.x = width + 20;
          if (p.x > width + 30) p.x = -20;
          if (p.y < -30) p.y = height + 20;
          if (p.y > height + 30) p.y = -20;
        }

        let currentAlpha = p.alpha;
        if (p.type === 'firefly') {
          currentAlpha = p.maxAlpha * (0.35 + 0.65 * (Math.sin(p.phase * 2) * 0.5 + 0.5));
        } else {
          currentAlpha = p.maxAlpha * (0.6 + 0.4 * Math.sin(p.phase));
        }

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));

        if (p.type === 'firefly') {
          const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          halo.addColorStop(0, 'rgba(254, 215, 1, 0.45)');
          halo.addColorStop(1, 'rgba(254, 215, 1, 0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FDFAF4';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'petal') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.phase + globalWindPhaseRef.current * 0.5);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.6, p.size * 0.85, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      ctx.restore(); // Restaura transformação de câmera

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [reducedMotion, isPaused, windIntensity]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => handlePointerInteraction(e.clientX, e.clientY)}
        className="block w-full h-full cursor-crosshair select-none"
      />
    </div>
  );
};
