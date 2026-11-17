"use client";
import {Suspense,useEffect,useMemo,useRef} from "react";
import {Canvas,useFrame,useLoader,useThree,type ThreeEvent} from "@react-three/fiber";
import {Color,PlaneGeometry,RepeatWrapping,SRGBColorSpace,TextureLoader,Vector3,Vector4,Matrix4,ShaderMaterial,DoubleSide} from "three";
import {attachRiverCameraControls} from "./river-camera-controls";
import {RiverLife} from "./RiverLife";
import {ErodedBanks} from "./ErodedBanks";
import {RiverParticles} from "./RiverParticles";
import {Reflector} from "three/examples/jsm/objects/Reflector.js";

const shader={
 uniforms:{color:{value:new Color("#07614C")},tDiffuse:{value:null},textureMatrix:{value:new Matrix4()},time:{value:0},wind:{value:.25},rain:{value:0},impacts:{value:Array.from({length:8},()=>new Vector4(0,0,-100,0))}},
 vertexShader:`uniform mat4 textureMatrix; uniform float time; uniform float wind; uniform vec4 impacts[8]; varying vec4 vReflection; varying vec2 vLocal; varying vec3 vWorldPosition;
 void main(){vec3 displaced=position;vec2 p=position.xy;float waves=sin(p.y*1.25-time*.8+sin(p.x*.8))*.022+sin(p.x*2.1+p.y*.6-time*.54)*.012;
 for(int i=0;i<8;i++){float age=time-impacts[i].z;float d=distance(p,impacts[i].xy);waves+=sin(d*11.0-age*5.0)*exp(-d*.7-age*.9)*step(0.0,age)*step(age,6.0)*impacts[i].w*.038;}
 displaced.z+=waves*(.7+wind*.3);vLocal=p;vWorldPosition=(modelMatrix*vec4(displaced,1.0)).xyz;vReflection=textureMatrix*vec4(displaced,1.0);gl_Position=projectionMatrix*modelViewMatrix*vec4(displaced,1.0);}`,
 fragmentShader:`uniform sampler2D tDiffuse; uniform vec3 color; uniform float time; uniform float wind; uniform float rain; uniform vec4 impacts[8]; varying vec4 vReflection; varying vec2 vLocal; varying vec3 vWorldPosition;
 void main(){
 vec2 flow=vec2(sin(vLocal.y*2.2-time*.45)+sin(vLocal.x*3.7+time*.21)*.45,cos(vLocal.x*2.1+time*.32)+sin(vLocal.y*4.0-time*.25)*.35)*(.0014+wind*.0025);
 float shine=0.0;
 for(int i=0;i<8;i++){float age=time-impacts[i].z;float d=distance(vLocal,impacts[i].xy);float envelope=exp(-d*.7-age*.8)*step(0.0,age)*step(age,6.0)*impacts[i].w;float w=sin(d*16.0-age*6.0)*envelope;flow+=normalize(vLocal-impacts[i].xy+vec2(.001))*w*.018;shine+=w*.18;}
 float drops=sin(vLocal.x*23.0+time*4.0)*sin(vLocal.y*25.0-time*3.0)*rain*.001;
 vec4 projected=vReflection;projected.xy+=(flow+drops)*projected.w;
 vec3 reflected=texture2DProj(tDiffuse,projected).rgb;
 float shimmer=pow(max(0.0,sin(vLocal.x*5.3+sin(vLocal.y*2.1-time*.35)+time*.7)),12.0)*.035;
 vec3 normal=normalize(vec3(-flow.x*9.0,1.0,-flow.y*9.0));
 vec3 viewDirection=normalize(cameraPosition-vWorldPosition);float fresnel=pow(1.0-clamp(dot(normal,viewDirection),0.0,1.0),3.0);
 vec3 sunDirection=normalize(vec3(.55,.82,.3));float glint=pow(max(dot(reflect(-sunDirection,normal),viewDirection),0.0),65.0)*.18;
 vec3 water=mix(color,reflected,.46+fresnel*.24)+vec3(max(shine,0.0)+shimmer+glint);
 gl_FragColor=vec4(water,.62+fresnel*.12);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`,
};

