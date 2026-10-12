"use client";
import { useEffect, useRef, useState } from "react";
import { WebGLWaterSimulation } from "@/components/resources/apps/lago/webgl/waterSim";
import { useResourceMotion } from "./ResourceShell";
import { Button } from "./ui";

export function WaterStage({forceStatic=false}:{forceStatic?:boolean}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const simulation = useRef<WebGLWaterSimulation | null>(null);
  const frame = useRef(0);
  const wake = useRef<()=>void>(()=>{});
  const [rain,setRain] = useState(false); const [wind,setWind] = useState(false);
  const [sunset,setSunset] = useState(false); const [staticChoice,setStatic] = useState(false);
  const [unavailable,setUnavailable] = useState(false); const [touches,setTouches] = useState(0);
  const systemReduced = useResourceMotion();
  const reduced = systemReduced || staticChoice || forceStatic;
  const config = useRef({rain,wind,sunset,reduced});
  useEffect(() => { config.current={rain,wind,sunset,reduced}; wake.current(); },[rain,wind,sunset,reduced]);
  useEffect(() => {
    if (!canvas.current) return;
    let sim: WebGLWaterSimulation;
    let last = 0;
    let observer:ResizeObserver|null=null;
    try {
      sim = new WebGLWaterSimulation(canvas.current,256);
      simulation.current = sim;
      const texture = document.createElement("canvas");
      texture.width = texture.height = 2;
      const ctx = texture.getContext("2d");
      if (ctx) { ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue("--fv-verde-igarape").trim(); ctx.fillRect(0,0,2,2); }
      sim.updateUnderwaterTexture(texture);
      if (ctx) { ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue("--fv-verde-raiz").trim(); ctx.fillRect(0,0,2,2); }
      sim.updateSkyTexture(texture);
      const render = (time: number) => {
        frame.current=0;
        const surface = canvas.current;
        if (!surface) return;
        if (!document.hidden) {
          const dpr=Math.min(window.devicePixelRatio || 1,2);
          const width=Math.max(1,Math.round(surface.clientWidth*dpr));
          const height=Math.round(width*.75);
          if (surface.width!==width || surface.height!==height) { surface.width=width; surface.height=height; }
          if (!config.current.reduced && time-last>33) {
            if(config.current.rain && Math.random()<.2) sim.addDrop(Math.random(),Math.random(),.02,.015);
            if(config.current.wind && Math.random()<.08) sim.addDrop(.2+Math.random()*.6,.5,.06,.008);
            sim.step(.99); last=time;
          }
          sim.render(width,height,config.current.sunset ? "sunset" : "day",.025,.45,.3);
        }
        if(!config.current.reduced && !document.hidden) frame.current=requestAnimationFrame(render);
      };
      wake.current=()=>{if(!frame.current && !document.hidden)frame.current=requestAnimationFrame(render);};
      observer=new ResizeObserver(()=>wake.current());observer.observe(canvas.current);
      document.addEventListener("visibilitychange",wake.current);
      wake.current();
    } catch { setUnavailable(true); }
    return () => { cancelAnimationFrame(frame.current); observer?.disconnect(); document.removeEventListener("visibilitychange",wake.current); wake.current=()=>{}; sim?.dispose(); simulation.current=null; };
  },[]);
  const touch = (x=.5,y=.5) => { if(!reduced) simulation.current?.addDrop(x,y,.035,.08); setTouches(value => value+1); };
  return <><h2>Acompanhar a água</h2>{unavailable ? <div className="fv-visual-fallback">A superfície permanece estática neste navegador.</div> :
    <canvas ref={canvas} className="fv-water" role="img" aria-label="Superfície do Igarapé; os controles estão abaixo" onPointerDown={event => { const bounds=event.currentTarget.getBoundingClientRect(); touch((event.clientX-bounds.left)/bounds.width,1-(event.clientY-bounds.top)/bounds.height); }} />}
    <div className="fv-actions"><Button secondary onClick={() => touch()} disabled={reduced || unavailable}>Tocar a água</Button><Button secondary aria-pressed={rain} disabled={reduced} onClick={() => setRain(value => !value)}>Chuva</Button><Button secondary aria-pressed={wind} disabled={reduced} onClick={() => setWind(value => !value)}>Vento</Button><Button secondary aria-pressed={sunset} onClick={() => setSunset(value => !value)}>Entardecer</Button><Button secondary aria-pressed={reduced} disabled={systemReduced || forceStatic} onClick={() => setStatic(value => !value)}>Modo estático</Button></div>
    <p className="fv-note" aria-live="polite">{touches ? `Toques na água: ${touches}.` : "Você pode acompanhar sem tocar."} {reduced ? "Movimento reduzido ativo." : ""}</p>
  </>;
}
