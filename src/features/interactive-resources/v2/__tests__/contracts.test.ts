import { validateRecord,retentionExpiry } from "../contracts";
import { emptyEditorialConfig,emptyEditorialItem,EditorialConfigSchema,assertPublishable,assertArtCovered,isBrandAsset,DECKS } from "../editorial-schema";
import { decodeLegacyImport,LegacyImportSchema } from "../legacy-import";
import {isResourceLocation,containsResourceLocation} from "@/lib/observability/resource-privacy";
import {TextEncoder} from "node:util";
Object.assign(globalThis,{TextEncoder});
const formationId="11111111-1111-4111-a111-111111111111";
const envelope=(resourceKey:string,payload:unknown)=>({resourceKey,payload,schemaVersion:1,formationId,clientRequestId:"22222222-2222-4222-a222-222222222222",contentVersion:null});
describe("private records contract",()=>{
 it("accepts a minimal optional arrival without interpretation",()=>{
  expect(validateRecord(envelope("chegada",{word:"",body:[],emotion:"",intensity:null,needs:[],reflection:""})).payload).toMatchObject({intensity:null});
 });
 it.each([
  envelope("arbitrary",{}),
  {...envelope("chegada",{}),ownerId:"someone"},
  {...envelope("chegada",{}),schemaVersion:2},
  envelope("paisagem-de-pensamentos",{mode:"rio",thoughts:["Texto neutro"],reflection:""}),
  envelope("chegada",{word:"",body:[],emotion:"",intensity:11,needs:[],reflection:""}),
  envelope("sala-de-pausa",{practice:"respirar",seconds:86401,reflection:""}),
 ])("rejects unknown fields, resources, versions and invalid values",record=>expect(()=>validateRecord(record)).toThrow());
 it("enforces UTF-8 bytes even when character counts are within their limits",()=>{
  expect(()=>validateRecord(envelope("paisagem-de-pensamentos",{mode:"jardim",thoughts:Array(20).fill("あ".repeat(500)),reflection:""}))).toThrow();
 });
 it("clamps six calendar months and uses the earlier departure",()=>{
  expect(retentionExpiry("2026-08-31T10:00:00Z")).toBe("2027-02-28T10:00:00.000Z");
  expect(retentionExpiry("2027-01-01T00:00:00Z","2026-10-12T00:00:00Z")).toBe("2027-04-12T00:00:00.000Z");
  expect(()=>retentionExpiry("invalid")).toThrow();
 });
});
describe("editorial structures",()=>{
 it("creates empty structures and allows incomplete references only in drafts",()=>{
  const config=emptyEditorialConfig("cartas-gestalticas");expect(config.items).toEqual([]);expect(()=>assertPublishable(config)).toThrow();
  const item=emptyEditorialItem("card","neutral-id","fundamentos");item.references=[{author:"",work:"",year:null,edition:"",pages:""}];
  expect(EditorialConfigSchema.safeParse({...config,items:[item]}).success).toBe(true);expect(()=>assertPublishable({...config,items:[item]})).toThrow();
  expect(DECKS.reduce((sum,deck)=>sum+deck.target,0)).toBe(60);
 });
 it("rejects traversal, remote assets, unknown licenses and duplicate identifiers",()=>{
  expect(isBrandAsset("/brand/../private.png","image")).toBe(false);expect(isBrandAsset("https://example.test/img.png","image")).toBe(false);expect(isBrandAsset("/brand/human/asset.svg","image")).toBe(true);
  const item={...emptyEditorialItem("guidance","neutral-id"),title:"Fixture fictícia",text:"Texto neutro de teste"};const config={...emptyEditorialConfig("cartas-gestalticas"),items:[item,item]};expect(()=>assertPublishable(config)).toThrow();
  expect(()=>assertArtCovered({...config,items:[{...item,asset:"/brand/test.svg",license:"Licença fictícia"}]},[])).toThrow();
 });
});
describe("legacy ownership",()=>{
 const row={id:"legacy-1",createdAt:"2026-01-01",attention:"Texto neutro",body:"",feeling:"",need:"",reflection:""};
 it("requires an affirmative ownership statement",()=>{
  expect(LegacyImportSchema.safeParse({sourceKey:"aqui_e_agora_perceptions_v1",formationId,confirmation:"",records:[row]}).success).toBe(false);
 });
 it("refuses other-owner and unknown-field records without discarding them",()=>{
  expect(()=>decodeLegacyImport("aqui_e_agora_perceptions_v1",[{...row,userId:"other"}],"current")).toThrow();
  expect(()=>decodeLegacyImport("aqui_e_agora_perceptions_v1",[{...row,extra:"unknown"}],"current")).toThrow();
  expect(decodeLegacyImport("aqui_e_agora_perceptions_v1",[row],"current")[0].resourceKey).toBe("chegada");
 });
});
describe("observability privacy",()=>{
 it.each(["/portal/recursos/chegada","https://site.test/recursos/cartas-gestalticas?modo=copa","/api/internal/recursos/maintenance"])("blocks resource telemetry at %s",path=>expect(isResourceLocation(path)).toBe(true));
 it("also blocks server actions whose referrer is a resource",()=>{
  expect(containsResourceLocation({request:{url:"/action",headers:{Referer:"https://site.test/portal/recursos/chegada"}}})).toBe(true);expect(isResourceLocation("/portal/cursos")).toBe(false);
 });
});
