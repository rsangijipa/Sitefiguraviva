/** @jest-environment node */
jest.mock("server-only",()=>({}),{virtual:true});
jest.mock("../access.server",()=>({resourceSession:jest.fn(),editorialPermissions:jest.fn(),hasFormationAccess:jest.fn(),historyReleased:jest.fn(),availableFormations:jest.fn()}));
jest.mock("../editorial.server",()=>({publishedEditorial:jest.fn()}));
jest.mock("../releases.server",()=>({releasedLearningResources:jest.fn()}));
jest.mock("../deletion-ledger.server",()=>({appendDeletionReceipt:jest.fn()}));
jest.mock("../database.server",()=>({resourceDatabase:jest.fn(),recordTable:(key:string,mode?:string)=>key==="chegada"?"arrival_records":key==="paisagem-de-pensamentos" && mode==="rio"?"river_sessions":"interactive_resource_entries",RECORD_TABLES:["arrival_records","interactive_resource_entries","river_sessions"]}));
import * as access from "../access.server";
import {publishedEditorial} from "../editorial.server";
import {resourceDatabase} from "../database.server";
import {appendDeletionReceipt} from "../deletion-ledger.server";
import {resourceSnapshot} from "../snapshot.server";
import {savePrivateResourceRecord,deletePrivateResourceRecord,listPrivateResourceRecords} from "../records.actions";
const formation="11111111-1111-4111-a111-111111111111";const requestId="22222222-2222-4222-a222-222222222222";
const envelope={resourceKey:"chegada",schemaVersion:1,formationId:formation,clientRequestId:requestId,contentVersion:null,payload:{word:"",body:[],emotion:"",intensity:null,needs:[],reflection:""}};
beforeEach(()=>{jest.clearAllMocks();jest.mocked(access.resourceSession).mockResolvedValue({uid:"actor",isActive:true,isAdmin:false,isStaff:false});jest.mocked(access.editorialPermissions).mockResolvedValue([]);jest.mocked(access.hasFormationAccess).mockResolvedValue(true);jest.mocked(access.historyReleased).mockResolvedValue(true);jest.mocked(access.availableFormations).mockResolvedValue([{id:formation,title:"Fixture fictícia",endDate:"2027-01-01",expiresAt:"2027-07-01"}]);jest.mocked(publishedEditorial).mockResolvedValue(null);});
it("never serializes formation-only acervos into public snapshots",async()=>{
 const snapshot=await resourceSnapshot("cartas-gestalticas");expect(snapshot.cases).toEqual([]);expect(snapshot.emotions).toEqual([]);expect(snapshot.needs).toEqual([]);
 expect(jest.mocked(publishedEditorial).mock.calls.every(([key])=>key==="cartas-gestalticas")).toBe(true);
});
it("loads published self-guided public resources without a formation session",async()=>{
 jest.mocked(access.resourceSession).mockResolvedValue(null);
 await expect(resourceSnapshot("chegada")).resolves.toMatchObject({version:null,emotions:[],needs:[],cases:[]});
 expect(access.resourceSession).not.toHaveBeenCalled();
 expect(jest.mocked(publishedEditorial).mock.calls.map(([key])=>key)).toEqual(["chegada","cartas-gestalticas","roda-das-emocoes","necessidades-agora"]);
});
it("independently guards private snapshot calls",async()=>{
 jest.mocked(access.resourceSession).mockResolvedValue(null);await expect(resourceSnapshot("casoteca")).rejects.toThrow();expect(publishedEditorial).not.toHaveBeenCalled();
});
it("rejects anonymous, faculty, unknown role state, expired formation and invalid payload before insertion",async()=>{
 jest.mocked(access.resourceSession).mockResolvedValue(null);expect((await savePrivateResourceRecord(envelope)).ok).toBe(false);
 jest.mocked(access.resourceSession).mockResolvedValue({uid:"actor",isActive:true,isAdmin:false,isStaff:false});jest.mocked(access.editorialPermissions).mockRejectedValue(new Error("unavailable"));expect((await savePrivateResourceRecord(envelope)).ok).toBe(false);
 jest.mocked(access.editorialPermissions).mockResolvedValue([{role:"docente_revisor",name:"Revisor fictício",crp:"00/0000"}]);expect((await listPrivateResourceRecords()).ok).toBe(false);
 jest.mocked(access.editorialPermissions).mockResolvedValue([]);jest.mocked(access.availableFormations).mockResolvedValue([]);expect((await savePrivateResourceRecord(envelope)).ok).toBe(false);
 expect((await savePrivateResourceRecord({...envelope,user_id:"other"})).ok).toBe(false);expect(resourceDatabase).not.toHaveBeenCalled();
});
it("never physically deletes when the durable ledger rejects",async()=>{
 const remove=jest.fn();const chain={select:jest.fn().mockReturnThis(),eq:jest.fn().mockReturnThis(),maybeSingle:jest.fn().mockResolvedValue({data:{id:requestId},error:null}),delete:remove};
 jest.mocked(resourceDatabase).mockReturnValue({from:()=>chain} as never);jest.mocked(appendDeletionReceipt).mockRejectedValue(new Error("unconfirmed"));
 expect((await deletePrivateResourceRecord("chegada",requestId)).ok).toBe(false);expect(remove).not.toHaveBeenCalled();
});
it("searches both storage destinations when deleting a landscape record",async()=>{
 const looked:string[]=[];const deleted:string[]=[];
 const from=(table:string)=>{looked.push(table);const query={select:()=>query,eq:()=>query,maybeSingle:async()=>({data:table==="river_sessions"?{id:requestId}:null,error:null}),delete:()=>{deleted.push(table);return {eq:()=>({eq:()=>({eq:async()=>({error:null})})})};}};return query;};
 jest.mocked(resourceDatabase).mockReturnValue({from} as never);jest.mocked(appendDeletionReceipt).mockResolvedValue({requestId:"fixture",deletedAt:"",records:[]});
 expect((await deletePrivateResourceRecord("paisagem-de-pensamentos",requestId)).ok).toBe(true);expect(looked).toContain("river_sessions");expect(deleted).toEqual(["river_sessions"]);
});
