"use client";
import {useMemo} from "react";
import {BufferAttribute,BufferGeometry,DoubleSide,type Texture} from "three";
import {riverCenter} from "./river-dynamics";

function makeBank(side:number) {
 const positions:number[]=[],uvs:number[]=[],indices:number[]=[];
 const count=80;
 for(let i=0;i<=count;i++){
  const z=-23+i*34/count,center=riverCenter(z);
  const irregular=.18*Math.sin(i*1.8)+.1*Math.sin(i*3.7);
  for(const [offset,height] of [[0,-.055],[.45,.13],[1.25+irregular,-.75]]){
   positions.push(center+side*(5+offset),height,z);uvs.push(offset/1.25,i/9);
  }
  if(i<count)for(let column=0;column<2;column++){const a=i*3+column,b=a+3;indices.push(a,b,a+1,b,b+1,a+1);}
 }
 const geometry=new BufferGeometry();geometry.setAttribute("position",new BufferAttribute(new Float32Array(positions),3));geometry.setAttribute("uv",new BufferAttribute(new Float32Array(uvs),2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
export function ErodedBanks({texture}:{texture:Texture}) {
 const banks=useMemo(()=>[makeBank(-1),makeBank(1)],[]);
 return <>{banks.map((geometry,index)=><mesh key={index} geometry={geometry} receiveShadow><meshStandardMaterial map={texture} color="#96551F" roughness={1} side={DoubleSide}/></mesh>)}</>;
}
