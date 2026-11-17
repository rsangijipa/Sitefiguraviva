"use client";
import {useMemo,useRef} from "react";
import {useFrame} from "@react-three/fiber";
import {BufferAttribute,BufferGeometry,Points} from "three";

/** Small, deterministic flecks avoid new React renders on each animation frame. */
export function RiverParticles({rain,paused,visible}:{rain:boolean;paused:boolean;visible:boolean}) {
 const points=useRef<Points>(null);
 const seed=useMemo(()=>Array.from({length:90},(_,i)=>({x:Math.sin(i*12.3)*4.7,y:.25+((i*7.13)%5.5),z:5-((i*3.73)%27),phase:i*.71})),[]);
 const positions=useMemo(()=>new Float32Array(seed.flatMap(p=>[p.x,p.y,p.z])),[seed]);
 useFrame(({clock})=>{if(paused || !visible || document.hidden || !points.current)return;const geometry=points.current.geometry as BufferGeometry;const attr=geometry.getAttribute("position") as BufferAttribute;const t=clock.elapsedTime;for(let i=0;i<seed.length;i++){const p=seed[i];attr.setXYZ(i,p.x+Math.sin(t*.25+p.phase)*.18,rain ? ((p.y-t*3+600)%6) : p.y+Math.sin(t*.4+p.phase)*.12,p.z+Math.cos(t*.18+p.phase)*.18);}attr.needsUpdate=true;});
 return <points ref={points} frustumCulled={false}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial size={rain ? .045 : .065} color={rain ? "#FDFAF4" : "#FED701"} transparent opacity={rain ? .42 : .5} depthWrite={false} sizeAttenuation/></points>;
}
