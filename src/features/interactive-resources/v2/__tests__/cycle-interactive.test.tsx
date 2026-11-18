import {fireEvent,render,screen,within} from "@testing-library/react";
import {CycleExperience} from "../StudyExperiences";
import {emptyEditorialConfig,emptyEditorialItem,type EditorialVersion} from "../editorial-schema";
import {recordSchemas} from "../contracts";
const item={...emptyEditorialItem("situation","zinker-1"),format:"zinker",title:"Sede na reunião",text:"Uma situação fictícia.",prompt:"O que você percebe?",teacherResponse:"Uma leitura docente.",segments:[{id:"sensacao",text:"Sensação"},{id:"acao",text:"Ação"}]};
const version:EditorialVersion={id:"fixture",resourceKey:"ciclo-do-contato",version:1,status:"published",configuration:{...emptyEditorialConfig("ciclo-do-contato"),items:[item]},authoredBy:null,reviewerName:null,reviewerCrp:null,reviewedAt:null,updatedAt:"2026-11-16"};
it("synchronizes the diagram and phase buttons and completes the existing record schema",()=>{
 const onComplete=jest.fn();render(<CycleExperience mode="guiado" version={version} emotions={[]} needs={[]} cases={[]} concepts={[]} onDraft={jest.fn()} onComplete={onComplete}/>);
 fireEvent.click(screen.getByRole("button",{name:"Fase 1: Sensação"}));
 expect(within(screen.getByRole("group",{name:"Etapas do ciclo"})).getByRole("button",{name:/Sensação/})).toHaveAttribute("aria-pressed","true");
 fireEvent.click(screen.getByRole("button",{name:"Comparar leituras"}));expect(screen.getByText("Uma leitura docente.")).toBeInTheDocument();
 fireEvent.click(screen.getByRole("button",{name:"Recolher leitura docente"}));expect(screen.queryByText("Uma leitura docente.")).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole("button",{name:"Concluir estudo"}));expect(recordSchemas["ciclo-do-contato"].safeParse(onComplete.mock.calls[0][0]).success).toBe(true);
});
