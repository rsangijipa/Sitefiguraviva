import {useState} from "react";
import {act,fireEvent,render,screen,within} from "@testing-library/react";
import {BodySelector} from "../BodySelector";
import {ArrivalExperience,NeedsExperience} from "../PerceptionExperiences";
import {PauseExperience} from "../PauseExperiences";
import {CycleExperience,FigureExperience} from "../StudyExperiences";
import {ResourceCatalog} from "../ResourceCatalog";
import {emptyEditorialConfig,emptyEditorialItem,type EditorialVersion} from "../editorial-schema";
import type {BodyPoint} from "../contracts";

const base={mode:"breve",version:null,emotions:[],needs:[],cases:[],concepts:[],onDraft:jest.fn(),onComplete:jest.fn()};
function version(key:string,items:EditorialVersion["configuration"]["items"]):EditorialVersion {
 return {id:"fixture",resourceKey:key,version:1,status:"published",configuration:{...emptyEditorialConfig("necessidades-agora"),items},authoredBy:null,reviewerName:null,reviewerCrp:null,reviewedAt:null,updatedAt:"2026-11-16"};
}
beforeAll(()=>{HTMLDialogElement.prototype.showModal=function(){this.setAttribute("open","");};HTMLDialogElement.prototype.close=function(){this.removeAttribute("open");};});
beforeEach(()=>jest.clearAllMocks());

it("loads each body's region and view independently",()=>{
 function Body(){const [points,setPoints]=useState<BodyPoint[]>([]);return <BodySelector value={points} onChange={setPoints}/>;}
 render(<Body/>);
 const sensations=()=>within(screen.getByRole("group",{name:"Sensação"}));
 fireEvent.click(sensations().getByRole("button",{name:/^calor/}));
 fireEvent.change(screen.getByRole("slider",{name:"Intensidade percebida"}),{target:{value:"4"}});
 fireEvent.click(screen.getByRole("button",{name:"Registrar percepção nesta tela"}));
 fireEvent.click(screen.getByRole("button",{name:/^Costas/}));
 expect(sensations().getByRole("button",{name:/^não sei/})).toHaveAttribute("aria-pressed","true");
 expect(screen.getByRole("slider")).toHaveValue("1");
 fireEvent.click(screen.getByRole("button",{name:/^Frente/}));
 expect(sensations().getByRole("button",{name:/^calor/})).toHaveAttribute("aria-pressed","true");
 expect(screen.getByRole("slider")).toHaveValue("4");
 fireEvent.click(within(screen.getByRole("group",{name:"Escolher região"})).getByRole("button",{name:/^peito/}));
 expect(sensations().getByRole("button",{name:/^não sei/})).toHaveAttribute("aria-pressed","true");
});

it("does not represent an unanswered intensity as zero",()=>{
 render(<ArrivalExperience {...base}/>);
 fireEvent.click(screen.getByRole("button",{name:"Começar"}));
 fireEvent.click(screen.getByRole("button",{name:"Pular"}));
 expect(screen.queryByRole("slider")).not.toBeInTheDocument();
 expect(screen.getByRole("status")).toHaveTextContent("ainda não informada");
 fireEvent.click(screen.getByRole("button",{name:"Pular"}));
 fireEvent.click(screen.getByRole("button",{name:"Concluir chegada"}));
 expect(base.onComplete).toHaveBeenCalledWith(expect.objectContaining({intensity:null}));
});

it("explains the selection limit without adding a fourth need",()=>{
 const items=["Descanso","Companhia","Silêncio","Movimento"].map((title,index)=>({...emptyEditorialItem("need",`need-${index}`),title,text:"Uma opção fictícia."}));
 render(<NeedsExperience {...base} version={version("necessidades-agora",items)}/>);
 for(const item of items)fireEvent.click(screen.getByRole("button",{name:new RegExp(`^${item.title}`)}));
 expect(screen.getByRole("status")).toHaveTextContent("3 de 3 escolhidas. Limite atingido.");
 fireEvent.click(screen.getByRole("button",{name:"Concluir"}));
 expect(base.onComplete).toHaveBeenCalledWith(expect.objectContaining({ids:["need-0","need-1","need-2"]}));
});

it("preserves the reflection when choosing another pause and ignores elapsed time as a draft",()=>{
 jest.useFakeTimers();
 render(<PauseExperience {...base} mode="respirar"/>);
 fireEvent.click(screen.getByRole("button",{name:"Começar pausa"}));
 act(()=>jest.advanceTimersByTime(3000));
 expect(base.onDraft).not.toHaveBeenCalled();
 fireEvent.change(screen.getByLabelText("Uma percepção, se quiser"),{target:{value:"Nota temporária"}});
 fireEvent.click(screen.getByRole("button",{name:"Trocar prática"}));
 fireEvent.click(screen.getByRole("button",{name:"Começar pausa"}));
 expect(screen.getByLabelText("Uma percepção, se quiser")).toHaveValue("Nota temporária");
 jest.useRealTimers();
});

it("protects a cycle response when switching the model",()=>{
 const item={...emptyEditorialItem("situation","cycle"),format:"zinker",title:"Situação fictícia",text:"Texto de teste"};
 render(<CycleExperience {...base} version={version("ciclo-do-contato",[item])}/>);
 fireEvent.change(screen.getByLabelText("Sua leitura da situação, se quiser"),{target:{value:"Minha leitura"}});
 fireEvent.click(screen.getByRole("button",{name:/^PHG/}));
 expect(screen.getByRole("dialog",{name:"Deixar esta resposta?"})).toBeInTheDocument();
 fireEvent.click(screen.getByRole("button",{name:"Continuar nesta resposta"}));
 expect(screen.getByLabelText("Sua leitura da situação, se quiser")).toHaveValue("Minha leitura");
});

it("reports Figure and Ground writing to the host for exit protection",()=>{
 const item={...emptyEditorialItem("situation","scene"),format:"clinico",title:"Situação fictícia",text:"Texto de teste"};
 render(<FigureExperience {...base} mode="clinico" version={version("figura-e-fundo",[item])}/>);
 fireEvent.change(screen.getByLabelText("O que apareceu como figura para você?"),{target:{value:"Reflexão"}});
 expect(base.onDraft).toHaveBeenLastCalledWith(expect.objectContaining({reflection:"Reflexão"}));
});

it("combines duration and category filters and lets the person reset an empty result",()=>{
 render(<ResourceCatalog/>);
 fireEvent.change(screen.getByLabelText("Tempo disponível"),{target:{value:"short"}});
 expect(screen.getByRole("link",{name:"Abrir recurso: Necessidades Agora"})).toBeInTheDocument();
 expect(screen.queryByRole("link",{name:"Abrir recurso: Cartas Gestálticas"})).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole("button",{name:/^Pausar/}));
 expect(screen.getByText("Nenhum recurso corresponde a esta combinação.")).toBeInTheDocument();
 fireEvent.click(screen.getByRole("button",{name:"Limpar filtros"}));
 expect(screen.getAllByRole("link",{name:/^Abrir recurso:/})).toHaveLength(11);
});
