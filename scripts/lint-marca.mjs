import { readFileSync,readdirSync } from "node:fs";
import { resolve,join,relative } from "node:path";
import ts from "typescript";
import postcss from "postcss";
const palette=new Set(["005A1F","07614C","96551F","FDFAF4","262B22","F1E9DB","D8CFBE","6B6B63","4B4B49","FE538B","FED701","01C94D"]);
const errors=[];
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(dir,entry.name)):[join(dir,entry.name)]);}
const files=[...walk(resolve("src/components/resources")),...walk(resolve("src/features/interactive-resources"))]
 .filter(path=>/\.(css|tsx?|jsx?)$/.test(path) && !/__tests__|\.test\./.test(path));
const inspect=(value,path,line)=>{
 for(const match of value.matchAll(/#([a-f\d]{8}|[a-f\d]{6}|[a-f\d]{4}|[a-f\d]{3})\b/gi)){
  if(!palette.has(match[1].toUpperCase()))errors.push({file:relative(process.cwd(),path),line,rule:"cor",value:match[0]});
 }
 if(/(?:^|[\s:])(shadow(?:-|\s|$)|drop-shadow|backdrop-blur)/.test(value))errors.push({file:relative(process.cwd(),path),line,rule:"sombra",value:value.slice(0,100)});
 if(/(?:linear|radial)-gradient/.test(value) && ["#FE538B","#FED701","#01C94D"].every(color=>value.toUpperCase().includes(color))){
  const positions=["#FE538B","#FED701","#01C94D"].map(color=>value.toUpperCase().indexOf(color));
  if(!(positions[0]<positions[1] && positions[1]<positions[2]))errors.push({file:relative(process.cwd(),path),line,rule:"gradiente"});
 }
 if(/(font-family|fontFamily)/.test(value) && /Plus Jakarta|Newsreader|Cormorant|Source Serif|Lato|Roboto/.test(value))errors.push({file:relative(process.cwd(),path),line,rule:"fonte"});
};
for(const path of files){
 const source=readFileSync(path,"utf8");
 if(path.endsWith(".css")){
  const ast=postcss.parse(source);
  ast.walkAtRules(rule=>{if(rule.name==="theme" || rule.name==="import" && /tailwindcss|fonts\.googleapis/.test(rule.params))errors.push({file:relative(process.cwd(),path),line:rule.source.start.line,rule:"tailwind4"});});
  ast.walkDecls(decl=>{
   inspect(decl.value,path,decl.source.start.line);
   if((decl.prop==="box-shadow" || decl.prop==="backdrop-filter" || decl.prop==="filter" && /drop-shadow|blur/.test(decl.value)) && decl.value!=="none")errors.push({file:relative(process.cwd(),path),line:decl.source.start.line,rule:"sombra"});
   if(decl.prop==="font-family" && !/var\(--font-(sans|serif|body|display|karla|fraunces)\)|Fraunces|Karla/.test(decl.value))errors.push({file:relative(process.cwd(),path),line:decl.source.start.line,rule:"fonte"});
  });
 }else{
  const ast=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,path.endsWith("x")?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  const visit=node=>{
   if(ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))inspect(node.text,path,ast.getLineAndCharacterOfPosition(node.getStart(ast)).line+1);
   if(ts.isPropertyAssignment(node) && ["boxShadow","backdropFilter"].includes(node.name.getText(ast).replaceAll('"',"").replaceAll("'","")) && node.initializer.getText(ast)!=='"none"' && node.initializer.getText(ast)!=="'none'")errors.push({file:relative(process.cwd(),path),line:ast.getLineAndCharacterOfPosition(node.getStart(ast)).line+1,rule:"sombra"});
   ts.forEachChild(node,visit);
  };visit(ast);
 }
}
console.log(JSON.stringify({files:files.length,errors:errors.length,findings:errors},null,2));
process.exitCode=errors.length?1:0;
