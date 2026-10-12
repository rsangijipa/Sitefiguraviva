"use client";
import {useState} from "react";
import {EditorialConfigSchema,type EditorialConfig} from "./editorial-schema";
import {Button,TextArea} from "./ui";
export function StructuredEditorialFields({configuration,onApply}:{configuration:EditorialConfig;onApply:(configuration:EditorialConfig)=>void}) {
 const [buffer,setBuffer]=useState(JSON.stringify(configuration,null,2));const [error,setError]=useState("");
 const apply=()=>{try{const parsed=EditorialConfigSchema.parse(JSON.parse(buffer));if(parsed.resourceKey!==configuration.resourceKey)throw new Error();onApply(parsed);setError("");}catch{setError("JSON incompleto ou fora do contrato. Os campos atuais foram preservados.");}};
 return <details><summary>Campos estruturados de segmentos, alternativas e áudio</summary><p>Use o contrato documentado para segmentos, alternativas e áudio licenciado.</p><TextArea label="Configuração editorial completa (JSON)" value={buffer} maxLength={524288} onChange={setBuffer}/><div className="fv-actions"><Button secondary onClick={()=>setBuffer(JSON.stringify(configuration,null,2))}>Copiar campos atuais para este editor</Button><Button onClick={apply}>Aplicar configuração validada</Button></div>{error && <p role="alert" className="fv-error">{error}</p>}</details>;
}
