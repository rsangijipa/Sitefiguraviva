// Mechanical migration of existing values; does not create illustration assets.
import { readFileSync,writeFileSync,readdirSync } from "node:fs";
import { resolve,join,relative } from "node:path";
import ts from "typescript";
import postcss from "postcss";
const colors=["005A1F","07614C","96551F","FDFAF4","262B22","F1E9DB","D8CFBE","6B6B63","4B4B49","FE538B","FED701","01C94D"];
const rgb=color=>[0,2,4].map(start=>parseInt(color.slice(start,start+2),16));
const nearest=(input)=>colors.reduce((best,color)=>{const candidate=rgb(color);const distance=candidate.reduce((sum,value,index)=>sum+(value-input[index])**2,0);return distance<best.distance?{color,distance}:best;},{color:colors[0],distance:Infinity}).color;
function normalize(value){
 let output=value.replace(/#([a-f\d]{8}|[a-f\d]{6}|[a-f\d]{4}|[a-f\d]{3})\b/gi,(match,hex)=>{
  const expanded=hex.length<=4?hex.split("").map(char=>char+char).join(""):hex;
  const color=nearest(rgb(expanded.slice(0,6)));
  return expanded.length===8 ? `rgb(${rgb(color).join(" ")} / ${(parseInt(expanded.slice(6),16)/255).toFixed(3)})` : "#"+color;
 });
 output=output.replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/gi,(_,r,g,b,a)=>`rgb(${rgb(nearest([+r,+g,+b])).join(" ")}${a===undefined?"":" / "+a})`);
 output=output.replace(/\b(?:shadow(?:-[\w.-]+|\[[^\]]+\])?|drop-shadow(?:-[\w.-]+|\[[^\]]+\])?|backdrop-blur(?:-[\w.-]+|\[[^\]]+\])?)\b/g,"");
 output=output.replace(/\b(bg|text|border|fill|stroke)-(white|black|stone-\d+|gray-\d+)\b/g,(_,utility,color)=>{
  const light=color==="white" || (/(?:stone|gray)-(\d+)/.test(color) && +color.match(/\d+/)[0]<=300);
  return utility+"-"+(utility==="bg" ? light?"paper":"primary" : utility==="border" ? "nevoa" : light?"paper":"mata");
 });
 output=output.replace(/Plus Jakarta Sans|Lato|Roboto/g,"Karla").replace(/Newsreader|Cormorant Garamond|Source Serif 4/g,"Fraunces");
 if(/gradient/.test(output) && ["#FE538B","#FED701","#01C94D"].every(color=>output.includes(color))){
  let index=0;output=output.replace(/#(?:FE538B|FED701|01C94D)/g,()=>["#FE538B","#FED701","#01C94D"][index++%3]);
 }
 return output;
}
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(dir,entry.name)):[join(dir,entry.name)]);}
const files=[...walk(resolve("src/components/resources")),...walk(resolve("src/features/interactive-resources"))].filter(path=>/\.(css|tsx?|jsx?)$/.test(path) && !/__tests__|\.test\./.test(path));
const changes=[];
for(const path of files){
 const before=readFileSync(path,"utf8");let after=before;
 if(path.endsWith(".css")){
  const ast=postcss.parse(before);
  ast.walkDecls(decl=>{
   if(["box-shadow","backdrop-filter"].includes(decl.prop) || decl.prop==="filter" && /blur|drop-shadow/.test(decl.value))decl.value="none";
   else decl.value=normalize(decl.value);
   if(decl.prop==="--font-serif" && decl.value==="var(--font-serif)" || decl.prop==="--font-sans" && decl.value==="var(--font-sans)")decl.remove();
  });after=ast.toString();
 }else{
  const ast=ts.createSourceFile(path,before,ts.ScriptTarget.Latest,true,path.endsWith("x")?ts.ScriptKind.TSX:ts.ScriptKind.TS);const edits=[];
  const visit=node=>{
   if(ts.isPropertyAssignment(node) && ["boxShadow","backdropFilter"].includes(node.name.getText(ast).replaceAll('"',"").replaceAll("'",""))){edits.push({start:node.initializer.getStart(ast),end:node.initializer.end,text:'"none"'});return;}
   if(ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)){
    const start=node.getStart(ast)+1,end=node.end-1;const original=before.slice(start,end);const text=normalize(original);
    if(text!==original)edits.push({start,end,text});
   }
   ts.forEachChild(node,visit);
  };visit(ast);
  for(const edit of edits.sort((a,b)=>b.start-a.start))after=after.slice(0,edit.start)+edit.text+after.slice(edit.end);
 }
 if(after!==before){writeFileSync(path,after);changes.push(relative(process.cwd(),path).replaceAll("\\","/"));}
}
console.log(JSON.stringify({changed:changes.length,files:changes}));
