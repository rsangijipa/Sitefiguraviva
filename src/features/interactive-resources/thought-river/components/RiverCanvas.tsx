"use client";

import { useEffect, useRef, useState } from "react";
import { leafPosition } from "../engine/leafMotion";
import type { RiverLeaf } from "../types";

interface Props {
  leaves: RiverLeaf[];
  reducedMotion: boolean;
}

export function RiverCanvas({ leaves, reducedMotion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [available, setAvailable] = useState(true);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) {
      setAvailable(false);
      return;
    }
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const w = rect.width,
        h = rect.height;
      context.fillStyle = "#F1E9DB";
      context.fillRect(0, 0, w, h);
      context.beginPath();
      context.moveTo(w * 0.16, 0);
      context.bezierCurveTo(w * 0.4, h * 0.22, w * 0.45, h * 0.62, w * 0.2, h);
      context.lineTo(w * 0.86, h);
      context.bezierCurveTo(w * 0.55, h * 0.65, w * 0.7, h * 0.25, w * 0.82, 0);
      context.closePath();
      context.fillStyle = "#07614C";
      context.fill();
      leaves.forEach((leaf) => {
        const point = leafPosition(leaf, w, h);
        context.save();
        context.translate(point.x, point.y);
        context.rotate(point.rotation);
        context.fillStyle = "#FDFAF4";
        context.strokeStyle = "#96551F";
        context.lineWidth = 2;
        context.beginPath();
        context.ellipse(0, 0, 15, 9, 0, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        context.restore();
      });
    };
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    draw();
    return () => observer.disconnect();
  }, [leaves, reducedMotion]);
  if (!available)
    return (
      <div className="riverFallback" role="status">
        A visualização do rio não está disponível. Você pode acompanhar as
        folhas pela lista abaixo.
      </div>
    );
  return <canvas ref={canvasRef} className="riverCanvas" aria-hidden="true" />;
}
