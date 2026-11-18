// Original, deterministic sound synthesis; these are not field recordings.
// Run: node tools/generate-awareness-audio.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const rate=22050;
const seconds=30;
const directory=path.resolve("public/brand/audio/awareness");
const sounds=[
  {id:"chuva-sintetizada",title:"Textura de chuva · síntese",seed:1301,kind:"rain",description:"Uma textura contínua de pequenos ruídos, sem trovões ou mudanças bruscas."},
  {id:"vento-sintetizado",title:"Vento suave · síntese",seed:4703,kind:"wind",description:"Um sopro grave e contínuo que cresce e diminui lentamente."},
  {id:"agua-sintetizada",title:"Água em movimento · síntese",seed:7907,kind:"water",description:"Uma textura fluida e irregular, com pequenas variações suaves."},
];

function synthesize({seed,kind}){
  let state=seed;
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296*2-1;};
  const samples=new Float32Array(rate*seconds);
  let slow=0,medium=0,peak=0;
  for(let i=0;i<samples.length;i++){
    const time=i/rate,noise=random();
    slow=slow*.995+noise*.005;
    medium=medium*.88+noise*.12;
    const fade=Math.sin(Math.min(1,time/1.5,(seconds-time)/1.5)*Math.PI/2)**2;
    const swell=.75+.15*Math.sin(time*.47)+.1*Math.sin(time*.19+seed);
    let value;
    if(kind==="wind")value=slow*7;
    else if(kind==="rain")value=noise*.1+medium*.8;
    else value=medium*(.45+.25*Math.sin(time*2.3)) + slow*3;
    samples[i]=value*fade*swell;
    peak=Math.max(peak,Math.abs(samples[i]));
  }
  const wav=Buffer.alloc(44+samples.length*2);
  wav.write("RIFF",0);wav.writeUInt32LE(wav.length-8,4);wav.write("WAVEfmt ",8);
  wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);
  wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);
  wav.write("data",36);wav.writeUInt32LE(samples.length*2,40);
  for(let i=0;i<samples.length;i++)wav.writeInt16LE(Math.round(samples[i]/peak*.55*32767),44+i*2);
  return wav;
}

await mkdir(directory,{recursive:true});
for(const sound of sounds)await writeFile(path.join(directory,`${sound.id}.wav`),synthesize(sound));
await writeFile(path.join(directory,"curation-candidates.json"),JSON.stringify({
  curationRequired:true,
  note:"Texturas sintetizadas para este projeto. Não são gravações de natureza. Importar somente após escuta e curadoria; este arquivo não publica conteúdo editorial.",
  audio:sounds.map(sound=>({id:sound.id,title:sound.title,path:`/brand/audio/awareness/${sound.id}.wav`,credit:"Síntese procedural original para o Instituto Figura Viva",license:"Produzido para uso no projeto Figura Viva"})),
  textAlternatives:sounds.map(sound=>({id:sound.id,text:sound.description})),
},null,2)+"\n");
console.log(`Created ${sounds.length} synthesized 30-second mono WAV assets at ${rate} Hz.`);
