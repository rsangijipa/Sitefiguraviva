import {fireEvent,render,screen} from "@testing-library/react";
import {ResourceHost} from "../ResourceHost";

const push=jest.fn();
jest.mock("next/navigation",()=>({useRouter:()=>({push})}));
jest.mock("../ResourceShell",()=>({useResourceMotion:()=>true,ResourceShell:({children,onNavigateAway}:{children:React.ReactNode;onNavigateAway:(path:string)=>void})=><main><button onClick={()=>onNavigateAway("/portal/recursos/meus-registros")}>Navegar</button>{children}</main>}));
jest.mock("../SaveBar",()=>({SaveBar:({onSaved}:{onSaved:()=>void})=><button onClick={onSaved}>Simular registro guardado</button>}));
jest.mock("../RecordSummary",()=>({RecordSummary:()=>null}));
const snapshot={version:null,concepts:[],emotions:[],needs:[],cases:[]};

describe("ResourceHost mode changes",()=>{
 beforeAll(()=>{HTMLDialogElement.prototype.showModal=function(){this.setAttribute("open","");};HTMLDialogElement.prototype.close=function(){this.removeAttribute("open");};});
 beforeEach(()=>push.mockClear());
 it("opens cards directly and withholds unpublished content without an extra launch screen",()=>{
  render(<ResourceHost slug="cartas-gestalticas" snapshot={snapshot}/>);
  expect(screen.getByRole("heading",{name:"O acervo aguarda revisão docente"})).toBeInTheDocument();
  expect(screen.queryByRole("button",{name:"Iniciar recurso"})).not.toBeInTheDocument();
 });
 it("supports choosing a mode, starting, and returning to the mode screen",()=>{
  render(<ResourceHost slug="figura-e-fundo" snapshot={snapshot}/>);
  fireEvent.click(screen.getByRole("button",{name:/^Sessão/}));
  expect(screen.getByText("Modo selecionado:").parentElement).toHaveTextContent("Sessão");
  fireEvent.click(screen.getByRole("button",{name:"Iniciar recurso"}));
  expect(screen.getByRole("heading",{name:"O acervo aguarda revisão docente"})).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Voltar à escolha do modo"}));
  expect(screen.getByRole("button",{name:"Iniciar recurso"})).toBeInTheDocument();
 });
 it("keeps the response until the learner confirms discarding it",()=>{
  render(<ResourceHost slug="chegada" snapshot={snapshot}/>);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Começar"}));
  fireEvent.change(screen.getByLabelText("Como você chega agora?"),{target:{value:"Palavra de teste"}});
  fireEvent.click(screen.getByRole("button",{name:"Escolher percurso"}));
  fireEvent.click(screen.getByRole("button",{name:/^Completa/}));
  fireEvent.click(screen.getByRole("button",{name:"Retomar chegada"}));
  expect(screen.getByLabelText("Como você chega agora?")).toHaveValue("Palavra de teste");
  fireEvent.click(screen.getByRole("button",{name:"Navegar"}));
  expect(screen.getByRole("dialog",{name:"Sair desta experiência?"})).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Sair sem guardar"}));
  expect(push).toHaveBeenCalledWith("/portal/recursos/meus-registros");
 });
 it("removes discard and unload warnings after the record has been saved",()=>{
  render(<ResourceHost slug="chegada" snapshot={snapshot}/>);
  fireEvent.click(screen.getByRole("button",{name:"Começar"}));
  fireEvent.change(screen.getByLabelText("Como você chega agora?"),{target:{value:"Resposta temporária"}});
  fireEvent.click(screen.getByRole("button",{name:"Continuar"}));
  fireEvent.click(screen.getByRole("button",{name:"Pular"}));
  fireEvent.click(screen.getByRole("button",{name:"Concluir chegada"}));
  const unsaved=new Event("beforeunload",{cancelable:true});window.dispatchEvent(unsaved);
  expect(unsaved.defaultPrevented).toBe(true);
  fireEvent.click(screen.getByRole("button",{name:"Simular registro guardado"}));
  const saved=new Event("beforeunload",{cancelable:true});window.dispatchEvent(saved);
  expect(saved.defaultPrevented).toBe(false);
  fireEvent.click(screen.getByRole("button",{name:"Navegar"}));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(push).toHaveBeenCalledWith("/portal/recursos/meus-registros");
 });
});
