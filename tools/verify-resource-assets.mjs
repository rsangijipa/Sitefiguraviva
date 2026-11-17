import {readFile,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import path from "node:path";
import sharp from "sharp";

const manifestPath=path.resolve("docs/recursos-assets-production.json");
const manifest=JSON.parse(await readFile(manifestPath,"utf8"));
const record=process.argv.includes("--record");
let total=0;
for(const asset of manifest.assets){
  if(!/^\/brand\/recursos\/[a-z0-9/-]+\.webp$/.test(asset.file))throw new Error(`Unexpected asset path: ${asset.file}`);
  const bytes=await readFile(path.join("public",asset.file));
  const {width,height,format}=await sharp(bytes).metadata();
  const sha256=createHash("sha256").update(bytes).digest("hex");
  if(format!=="webp" || bytes.length>200000)throw new Error(`Invalid format or size: ${asset.file}`);
  if(record)Object.assign(asset,{width,height,bytes:bytes.length,sha256});
  else if(asset.sha256!==sha256 || asset.width!==width || asset.height!==height || asset.bytes!==bytes.length)throw new Error(`Asset differs from production manifest: ${asset.file}`);
  total+=bytes.length;
}
const candidates=JSON.parse(await readFile("public/brand/audio/awareness/curation-candidates.json","utf8"));
for(const sound of candidates.audio){
  if(!/^\/brand\/audio\/awareness\/[a-z-]+\.wav$/.test(sound.path))throw new Error(`Unexpected audio path: ${sound.path}`);
  const wav=await readFile(path.join("public",sound.path));
  if(wav.toString("ascii",0,4)!=="RIFF" || wav.toString("ascii",8,12)!=="WAVE" || wav.readUInt32LE(24)!==22050 || wav.readUInt16LE(22)!==1 || wav.readUInt16LE(34)!==16 || wav.readUInt32LE(40)!==22050*30*2)throw new Error(`Invalid audio format: ${sound.path}`);
}
if(record)await writeFile(manifestPath,JSON.stringify(manifest,null,2)+"\n");
console.log(`${manifest.assets.length} WebP assets verified (${(total/1024/1024).toFixed(2)} MiB total; each <= 200 KB). ${candidates.audio.length} synthesized WAV candidates verified.`);
