import {fireEvent,render,screen} from "@testing-library/react";
import {ArrivalExperience} from "../arrival/ArrivalExperience";
import {recordSchemas} from "../contracts";
import {emptyEditorialItem} from "../editorial-schema";

const base={mode:"breve",version:null,emotions:[],needs:[],cases:[],concepts:[],onDraft:jest.fn(),onComplete:jest.fn()};
const click=(name:string|RegExp)=>fireEvent.click(screen.getByRole("button",{name}));
beforeEach(()=>jest.clearAllMocks());

it("preserves an explicit zero while editing the review and validates the final record",()=>{
 render(<ArrivalExperience {...base}/>);
 click("Começar");
 fireEvent.change(screen.getByLabelText("Como você chega agora?"),{target:{value:"Palavra fictícia"}});
 click("Continuar");click("Intensidade 0 de 10");click("Revisar chegada");
 expect(base.onComplete).not.toHaveBeenCalled();
 click("Editar Palavra");
 expect(screen.getByLabelText("Como você chega agora?")).toHaveValue("Palavra fictícia");
 click("Continuar");
 expect(screen.getByRole("button",{name:"Intensidade 0 de 10"})).toHaveAttribute("aria-pressed","true");
 click("Revisar chegada");click("Concluir chegada");
 const payload=base.onComplete.mock.calls[0][0];
 expect(payload.intensity).toBe(0);
 expect(recordSchemas.chegada.safeParse(payload).success).toBe(true);
});

it("retains full-route answers in memory but excludes unselected steps from completion",()=>{
 render(<ArrivalExperience {...base} mode="completa"/>);
 click("Começar");click("Ir para Reflexão");
 fireEvent.change(screen.getByLabelText("Nas suas palavras, se quiser"),{target:{value:"Reflexão fictícia"}});
 click("Escolher percurso");click(/^Breve/);click("Retomar chegada");
 click("Escolher percurso");click(/^Completa/);click("Retomar chegada");click("Ir para Reflexão");
 expect(screen.getByLabelText("Nas suas palavras, se quiser")).toHaveValue("Reflexão fictícia");
 click("Escolher percurso");click(/^Breve/);click("Retomar chegada");click("Pular");click("Pular");click("Concluir chegada");
 expect(base.onComplete).toHaveBeenCalledWith(expect.objectContaining({reflection:"",intensity:null}));
});

it("limits arrival needs to three",()=>{
 const needs=["Um","Dois","Três","Quatro"].map((title,index)=>({...emptyEditorialItem("need",`need-${index}`),title}));
 render(<ArrivalExperience {...base} mode="completa" needs={needs}/>);
 click("Começar");click("Ir para Necessidade");
 for(const item of needs)click(new RegExp(`^${item.title}`));
 expect(screen.getByRole("status")).toHaveTextContent("3 de 3 escolhidas");
 click("Ir para Reflexão");click("Revisar chegada");click("Concluir chegada");
 expect(base.onComplete).toHaveBeenCalledWith(expect.objectContaining({needs:["need-0","need-1","need-2"]}));
});
