import { readFileSync } from "node:fs";
import { join } from "node:path";
import {resourceCatalog,resolveResourceDestination} from "../resourceCatalog";
const readSource=(path:string)=>readFileSync(join(process.cwd(),path),"utf8");
describe("Paisagem consolidation",()=>{
 it("retains garden and river as public modes of one self-guided resource",()=>{
  expect(resourceCatalog.filter(item=>item.slug==="paisagem-de-pensamentos")).toHaveLength(1);
  expect(resourceCatalog.find(item=>item.slug==="paisagem-de-pensamentos")).toMatchObject({access:"public",category:"PERCEBER",modes:["jardim","rio"]});
  expect(resolveResourceDestination("rio-dos-pensamentos")).toEqual({slug:"paisagem-de-pensamentos",mode:"rio"});
 });
 it("keeps legacy leaf persistence outside the active experience",()=>{
  const source=readSource("src/features/interactive-resources/v2/ThoughtLandscape.tsx");
  expect(source).not.toMatch(/localStorage|sessionStorage/);
  expect(source).toContain("thoughts:mode===\"jardim\" ? leaves.map(item => item.text) : []");
 });
 it("redirects old portal and history routes",()=>{
  expect(readSource("src/app/portal/recursos/rio-dos-pensamentos/page.tsx")).toContain("/portal/recursos/paisagem-de-pensamentos?modo=rio");
  expect(readSource("src/app/portal/recursos/rio-dos-pensamentos/historico/page.tsx")).toContain("/portal/recursos/meus-registros");
 });
});
