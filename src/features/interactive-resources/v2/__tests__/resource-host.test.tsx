import {fireEvent,render,screen} from "@testing-library/react";
import {ResourceHost} from "../ResourceHost";

const push=jest.fn();
jest.mock("next/navigation",()=>({useRouter:()=>({push})}));
jest.mock("../ResourceShell",()=>({ResourceShell:({children,onNavigateAway}:{children:React.ReactNode;onNavigateAway:(path:string)=>void})=><main><button onClick={()=>onNavigateAway("/portal/recursos/meus-registros")}>Navegar</button>{children}</main>}));
jest.mock("../SaveBar",()=>({SaveBar:()=>null}));
jest.mock("../RecordSummary",()=>({RecordSummary:()=>null}));
const snapshot={version:null,concepts:[],emotions:[],needs:[],cases:[]};

describe("ResourceHost mode changes",()=>{
 beforeAll(()=>{HTMLDialogElement.prototype.showModal=function(){this.setAttribute("open","");};HTMLDialogElement.prototype.close=function(){this.removeAttribute("open");};});
 beforeEach(()=>push.mockClear());
 it("shows the selected card-study mode even while editorial content is unavailable",()=>{
  render(<ResourceHost slug="cartas-gestalticas" snapshot={snapshot}/>);
  fireEvent.click(screen.getByRole("button",{name:/^revisar/}));
  expect(screen.getByRole("button",{name:/^revisar/})).toHaveAttribute("aria-pressed","true");
  expect(screen.getByText("Modo selecionado:").parentElement).toHaveTextContent("revisar");
  fireEvent.click(screen.getByRole("button",{name:"Iniciar recurso"}));
  expect(screen.getByRole("heading",{name:"O acervo aguarda revisão docente"})).toBeInTheDocument();
 });
 it("supports choosing a mode, starting, and returning to the mode screen",()=>{
  render(<ResourceHost slug="figura-e-fundo" snapshot={snapshot}/>);
  fireEvent.click(screen.getByRole("button",{name:/^sessao/}));
  expect(screen.getByText("Modo selecionado:").parentElement).toHaveTextContent("sessao");
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
  fireEvent.click(screen.getByRole("button",{name:"completa"}));
  expect(screen.getByRole("dialog",{name:"Trocar de modo?"})).toBeInTheDocument();
  expect(screen.getByLabelText("Como você chega agora?")).toHaveValue("Palavra de teste");
  fireEvent.click(screen.getByRole("button",{name:"Continuar neste modo"}));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Como você chega agora?")).toHaveValue("Palavra de teste");
  fireEvent.click(screen.getByRole("button",{name:"completa"}));
  fireEvent.click(screen.getByRole("button",{name:"Trocar modo e descartar"}));
  expect(screen.queryByLabelText("Como você chega agora?")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Começar"}));
  fireEvent.change(screen.getByLabelText("Como você chega agora?"),{target:{value:"Outro texto de teste"}});
  fireEvent.click(screen.getByRole("button",{name:"Navegar"}));
  expect(screen.getByRole("dialog",{name:"Sair desta experiência?"})).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Sair sem guardar"}));
  expect(push).toHaveBeenCalledWith("/portal/recursos/meus-registros");
 });
});
