import {fireEvent,render,screen,within} from "@testing-library/react";
import {PausePractice} from "../immersive/PausePractice";
import {buildPlan} from "../pause/SlowPractice";
import {BREATH_PATTERNS} from "../pause/breath-patterns";

it("permite escolher os sentidos que fazem sentido agora",()=>{
 render(<PausePractice practice="pelos-sentidos" paused={false} motion={false}/>);
 const group=within(screen.getByRole("group",{name:"Sentidos"}));
 expect(group.getByRole("button",{name:"Ver"})).toHaveAttribute("aria-pressed","true");
 fireEvent.click(group.getByRole("button",{name:"Tocar"}));
 expect(group.getByRole("button",{name:"Tocar"})).toHaveAttribute("aria-pressed","true");
 fireEvent.click(group.getByRole("button",{name:"Ver"}));
 expect(group.getByRole("button",{name:"Ver"})).toHaveAttribute("aria-pressed","false");
 expect(screen.getByRole("button",{name:"Tocar sons dos sentidos"})).toBeInTheDocument();
});
it("alterna o que observar: cor, forma, textura e espaço",()=>{
 render(<PausePractice practice="observar" paused={false} motion={false}/>);
 fireEvent.click(screen.getByRole("button",{name:"Uma forma"}));
 expect(screen.getByRole("button",{name:"Uma forma"})).toHaveAttribute("aria-pressed","true");
 expect(screen.getByRole("status")).toHaveTextContent("forma");
});
it("oferece um som que varia de perto a longe",()=>{
 render(<PausePractice practice="ouvir" paused={false} motion/>);
 const slider=screen.getByRole("slider",{name:/de perto a longe/});
 fireEvent.click(screen.getByRole("button",{name:"Passeio automático"}));
 expect(slider).not.toBeDisabled();
 fireEvent.change(slider,{target:{value:"90"}});
 expect(screen.getByText(/Muito longe/)).toBeInTheDocument();
 fireEvent.click(screen.getByRole("button",{name:"Sino"}));
 expect(screen.getByRole("button",{name:"Sino"})).toHaveAttribute("aria-pressed","true");
});
it("movimentar tem mãos, ombros e imobilidade",()=>{
 render(<PausePractice practice="movimentar" paused={false} motion/>);
 expect(screen.getByRole("img",{name:/Mão/})).toBeInTheDocument();
 fireEvent.click(screen.getByRole("button",{name:"Ombros"}));
 expect(screen.getByRole("img",{name:/Ombros/})).toBeInTheDocument();
 fireEvent.click(screen.getByRole("button",{name:"Imobilidade"}));
 expect(screen.getByRole("button",{name:"60s"})).toHaveAttribute("aria-pressed","true");
});
it("monta o relógio de tarefas por prioridade, com descansos entre os blocos",()=>{
 render(<PausePractice practice="desacelerar" paused={false} motion/>);
 fireEvent.change(screen.getByLabelText("Nome da tarefa"),{target:{value:"Escrever relatório"}});
 fireEvent.change(screen.getByLabelText("Prioridade"),{target:{value:"alta"}});
 fireEvent.change(screen.getByLabelText("Minutos da tarefa"),{target:{value:"50"}});
 fireEvent.click(screen.getByRole("button",{name:"Adicionar"}));
 expect(screen.getByText("Escrever relatório")).toBeInTheDocument();
 expect(screen.getByText("Total: 55 min")).toBeInTheDocument();
 fireEvent.click(screen.getByRole("button",{name:"Deixar de lado: Escrever relatório"}));
 expect(screen.getByText("Total: 0 min")).toBeInTheDocument();
 expect(screen.getByRole("button",{name:"Retomar: Escrever relatório"})).toBeInTheDocument();
});
it("buildPlan ordena por prioridade e insere descansos",()=>{
 const plan=buildPlan([{id:1,name:"B",priority:"baixa",minutes:10,parked:false},{id:2,name:"A",priority:"alta",minutes:30,parked:false},{id:3,name:"Z",priority:"media",minutes:5,parked:true}],25,5);
 expect(plan.map(item=>[item.kind,item.minutes,item.task?.name])).toEqual([["foco",25,"A"],["descanso",5,undefined],["foco",5,"A"],["descanso",5,undefined],["foco",10,"B"]]);
});
it("oferece seis padrões de respiração",()=>{
 expect(BREATH_PATTERNS).toHaveLength(6);
 render(<PausePractice practice="respirar" paused={false} motion={false}/>);
 fireEvent.click(screen.getByRole("button",{name:"Suspiro cíclico"}));
 expect(screen.getByRole("button",{name:"Suspiro cíclico"})).toHaveAttribute("aria-pressed","true");
});
