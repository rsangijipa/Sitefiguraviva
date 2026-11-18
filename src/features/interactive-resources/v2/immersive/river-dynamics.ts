/** Shared coordinates keep the surface, eroded bank and drifting objects aligned. */
export function riverCenter(z:number) {
 const localY=-(z+6);
 return Math.sin(localY*.18)*.65+Math.sin(localY*.47)*.25;
}
export function leafPosition(time:number,index:number) {
 const z=-21+((time*(.32+(index%3)*.035)+index*3.7)%30);
 return {x:riverCenter(z)+Math.sin(index*5.1)*3.3+Math.sin(time*.24+index)*.12,z};
}
/** Two occasional jumps, with enough quiet time to keep the scene calm. */
export function fishPosition(time:number,index:number) {
 const period=17+index*7,offset=index*8.3+2;
 const phase=((time+offset)%period)/period;
 const duration=2.4/period;
 const progress=phase/duration;
 const jumping=progress>=0 && progress<=1;
 const z=-5-index*7;
 const startX=riverCenter(z)+(index===0 ? -1.8 : 1.25);
 return {jumping,progress,z,x:startX+(jumping ? progress*.85 : 0),height:jumping ? -.12+Math.sin(progress*Math.PI)*.8 : -.35};
}
