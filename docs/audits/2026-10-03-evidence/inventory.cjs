// Read-only repository inventory. No environment values or remote data are read.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const root = process.cwd();
const out = path.join(root, 'docs/audits/2026-10-03-evidence');
const slash = s => s.replaceAll('\\', '/');
function walk(dir, skip = new Set()) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => {
    if (e.isSymbolicLink() || skip.has(e.name)) return [];
    const p = path.join(dir,e.name);
    return e.isDirectory() ? walk(p,skip) : [p];
  });
}
const source = walk(path.join(root,'src')).filter(p=>/\.(tsx?|jsx?|mts|mjs)$/.test(p));
const files = new Map(source.map(p=>[slash(path.relative(root,p)),p]));
const edges = new Map(), imports = [], unresolved = [];
const dependencyCounts = {};
function resolve(from,s) {
  const base = s.startsWith('@/') ? path.join(root,'src',s.slice(2)) : path.resolve(path.dirname(from),s);
  for (const suffix of ['', '.ts','.tsx','.js','.jsx','.mts','.mjs','/index.ts','/index.tsx','/index.js','/index.jsx']) {
    const p = base+suffix;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return slash(path.relative(root,p));
  }
}
for (const [rel,abs] of files) {
  const src=fs.readFileSync(abs,'utf8');
  const ast=ts.createSourceFile(abs,src,ts.ScriptTarget.Latest,true);
  const specs=[];
  function visit(n) {
    if ((ts.isImportDeclaration(n)||ts.isExportDeclaration(n)) && n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier)) specs.push(n.moduleSpecifier.text);
    if (ts.isCallExpression(n) && (n.expression.kind===ts.SyntaxKind.ImportKeyword || n.expression.getText(ast)==='require') && n.arguments[0] && ts.isStringLiteral(n.arguments[0])) specs.push(n.arguments[0].text);
    ts.forEachChild(n,visit);
  }
  visit(ast);
  edges.set(rel,[]);
  for(const spec of specs) {
    if (spec.startsWith('@/')||spec.startsWith('.')) {
      const target=resolve(abs,spec);
      if(target && files.has(target)) edges.get(rel).push(target);
      else if(!target) unresolved.push({from:rel,spec});
      imports.push({from:rel,spec,target:target||null});
    } else {
      const dep=spec.startsWith('@') ? spec.split('/').slice(0,2).join('/') : spec.split('/')[0];
      dependencyCounts[dep]=(dependencyCounts[dep]||0)+1;
    }
  }
}
const test = p=>p.includes('/__tests__/')||/\.(test|spec)\./.test(p)||p.includes('/test-utils/')||p.includes('/security/');
const entries=[...files.keys()].filter(p=>!test(p)&&(p.startsWith('src/app/')&&/\/(page|layout|route|loading|error|not-found|global-error|default|template|sitemap|robots|manifest|opengraph-image|icon)\.[^.]+$/.test(p)||/^src\/(middleware|instrumentation|instrumentation-client|sentry\..*\.config)\./.test(p)));
const reachable=new Set();
function reach(p) {if(reachable.has(p))return;reachable.add(p);for(const q of edges.get(p)||[])reach(q);}
entries.forEach(reach);
const candidates=[...files.keys()].filter(p=>!reachable.has(p)&&!test(p)&&!p.endsWith('.d.ts')&&!p.startsWith('src/scripts/'));
const stats = fs.readdirSync(root,{withFileTypes:true}).filter(e=>e.isDirectory()&&e.name!=='.git').map(e=>{
  const contents=walk(path.join(root,e.name));
  return {directory:e.name,files:contents.length,bytes:contents.reduce((n,p)=>n+fs.statSync(p).size,0)};
});
const publicFiles=walk(path.join(root,'public')).map(p=>({path:slash(path.relative(root,p)),bytes:fs.statSync(p).size}));
const hashes = new Map();
for(const p of walk(path.join(root,'src')).filter(p=>/\.(ts|tsx|js|jsx|css)$/.test(p))) {
  const b=fs.readFileSync(p);if(b.length<100)continue;
  const h=crypto.createHash('sha256').update(b).digest('hex');
  if(!hashes.has(h))hashes.set(h,[]);hashes.get(h).push(slash(path.relative(root,p)));
}
const report={generatedAt:new Date().toISOString(),sourceFiles:files.size,entryPoints:entries.length,runtimeReachable:reachable.size,unreachableCandidates:candidates,unresolvedLocalImports:unresolved,dependencyImportCounts:dependencyCounts,directorySizes:stats,largestPublicFiles:publicFiles.sort((a,b)=>b.bytes-a.bytes).slice(0,40),exactDuplicateGroups:[...hashes.values()].filter(g=>g.length>1),routes:entries.filter(p=>p.startsWith('src/app/')),imports};
fs.writeFileSync(path.join(out,'inventory.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,imports:undefined,routes:undefined,unreachableCandidates:undefined,largestPublicFiles:report.largestPublicFiles.slice(0,10)},null,2));
