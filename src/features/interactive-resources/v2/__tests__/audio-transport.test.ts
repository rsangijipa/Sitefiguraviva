it("pauses, resumes at the current offset, adjusts volume, and clears a finished track",async()=>{
 const sources:{buffer:AudioBuffer|null;onended:(()=>void)|null;connect:jest.Mock;disconnect:jest.Mock;start:jest.Mock;stop:jest.Mock}[]=[];
 const gain={gain:{setValueAtTime:jest.fn(),linearRampToValueAtTime:jest.fn(),setTargetAtTime:jest.fn()},connect:jest.fn(),disconnect:jest.fn()};
 const context={currentTime:10,destination:{},resume:jest.fn().mockResolvedValue(undefined),createGain:()=>gain,decodeAudioData:jest.fn().mockResolvedValue({duration:30}),createBufferSource:()=>{const source={buffer:null,onended:null,connect:jest.fn(),disconnect:jest.fn(),start:jest.fn(),stop:jest.fn()};sources.push(source);return source;}};
 const oldContext=window.AudioContext,oldFetch=globalThis.fetch;
 const oldAny=AbortSignal.any,oldTimeout=AbortSignal.timeout;
 Object.defineProperty(window,"AudioContext",{configurable:true,writable:true,value:jest.fn(()=>context)});
 globalThis.fetch=jest.fn().mockResolvedValue({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)});
 Object.defineProperty(AbortSignal,"any",{configurable:true,writable:true,value:(signals:AbortSignal[])=>signals[0]});
 Object.defineProperty(AbortSignal,"timeout",{configurable:true,writable:true,value:()=>new AbortController().signal});
 try{
  const {resourceAudioManager:audio}=await import("../audio-manager");
  await audio.activateFromGesture();
  expect(await audio.play("test","https://example.com/sound.mp3")).toBe(false);
  expect(globalThis.fetch).not.toHaveBeenCalled();
  expect(await audio.play("test","/brand/audio/test.wav")).toBe(true);
  expect(sources[0].start).toHaveBeenCalledWith(0,0);
  context.currentTime=13;
  audio.pause("test");
  expect(audio.getPlayback("test")).toMatchObject({paused:true,position:3,duration:30});
  expect(sources[0].stop).toHaveBeenCalled();
  context.currentTime=20;
  expect(await audio.resume("test")).toBe(true);
  expect(sources[1].start).toHaveBeenCalledWith(0,3);
  audio.setVolume("test",.8);
  expect(gain.gain.setTargetAtTime).toHaveBeenCalledWith(.4,20,.05);
  expect(audio.getPlayback("test")).toMatchObject({paused:false,volume:.8});
  sources[1].onended?.();
  expect(audio.getPlayback("test")).toBeNull();
 }finally{
  window.AudioContext=oldContext;globalThis.fetch=oldFetch;
  AbortSignal.any=oldAny;AbortSignal.timeout=oldTimeout;
 }
});
