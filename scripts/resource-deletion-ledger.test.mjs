import {test} from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,rm,readFile,writeFile} from 'node:fs/promises';import {join,resolve,sep} from 'node:path';import {createResourceDeletionLedger} from './resource-deletion-ledger.mjs';
test('durable idempotent tombstones, external lock and snapshot replay',async()=>{
 const directory=await mkdtemp(join(resolve('.next-v2-tools'),'ledger-test-'));const token='test-only-secret-'.repeat(3);const server=await createResourceDeletionLedger({directory,token});await new Promise(done=>server.listen(0,'127.0.0.1',done));const url=`http://127.0.0.1:${server.address().port}/ledger`;
 const receipt={requestId:'test-request',deletedAt:new Date().toISOString(),records:[{table:'arrival_records',id:'00000000-0000-4000-8000-000000000001'}]};const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json','Idempotency-Key':receipt.requestId};
 try{
  assert.equal((await fetch(url)).status,401);
  for(let i=0;i<2;i++){const response=await fetch(url,{method:'POST',headers,body:JSON.stringify(receipt)});assert.equal(response.status,200);assert.deepEqual(await response.json(),{requestId:receipt.requestId,durable:true});}
  assert.equal((await readFile(join(directory,'deletions.jsonl'),'utf8')).trim().split('\n').length,1);
  const reopened=await createResourceDeletionLedger({directory,token});await new Promise(done=>reopened.listen(0,'127.0.0.1',done));const reopenedUrl=`http://127.0.0.1:${reopened.address().port}/ledger`;
  const persisted=await (await fetch(reopenedUrl,{method:'POST',headers,body:JSON.stringify(receipt)})).json();assert.deepEqual(persisted,{requestId:receipt.requestId,durable:true});assert.equal((await readFile(join(directory,'deletions.jsonl'),'utf8')).trim().split('\n').length,1);
  await new Promise(done=>reopened.close(done));
  const status=await (await fetch(url+'?operation=status',{headers})).json();assert.equal(status.historyEnabled,false);
  await writeFile(join(directory,'release.json'),JSON.stringify({...status,historyEnabled:true}));
  const locked=await (await fetch(url,{method:'PUT',headers,body:JSON.stringify({historyEnabled:false})})).json();assert.equal(locked.historyEnabled,false);
  const restored=await (await fetch(url+'?operation=restore',{headers})).json();assert.deepEqual(restored.records,receipt.records);assert.equal(restored.nextCursor,null);
  assert.equal((await fetch(url,{method:'POST',headers,body:JSON.stringify({...receipt,owner:'unknown'})})).status,503);
  assert.equal((await fetch(url,{method:'POST',headers,body:JSON.stringify({...receipt,records:[{table:'profiles',id:receipt.records[0].id}]})})).status,503);
 }finally{await new Promise(done=>server.close(done));const root=resolve('.next-v2-tools');if(!directory.startsWith(root+sep))throw new Error('unsafe test cleanup');await rm(directory,{recursive:true,force:true});}
});
