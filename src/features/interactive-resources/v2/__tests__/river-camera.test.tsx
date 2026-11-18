import {fireEvent,render,screen} from "@testing-library/react";
import {WaterStage} from "../WaterStage";
import {attachRiverCameraControls} from "../immersive/river-camera-controls";
jest.mock("../ResourceShell",()=>({useResourceMotion:()=>false}));
jest.mock("next/dynamic",()=>()=>function MockRiver({view,paused}:{view:{yaw:number;pitch:number};paused:boolean}){return <div data-testid="river-camera">{view.yaw.toFixed(2)} / {view.pitch.toFixed(2)} / {paused ? "pausado" : "ativo"}</div>;});
it("allows a limited camera rotation and a return to the center",()=>{
 render(<WaterStage/>);const camera=screen.getByTestId("river-camera");
 for(let i=0;i<6;i++)fireEvent.click(screen.getByRole("button",{name:"Olhar à direita"}));
 expect(camera).toHaveTextContent("0.38 / 0.00 / ativo");
 fireEvent.click(screen.getByRole("button",{name:"Pausar água"}));expect(camera).toHaveTextContent("pausado");
 fireEvent.click(screen.getByRole("button",{name:"Centralizar visão"}));expect(camera).toHaveTextContent("0.00 / 0.00 / pausado");
});
it("keeps the static alternative available without the 3D controls",()=>{
 render(<WaterStage forceStatic/>);expect(screen.queryByTestId("river-camera")).not.toBeInTheDocument();expect(screen.getByRole("button",{name:"Olhar à esquerda"})).toBeDisabled();
});
it("rotates only with the middle mouse button and removes listeners on cleanup",()=>{
 const canvas=document.createElement("canvas");canvas.setPointerCapture=jest.fn();canvas.hasPointerCapture=jest.fn().mockReturnValue(true);canvas.releasePointerCapture=jest.fn();
 let view={yaw:0,pitch:0};const changed=jest.fn((next:{yaw:number;pitch:number})=>{view=next;});const invalidate=jest.fn();
 const cleanup=attachRiverCameraControls(canvas,()=>view,changed,invalidate);
 const event=(type:string,button:number,x:number,y:number)=>canvas.dispatchEvent(new MouseEvent(type,{button,clientX:x,clientY:y,bubbles:true,cancelable:true}));
 event("pointerdown",0,10,10);event("pointermove",0,80,70);expect(changed).not.toHaveBeenCalled();
 event("pointerdown",1,10,10);event("pointermove",1,110,60);expect(view.yaw).toBeCloseTo(-.3);expect(view.pitch).toBeCloseTo(.15);expect(invalidate).toHaveBeenCalled();
 event("pointerup",1,110,60);cleanup();event("pointerdown",1,10,10);event("pointermove",1,30,30);expect(changed).toHaveBeenCalledTimes(1);
});
