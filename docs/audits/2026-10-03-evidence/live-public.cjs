// Anonymous read-only browser checks. No signup, login, forms or payments.
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const base='https://www.institutofiguraviva.com.br';
const output=path.join(process.cwd(),'docs/audits/2026-10-03-evidence');
async function run(){
 const browser=await chromium.launch({headless:true, channel:'msedge'});
 const context=await browser.newContext({viewport:{width:1365,height:900}});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message.slice(0,200)));
 const results=[];
 for(const route of ['/','/formacoes','/auth','/privacidade','/termos','/contato']){
   try{
    const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForTimeout(1200);
    if(route==='/') await page.locator('h1').first().waitFor({state:'attached',timeout:15000}).catch(()=>{});
    const data=await page.evaluate(()=>({title:document.title,h1:[...document.querySelectorAll('h1')].map(x=>x.textContent.trim()),canonical:document.querySelector('link[rel=canonical]')?.getAttribute('href'),mainCount:document.querySelectorAll('main').length,mainIdCount:document.querySelectorAll('#main-content').length,courseLinks:[...document.querySelectorAll('a[href]')].map(x=>x.getAttribute('href')).filter(x=>/^\/(curso|inscricao)\//.test(x)),navigation:performance.getEntriesByType('navigation').map(x=>({domContentLoadedMs:Math.round(x.domContentLoadedEventEnd),transferSize:x.transferSize})),resources:performance.getEntriesByType('resource').map(x=>({url:x.name.replace(/\?.*$/,''),transferSize:x.transferSize,durationMs:Math.round(x.duration)}))}));
    results.push({route,status:response?.status(),finalUrl:page.url(),...data});
   }catch(error){results.push({route,error:error.message.slice(0,250)});}
 }
 const links=[...new Set(results.flatMap(x=>x.courseLinks||[]))].slice(0,3);
 for(const link of links){try{
   const response=await page.goto(base+link,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForTimeout(800);
   const data=await page.evaluate(()=>({h1:[...document.querySelectorAll('h1')].map(x=>x.textContent.trim()),enrollmentButtons:[...document.querySelectorAll('button')].map(x=>x.textContent.trim()).filter(x=>/Inscri/.test(x)),enrollmentLinks:[...document.querySelectorAll('a[href]')].map(x=>x.getAttribute('href')).filter(x=>x.startsWith('/inscricao/'))}));
   results.push({route:link,status:response?.status(),...data});
 }catch(error){results.push({route:link,error:error.message.slice(0,250)});}}
 for(const route of links.slice(0,2).map(x=>x.replace('/curso/','/inscricao/')).concat(['/portal','/admin'])){
  try{const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:30000});await page.waitForTimeout(800);const data=await page.evaluate(()=>({h1:[...document.querySelectorAll('h1')].map(x=>x.textContent.trim()),buttons:[...document.querySelectorAll('button')].map(x=>x.textContent.trim()),bodyText:document.body.innerText.slice(0,1500)}));results.push({route,status:response?.status(),finalUrl:page.url(),...data});}catch(error){results.push({route,error:error.message.slice(0,250)});}
 }
 await browser.close();
 fs.writeFileSync(path.join(output,'live-public.json'),JSON.stringify({checkedAt:new Date().toISOString(),scope:'Anonymous GET/navigation only; no business flow completed',results,errors},null,2)+'\n');
 console.log(JSON.stringify(results.map(({resources,...x})=>x),null,2));
}
run().catch(error=>{fs.writeFileSync(path.join(output,'live-public-error.log'),error.message+'\n');console.error(error.message);process.exitCode=1;});
