"use client";
import {useMemo,useRef,type MutableRefObject} from "react";
import {useFrame} from "@react-three/fiber";
import {Color,DoubleSide,Group,InstancedMesh,Object3D,Shape,ShapeGeometry} from "three";
import {fishPosition,leafPosition} from "./river-dynamics";

export function RiverLife({time,paused,visible,onSplash}:{time:MutableRefObject<number>;paused:boolean;visible:boolean;onSplash:(x:number,z:number)=>void}) {
 const leaves=useRef<InstancedMesh>(null);
 const fish=useRef<Array<Group|null>>([]),splashes=useRef<Array<Group|null>>([]);
 const wasAbove=useRef([false,false]);
 const helper=useMemo(()=>new Object3D(),[]);
 const geometry=useMemo(()=>{const shape=new Shape();shape.moveTo(0,-.27);shape.bezierCurveTo(.19,-.18,.22,.12,0,.28);shape.bezierCurveTo(-.22,.12,-.19,-.18,0,-.27);return new ShapeGeometry(shape);},[]);
 useFrame(()=>{
  if(paused || !visible || document.hidden)return;
  const t=time.current;
  if(leaves.current){for(let i=0;i<10;i++){const p=leafPosition(t,i);helper.position.set(p.x,.035+Math.sin(t*1.2+i)*.012,p.z);helper.rotation.set(-Math.PI/2,0,t*.13+i*1.8);const size=.35+(i%3)*.11;helper.scale.setScalar(size);helper.updateMatrix();leaves.current.setMatrixAt(i,helper.matrix);}leaves.current.instanceMatrix.needsUpdate=true;}
  for(let i=0;i<2;i++){const state=fishPosition(t,i),body=fish.current[i],splash=splashes.current[i];if(!body || !splash)continue;
   body.visible=state.jumping;body.position.set(state.x,state.height,state.z);body.rotation.z=state.jumping ? .65-state.progress*1.3 : 0;
   if(state.jumping!==wasAbove.current[i]){onSplash(state.x,state.z);wasAbove.current[i]=state.jumping;}
   const edge=state.jumping ? Math.min(state.progress,1-state.progress) : 1;
   const burst=state.jumping && edge<.23;
   splash.visible=burst;splash.position.set(state.x,.03,state.z);
   if(burst){const u=edge/.23;const ring=splash.children[0];ring.scale.setScalar(.4+u*1.4);for(let j=1;j<splash.children.length;j++){const drop=splash.children[j],angle=j*Math.PI*2/7;drop.position.set(Math.cos(angle)*u*.36,Math.sin(u*Math.PI)*.25,Math.sin(angle)*u*.36);}}
  }
 });
 return <><instancedMesh ref={leaves} args={[geometry,undefined,10]} frustumCulled={false}><meshStandardMaterial color="#005A1F" roughness={.9} side={DoubleSide}/></instancedMesh>
 {Array.from({length:2},(_,i)=><group key={i}><group ref={node=>{fish.current[i]=node;}} visible={false}>
  <mesh scale={[.3,.12,.12]}><sphereGeometry args={[1,16,10]}/><meshStandardMaterial color="#D8CFBE" metalness={.28} roughness={.38}/></mesh>
  <mesh position={[-.29,0,0]} rotation={[0,0,-Math.PI/2]}><coneGeometry args={[.12,.2,5]}/><meshStandardMaterial color="#6B6B63" roughness={.5}/></mesh>
  <mesh position={[.19,.035,.095]}><sphereGeometry args={[.015,6,6]}/><meshBasicMaterial color="#262B22"/></mesh>
 </group><group ref={node=>{splashes.current[i]=node;}} visible={false}>
  <mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.16,.2,28]}/><meshBasicMaterial color="#FDFAF4" transparent opacity={.65} depthWrite={false} side={DoubleSide}/></mesh>
  {Array.from({length:7},(_,j)=><mesh key={j}><sphereGeometry args={[.025,6,6]}/><meshBasicMaterial color="#FDFAF4" transparent opacity={.8}/></mesh>)}
 </group></group>)}</>;
}
