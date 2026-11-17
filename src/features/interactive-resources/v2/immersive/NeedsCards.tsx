import {Check,Leaf} from "lucide-react";
import type {EditorialItem} from "../editorial-schema";
import {IllustrationSlot} from "../illustration/IllustrationSlot";
import {useResourceMotion} from "../ResourceShell";
const needArt:Record<string,string>={descanso:"descanso",seguranca:"seguranca",pertencimento:"pertencimento",autonomia:"autonomia",reconhecimento:"reconhecimento",expressao:"expressao","cuidado-corpo":"cuidado-corpo","cuidado-com-o-corpo":"cuidado-corpo",movimento:"movimento",silencio:"silencio",contato:"contato"};
export function needCardArt(item:Pick<EditorialItem,"id"|"title">){const key=item.title.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-");const art=needArt[item.id] ?? needArt[key];return art ? `/brand/recursos/necessidades/cards/${art}.webp` : "/brand/recursos/necessidades/jardim.webp";}
export function NeedsCards({items,selected,onSelect}:{items:EditorialItem[];selected:string[];onSelect:(id:string)=>void}) {
 const motion=!useResourceMotion();
 return <div className={`im-needs${motion ? "" : " im-reduced"}`} role="group" aria-label="Cartas 3D de necessidades">{items.map((item,index)=><button key={item.id} type="button" className="im-need" aria-pressed={selected.includes(item.id)} onClick={()=>onSelect(item.id)}><IllustrationSlot slot={{path:needCardArt(item),ratio:"4:3",alt:"",brief:""}} decorative/><strong>{item.title}</strong><span>{selected.includes(item.id) ? <Check size={15} aria-hidden="true"/> : <Leaf size={15} aria-hidden="true"/>} {selected.includes(item.id) ? "Escolhida · tocar para retirar" : `Possibilidade ${index+1} · escolher`}</span></button>)}</div>;
}
