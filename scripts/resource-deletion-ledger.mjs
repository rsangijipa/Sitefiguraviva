// Deploy separately from Supabase and its restorable backups, behind HTTPS.
// Standard Node only; persists technical tombstones, never personal responses.
import {createServer} from 'node:http';
import {timingSafeEqual,randomUUID,createHash} from 'node:crypto';
import {mkdir,readFile,open,rename} from 'node:fs/promises';
import {constants} from 'node:fs';
import {dirname} from 'node:path';
import {join,isAbsolute} from 'node:path';
import {pathToFileURL} from 'node:url';
const tables=new Set(['arrival_records','polarity_records','phenomenology_lab_records','interactive_resource_entries','need_records','listening_sessions','pause_sessions','river_sessions']);
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function receipt(value){
 if(!value || Object.keys(value).sort().join(',')!=='deletedAt,records,requestId' || !/^[a-zA-Z0-9:_.-]{1,200}$/.test(value.requestId) || !Number.isFinite(Date.parse(value.deletedAt)) || !Array.isArray(value.records) || !value.records.length || value.records.length>1000)throw new Error('invalid receipt');
 for(const record of value.records)if(!record || Object.keys(record).sort().join(',')!=='id,table' || !tables.has(record.table) || !uuid.test(record.id))throw new Error('invalid record');
 return value;
}
const fingerprint=value=>createHash('sha256').update(JSON.stringify(value.records)).digest('hex');
async function syncDirectory(path){const directory=await open(dirname(path),constants.O_RDONLY);try{await directory.sync();}finally{await directory.close();}}
async function durableJson(path,value){const temporary=path+'.pending';const file=await open(temporary,'w',0o600);try{await file.writeFile(JSON.stringify(value));await file.sync();}finally{await file.close();}await rename(temporary,path);if(process.platform!=='win32')await syncDirectory(path);}
export async function createResourceDeletionLedger({directory,token}){
 if(!isAbsolute(directory) || typeof token!=='string' || token.length<32)throw new Error('absolute ledger directory and strong token required');
 await mkdir(directory,{recursive:true,mode:0o700});const path=join(directory,'deletions.jsonl');const releasePath=join(directory,'release.json');
 const receipts=[];const requests=new Map();let queue=Promise.resolve();
 try{for(const line of (await readFile(path,'utf8')).split('\n').filter(Boolean)){const value=receipt(JSON.parse(line));receipts.push(value);requests.set(value.requestId,fingerprint(value));}}catch(error){if(error.code!=='ENOENT')throw error;}
 try{await readFile(releasePath);}catch(error){if(error.code!=='ENOENT')throw error;await durableJson(releasePath,{historyEnabled:false,releaseId:randomUUID()});}
 const respond=(response,status,data)=>{response.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});response.end(JSON.stringify(data));};
 return createServer(async(request,response)=>{
  const provided=request.headers.authorization?.replace(/^Bearer /,'')??'';
  if(Buffer.byteLength(provided)!==Buffer.byteLength(token) || !timingSafeEqual(Buffer.from(provided),Buffer.from(token))){respond(response,401,{error:'unauthorized'});return;}
  try{
   const url=new URL(request.url,'http://localhost');
   if(request.method==='GET' && url.searchParams.get('operation')==='status'){
    const status=JSON.parse(await readFile(releasePath,'utf8'));if(!uuid.test(status.releaseId) || typeof status.historyEnabled!=='boolean')throw new Error();respond(response,200,{durable:true,historyEnabled:status.historyEnabled,releaseId:status.releaseId});return;
   }
   if(request.method==='GET' && url.searchParams.get('operation')==='restore'){
    const snapshot=Number(url.searchParams.get('snapshot')??receipts.length);const cursor=Number(url.searchParams.get('cursor')??0);
    if(!Number.isSafeInteger(snapshot) || snapshot<0 || snapshot>receipts.length || !Number.isSafeInteger(cursor) || cursor<0)throw new Error();
    const records=receipts.slice(0,snapshot).flatMap(value=>value.records);if(cursor>records.length)throw new Error();const end=Math.min(cursor+1000,records.length);
    respond(response,200,{durable:true,snapshot:String(snapshot),nextCursor:end<records.length?String(end):null,records:records.slice(cursor,end)});return;
   }
   let bytes=0;const chunks=[];for await(const chunk of request){bytes+=chunk.length;if(bytes>1048576)throw new Error();chunks.push(chunk);}const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));
   if(request.method==='PUT' && Object.keys(body).length===1 && body.historyEnabled===false){
    const status=JSON.parse(await readFile(releasePath,'utf8'));await durableJson(releasePath,{historyEnabled:false,releaseId:status.releaseId});respond(response,200,{durable:true,historyEnabled:false,releaseId:status.releaseId});return;
   }
   if(request.method!=='POST')throw new Error();const value=receipt(body);if(request.headers['idempotency-key']!==value.requestId)throw new Error();
   const operation=queue.then(async()=>{const hash=fingerprint(value);const old=requests.get(value.requestId);if(old && old!==hash)throw new Error();if(!old){const file=await open(path,'a',0o600);try{await file.writeFile(JSON.stringify(value)+'\n');await file.sync();}finally{await file.close();}if(process.platform!=='win32')await syncDirectory(path);receipts.push(value);requests.set(value.requestId,hash);}});
   queue=operation.catch(()=>{});await operation;respond(response,200,{requestId:value.requestId,durable:true});
  }catch{respond(response,503,{error:'ledger_unconfirmed'});}
 });
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
 const server=await createResourceDeletionLedger({directory:process.env.FV_LEDGER_DIR,token:process.env.FV_LEDGER_TOKEN});
 server.listen(Number(process.env.FV_LEDGER_PORT??3420),'127.0.0.1',()=>console.log('Technical deletion ledger listening on loopback; HTTPS proxy required.'));
}
