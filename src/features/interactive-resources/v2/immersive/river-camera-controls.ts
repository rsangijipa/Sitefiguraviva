export type RiverView={yaw:number;pitch:number};
/** The primary pointer remains dedicated to ripples; the middle button rotates. */
export function attachRiverCameraControls(canvas:HTMLCanvasElement,getView:()=>RiverView,onChange:(next:RiverView)=>void,invalidate:()=>void) {
 let drag:{x:number;y:number}|null=null;
 const down=(event:PointerEvent)=>{if(event.button!==1)return;event.preventDefault();drag={x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);};
 const move=(event:PointerEvent)=>{if(!drag)return;event.preventDefault();const current=getView();const next={yaw:Math.max(-.38,Math.min(.38,current.yaw-(event.clientX-drag.x)*.003)),pitch:Math.max(-.2,Math.min(.2,current.pitch+(event.clientY-drag.y)*.003))};drag={x:event.clientX,y:event.clientY};onChange(next);invalidate();};
 const up=(event:PointerEvent)=>{if(!drag)return;drag=null;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);};
 canvas.addEventListener("pointerdown",down);canvas.addEventListener("pointermove",move);canvas.addEventListener("pointerup",up);canvas.addEventListener("pointercancel",up);
 return()=>{canvas.removeEventListener("pointerdown",down);canvas.removeEventListener("pointermove",move);canvas.removeEventListener("pointerup",up);canvas.removeEventListener("pointercancel",up);};
}
