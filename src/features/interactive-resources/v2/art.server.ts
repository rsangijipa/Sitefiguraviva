import "server-only";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {join} from "node:path";
import {ArtManifestSchema,assertArtCovered,type EditorialConfig} from "./editorial-schema";
export async function verifyApprovedAssets(configuration:EditorialConfig,assets:unknown){
 assertArtCovered(configuration,assets);
 const used=new Set([...configuration.items.map(item=>item.asset),...configuration.audio.map(item=>item.path)].filter(Boolean));
 await Promise.all(ArtManifestSchema.parse(assets).filter(asset=>used.has(asset.path)).map(async asset=>{
  const bytes=await readFile(join(process.cwd(),"public",asset.path));
  if(createHash("sha256").update(bytes).digest("hex")!==asset.sha256)throw new Error("Approved asset version mismatch");
 }));
}
