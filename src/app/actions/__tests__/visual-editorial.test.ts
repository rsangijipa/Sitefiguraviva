jest.mock("@/lib/auth/server",()=>({requireAdmin:jest.fn().mockResolvedValue({})}));
jest.mock("next/cache",()=>({revalidatePath:jest.fn()}));
jest.mock("@/infrastructure/supabase/server",()=>({createSupabaseServiceClient:jest.fn(),createSupabaseAnonServerClient:jest.fn()}));
import {createSupabaseServiceClient} from "@/infrastructure/supabase/server";
import {saveGalleryItemAction} from "../gallery";
import {saveBlogPostAction} from "../blog";
const client=jest.mocked(createSupabaseServiceClient);
function database(legacy:Record<string,unknown>){
 const update=jest.fn().mockReturnValue({eq:jest.fn().mockResolvedValue({error:null})});
 const single=jest.fn().mockResolvedValue({data:{legacy_payload:legacy},error:null});
 client.mockReturnValue({from:jest.fn().mockReturnValue({select:jest.fn().mockReturnValue({eq:jest.fn().mockReturnValue({single})}),update})} as never);
 return {update};
}
beforeEach(()=>jest.clearAllMocks());
it("preserva metadados existentes ao editar ano e categoria de uma foto",async()=>{
 const {update}=database({credit:"Acervo",year:"2020",category:"Eventos"});
 const result=await saveGalleryItemAction("item",{title:"Encontro",src:"https://example.com/foto.jpg",year:"2022",category:"Oficina"});
 expect(result.success).toBe(true);expect(update.mock.calls[0][0].legacy_payload).toEqual({credit:"Acervo",year:"2022",category:"Oficina"});
});
it("mantém metadados e salva autoria ao editar uma publicação",async()=>{
 const {update}=database({archivedCredit:"Acervo"});
 const result=await saveBlogPostAction("post",{title:"Diário",type:"blog",post_format:"video",youtube_url:"https://youtu.be/dQw4w9WgXcQ",author:"Autora",bg_style:"forest"});
 expect(result.success).toBe(true);expect(update.mock.calls[0][0].legacy_payload).toMatchObject({archivedCredit:"Acervo",author:"Autora",post_format:"video",bg_style:"forest"});
});
it("recusa vídeo de endereço inválido antes de gravar",async()=>{
 const {update}=database({});const error=jest.spyOn(console,"error").mockImplementation(()=>{});
 const result=await saveBlogPostAction("post",{title:"Diário",type:"blog",post_format:"video",youtube_url:"https://example.com/not-video"});
 expect(result.success).toBe(false);expect(update).not.toHaveBeenCalled();error.mockRestore();
});
