import { readFileSync,writeFileSync,readdirSync } from "node:fs";
import { resolve,relative,join } from "node:path";
import postcss from "postcss";
const root=resolve(process.cwd(),"src/components/resources");
const changes=[]; const theme=new Map();
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(dir,entry.name)):[join(dir,entry.name)]);}
for(const path of walk(root).filter(path=>path.endsWith(".css"))){
 const before=readFileSync(path,"utf8"); const ast=postcss.parse(before);
 ast.walkAtRules(rule=>{
  // Vendor files are independently importable; Tailwind 3 rejects these layers
  // without local @tailwind directives. Keep one global directive entrypoint.
  if(rule.name==="layer" && /^(base|components|utilities)$/.test(rule.params.trim()))rule.replaceWith(...(rule.nodes??[]));
  if(rule.name==="import" && (/tailwindcss/.test(rule.params) || /fonts\.googleapis/.test(rule.params)))rule.remove();
  if(rule.name==="theme"){
   rule.walkDecls(decl=>theme.set(decl.prop,decl.value));rule.remove();
  }
 });
 ast.walkDecls(decl=>{
  if(decl.prop==="font-family")decl.value=/Fraunces|Newsreader|Source Serif|Cormorant|font-(serif|display)/i.test(decl.value) ? "var(--font-serif), serif" : "var(--font-sans), sans-serif";
  if(decl.prop.startsWith("--font-"))decl.value=/Fraunces|Newsreader|Source Serif|Cormorant|serif|display/i.test(decl.value+" "+decl.prop) ? "var(--font-serif)" : "var(--font-sans)";
 });
 ast.walkRules(rule=>{
  let parent=rule.parent;while(parent){if(parent.type==="atrule" && parent.name.endsWith("keyframes"))return;parent=parent.parent;}
  if(rule.selector.includes(".fv-resources"))return;
  const prefix=path.endsWith(".module.css")?":global(.fv-resources)":".fv-resources";
  // These vendor styles use simple comma-separated selectors. Pseudo-function
  // selectors are left intact to avoid changing their internal comma lists.
  if(/:[\w-]+\([^)]*,/.test(rule.selector)) {rule.selector=prefix+" "+rule.selector;return;}
  rule.selector=rule.selector.split(",").map(selector=>{
   const trimmed=selector.trim(); return /^(:root|html|body)(\b|$)/.test(trimmed)?trimmed.replace(/^(:root|html|body)/,prefix):prefix+" "+trimmed;
  }).join(", ");
 });
 const after=ast.toString();if(after!==before){writeFileSync(path,after);changes.push(relative(process.cwd(),path).replaceAll("\\","/"));}
}
console.log(JSON.stringify({changed:changes,themeVariables:Object.fromEntries(theme)},null,2));
