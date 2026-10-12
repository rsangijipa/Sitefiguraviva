import type { EditorialItem } from "./editorial-schema";
const LABELS: Record<string,string> = {
 word:"Palavra",emotion:"Emoção",intensity:"Intensidade",reflection:"Reflexão",
 observable:"Observações",question:"Pergunta",experiment:"Experimento",field:"Campo",
 rewrite:"Reescrita",response:"Resposta",seconds:"Tempo em segundos",position:"Posição entre os lados",
 emotionId:"Emoção",itemId:"Item de estudo",caseId:"Caso estudado",
};
export function RecordSummary({ payload, labels=[] }: { payload: unknown; labels?:Pick<EditorialItem,"id"|"title">[] }) {
 if(!payload || typeof payload!=="object" || Array.isArray(payload)) return <p>Você pode encerrar sem guardar.</p>;
 const values=payload as Record<string,unknown>;
 const title=(id:string) => labels.find(item => item.id===id)?.title ?? id;
 const points=Array.isArray(values.body) ? values.body : Array.isArray(values.regions) ? values.regions : [];
 const names=Array.isArray(values.names) ? values.names : [];
 return <div className="fv-summary">
  {Object.entries(LABELS).flatMap(([key,label]) => {
   const value=values[key];
   return (typeof value==="string" && value.trim()) || typeof value==="number" ? [<p key={key}><strong>{label}:</strong> {["emotion","emotionId","itemId","caseId"].includes(key) && typeof value==="string" ? title(value) : String(value)}</p>] : [];
  })}
  {!!points.length && <ul>{points.map((point,index) => {if(!point || typeof point!=="object") return null; const data=point as Record<string,unknown>; return <li key={index}>{String(data.region)} · {String(data.view)}: {String(data.sensation)}{data.note ? ` — ${String(data.note)}` : ""}{typeof data.intensity==="number"?`, intensidade ${data.intensity} de 5`:" · intensidade não registrada"}.</li>;})}</ul>}
  {(["needs","ids"] as const).flatMap(key => Array.isArray(values[key]) ? [<p key={key}><strong>Necessidades:</strong> {(values[key] as unknown[]).filter(item => typeof item==="string").map(item => title(String(item))).join(", ") || "Nenhuma selecionada"}</p>] : [])}
  {!!names.length && <p><strong>Lados:</strong> {names.map(String).join(" / ")}</p>}
  {(["thoughts","observations"] as const).flatMap(key => Array.isArray(values[key]) ? [<ul key={key}>{(values[key] as unknown[]).filter(item => typeof item==="string").map((item,index) => <li key={index}>{String(item)}</li>)}</ul>] : [])}
  {Array.isArray(values.turns) && <ol>{values.turns.map((turn,index) => {if(!turn || typeof turn!=="object") return null;const item=turn as Record<string,unknown>;return <li key={index}><strong>{String(names[Number(item.side)] || `Lado ${Number(item.side)+1}`)}:</strong> {String(item.text)}</li>;})}</ol>}
  {Array.isArray(values.steps) && <ol>{values.steps.map((step,index) => {if(!step || typeof step!=="object") return null;const item=step as Record<string,unknown>;return <li key={index}>{String(item.text)}</li>;})}</ol>}
  {Array.isArray(values.classification) && <ol>{values.classification.map((entry,index)=>{if(!entry || typeof entry!=="object")return null;const item=entry as Record<string,unknown>;const names:Record<string,string>={observacao:"Observação",interpretacao:"Interpretação",julgamento:"Julgamento"};return <li key={index}>Trecho {index+1}: {names[String(item.kind)]??"Sem classificação"}</li>;})}</ol>}
  {Array.isArray(values.favorites) && <p>Cartas marcadas como favoritas: {values.favorites.length}</p>}
  {Array.isArray(values.review) && <p>Cartas marcadas para rever: {values.review.length}</p>}
 </div>;
}