function River({paused,visible,wind,rain,sunset,touchSignal,onTouch,view,onViewChange,onFailure}:{paused:boolean;visible:boolean;wind:boolean;rain:boolean;sunset:boolean;touchSignal:number;onTouch:()=>void;view:{yaw:number;pitch:number};onViewChange:(view:{yaw:number;pitch:number})=>void;onFailure:()=>void}) {
 const invalidate=useThree(state=>state.invalidate);
 const gl=useThree(state=>state.gl);const angle=useRef(view);angle.current=view;
 useEffect(()=>{const canvas=gl.domElement;canvas.addEventListener("webglcontextlost",onFailure);return()=>canvas.removeEventListener("webglcontextlost",onFailure);},[gl,onFailure]);
 useEffect(()=>attachRiverCameraControls(gl.domElement,()=>angle.current,next=>{angle.current=next;onViewChange(next);},invalidate),[gl,invalidate,onViewChange]);
 const clock=useRef(0),cursor=useRef(0),lastTouch=useRef(0);
 const surface=useMemo(()=>{const geometry=new PlaneGeometry(10,34,24,72);const positions=geometry.attributes.position;for(let i=0;i<positions.count;i++){const y=positions.getY(i);positions.setX(i,positions.getX(i)+Math.sin(y*.18)*.65+Math.sin(y*.47)*.25);}geometry.computeVertexNormals();const water=new Reflector(geometry,{textureWidth:512,textureHeight:512,multisample:0,shader});water.rotation.x=-Math.PI/2;water.position.z=-6;(water.material as ShaderMaterial).transparent=true;(water.material as ShaderMaterial).depthWrite=false;water.renderOrder=2;return water;},[]);
 const [original,skyOriginal,treeOriginal]=useLoader(TextureLoader,["/brand/recursos/igarape/leito-realista.webp","/brand/recursos/igarape/ceu-realista.webp","/brand/recursos/igarape/arvore-realista.webp"]);
 const tree=useMemo(()=>{const texture=treeOriginal.clone();texture.colorSpace=SRGBColorSpace;texture.needsUpdate=true;return texture;},[treeOriginal]);
 const sky=useMemo(()=>{const texture=skyOriginal.clone();texture.colorSpace=SRGBColorSpace;texture.needsUpdate=true;return texture;},[skyOriginal]);
 const floor=useMemo(()=>{const texture=original.clone();texture.wrapS=texture.wrapT=RepeatWrapping;texture.repeat.set(2,5);texture.colorSpace=SRGBColorSpace;texture.needsUpdate=true;return texture;},[original]);
 const impact=(x:number,z:number)=>{const material=surface.material as ShaderMaterial;material.uniforms.impacts.value[cursor.current%8].set(x,-z,clock.current,1);cursor.current++;invalidate();};
 const impactRef=useRef(impact);impactRef.current=impact;
 const fishSplash=(x:number,z:number)=>impactRef.current(x,z+6);
 useEffect(()=>{if(touchSignal)impactRef.current(0,0);},[touchSignal]);
 useEffect(()=>()=>{surface.geometry.dispose();surface.dispose();floor.dispose();sky.dispose();tree.dispose();},[surface,floor,sky,tree]);
 useEffect(()=>{const previous=gl.shadowMap.autoUpdate;gl.shadowMap.autoUpdate=false;gl.shadowMap.needsUpdate=true;invalidate();return()=>{gl.shadowMap.autoUpdate=previous;};},[gl,invalidate,tree,floor,sky]);
 useEffect(()=>{gl.shadowMap.needsUpdate=true;invalidate();},[gl,invalidate,sunset]);
 useEffect(()=>{invalidate();},[view,invalidate]);
 useEffect(()=>{invalidate();if(paused || !visible)return;const timer=window.setInterval(()=>{if(!document.hidden)invalidate();},34);return()=>clearInterval(timer);},[paused,visible,invalidate]);
 useFrame((state,delta)=>{
  if(!paused && visible && !document.hidden)clock.current+=Math.min(delta,.06);
  const material=surface.material as ShaderMaterial;material.uniforms.time.value=clock.current;material.uniforms.wind.value=wind ? 1 : .15;material.uniforms.rain.value=rain ? 1 : 0;
  material.uniforms.color.value.set(sunset ? "#96551F" : "#07614C");
  const yaw=angle.current.yaw,pitch=angle.current.pitch;const cameraTarget=new Vector3(Math.sin(yaw)*13,6+pitch*8,-5+Math.cos(yaw)*13);if(paused)state.camera.position.copy(cameraTarget);else state.camera.position.lerp(cameraTarget,.12);state.camera.lookAt(0,2.5,-5);
 });
 const touch=(event:ThreeEvent<PointerEvent>)=>{if(paused || event.button===1 || (event.buttons & 4)!==0)return;event.stopPropagation();if(event.type==="pointermove" && (!event.buttons || performance.now()-lastTouch.current<120))return;lastTouch.current=performance.now();impact(event.point.x,event.point.z+6);onTouch();};
 return <><color attach="background" args={[sunset ? "#F1E9DB" : "#FDFAF4"]}/><fog attach="fog" args={[sunset ? "#F1E9DB" : "#FDFAF4",18,48]}/><hemisphereLight args={["#FDFAF4","#07614C",1.25]}/><directionalLight castShadow position={[9,16,4]} color={sunset ? "#FED701" : "#FDFAF4"} intensity={2.5} shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={25} shadow-camera-bottom={-25} shadow-camera-near={.5} shadow-camera-far={65} shadow-bias={-.0002}/>
 <mesh position={[0,0,-24]}><planeGeometry args={[80,28]}/><meshBasicMaterial map={sky} fog={false}/></mesh>
 <RiverParticles rain={rain} paused={paused} visible={visible}/>
 <RiverLife time={clock} paused={paused} visible={visible} onSplash={fishSplash}/>
 <ErodedBanks texture={floor}/>
 <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,-.8,-6]}><planeGeometry args={[60,65]}/><meshStandardMaterial map={floor} color="#F1E9DB" roughness={1}/></mesh>
 <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,-.7,-6]}><planeGeometry args={[12,35]}/><meshStandardMaterial map={floor} color="#F1E9DB" roughness={1}/></mesh>
 {Array.from({length:30},(_,i)=>{const x=Math.sin(i*2.4)*4.1,z=-20+(i*3.17)%33;return <mesh key={`stone-${i}`} position={[x,-.47,z]} scale={[.28+(i%3)*.17,.16,.35+(i%4)*.12]}><icosahedronGeometry args={[1,1]}/><meshStandardMaterial map={floor} color="#F1E9DB" roughness={.9}/></mesh>;})}
 {[-1,1].map(side=><group key={`bank-${side}`}>{Array.from({length:11},(_,i)=>{const h=5.5+(i%4)*.65;return <mesh castShadow key={i} position={[side*(5.2+(i%3)*.7),h/2-.05,6-i*2.8]} rotation={[0,side*.1,0]}><planeGeometry args={[h*.67,h]}/><meshBasicMaterial map={tree} transparent alphaTest={.2} side={DoubleSide} toneMapped={false}/></mesh>;})}</group>)}
 <primitive object={surface} dispose={null} onPointerDown={touch} onPointerMove={touch}/></>;
}

export default function RiverScene(props:{paused:boolean;visible:boolean;wind:boolean;rain:boolean;sunset:boolean;touchSignal:number;onTouch:()=>void;onFailure:()=>void;view:{yaw:number;pitch:number};onViewChange:(view:{yaw:number;pitch:number})=>void}) {
 return <Canvas shadows role="img" aria-label="Rio em três dimensões, com árvores, céu, pedras e reflexos; use os controles abaixo para interagir" frameloop="demand" dpr={[1,1.5]} camera={{position:[0,6,8],fov:48,near:.1,far:65}} gl={{antialias:false,powerPreference:"low-power"}} fallback={<p>Use a paisagem estática para acompanhar o rio.</p>}><Suspense fallback={null}><River {...props}/></Suspense></Canvas>;
}
