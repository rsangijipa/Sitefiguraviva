import { resourceCatalog, resourceAliases, resolveResourceSlug,resolveResourceDestination,resourceHref,isPublicResource } from "../resourceCatalog";
describe("Figura Viva v2 catalog and destinations",()=>{
 it("registers fifteen consolidated and three draft learning resources",()=>{
  expect(resourceCatalog).toHaveLength(18);
  expect(resourceCatalog.filter(item=>item.visibility==="draft")).toHaveLength(3);
  expect(resourceCatalog.filter(item=>item.visibility==="hidden").map(item=>item.slug)).toEqual(["instrumentos-em-estudo"]);
  expect(new Set(resourceCatalog.map(item=>item.slug)).size).toBe(18);
 });
 it("exposes published self-guided experiences while keeping learning and case-study tools in formation",()=>{
  expect(resourceCatalog.filter(isPublicResource).map(item=>item.slug)).toEqual([
   "cartas-gestalticas","figura-e-fundo","chegada","mapa-do-corpo","roda-das-emocoes",
   "necessidades-agora","paisagem-de-pensamentos","sons-para-awareness","sala-de-pausa","igarape",
  ]);
  expect(resourceCatalog.filter(item=>item.category==="APRENDER" && item.slug!=="cartas-gestalticas" && item.slug!=="figura-e-fundo").every(item=>!isPublicResource(item))).toBe(true);
  expect(isPublicResource(resourceCatalog.find(item=>item.slug==="polaridades-e-cadeiras")!)).toBe(false);
  for(const resource of resourceCatalog)expect(resourceHref(resource)).toBe(`${resource.access==="public"?"/recursos":"/portal/recursos"}/${resource.slug}`);
 });
 it("resolves each legacy alias to one registered resource and validates modes",()=>{
  for(const [alias,target] of Object.entries(resourceAliases)){
   expect(resourceCatalog.some(item=>item.slug===alias)).toBe(false);
   expect(resolveResourceDestination(alias)).toEqual(target);
   expect(resourceCatalog.some(item=>item.slug===target.slug)).toBe(true);
  }
  expect(resolveResourceDestination("check-in")).toEqual({slug:"chegada",mode:"completa"});
  expect(resolveResourceDestination("somascan")).toEqual({slug:"mapa-do-corpo",mode:"percorrer"});
  expect(resolveResourceDestination("lago","arbitrary")).toEqual({slug:"igarape"});
  expect(resolveResourceDestination("chegada","breve")).toEqual({slug:"chegada",mode:"breve"});
 });
 it("does not use inherited object properties as aliases",()=>{
  for(const slug of ["constructor","toString","__proto__","unknown-resource"])expect(resolveResourceSlug(slug)).toBe(slug);
 });
});
