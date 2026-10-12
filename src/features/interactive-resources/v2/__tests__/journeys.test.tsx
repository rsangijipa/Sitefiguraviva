import {render,screen,fireEvent} from "@testing-library/react";
import {ArrivalExperience,PolarityExperience} from "../PerceptionExperiences";
import {DialogicalExperience,PhenomenologyExperience,ExperimentExperience} from "../LearningExperiences";
import {emptyEditorialConfig,emptyEditorialItem,type EditorialVersion} from "../editorial-schema";
const base={mode:"breve",version:null,emotions:[],needs:[],cases:[],concepts:[],onDraft:jest.fn(),onComplete:jest.fn()};
describe("optional journeys and unavailable content",()=>{
 beforeEach(()=>jest.clearAllMocks());
 it("completes arrival through skipped steps without writing browser storage",()=>{
  const write=jest.spyOn(Storage.prototype,"setItem");render(<ArrivalExperience {...base}/>);
  fireEvent.click(screen.getByRole("button",{name:"Começar"}));fireEvent.click(screen.getByRole("button",{name:"Pular"}));fireEvent.click(screen.getByRole("button",{name:"Pular"}));
  expect(base.onComplete).toHaveBeenCalledWith({word:"",body:[],emotion:"",intensity:null,needs:[],reflection:""});expect(write).not.toHaveBeenCalled();write.mockRestore();
 });
 it("preserves a pending dialogue turn in the completion payload",()=>{
  render(<PolarityExperience {...base} mode="dialogo"/>);fireEvent.change(screen.getByLabelText("Primeiro lado"),{target:{value:"Lado fictício"}});fireEvent.change(screen.getByLabelText("Escrever como Lado fictício"),{target:{value:"Resposta neutra"}});fireEvent.click(screen.getByRole("button",{name:"Concluir"}));expect(base.onComplete.mock.calls[0][0].turns).toEqual([{side:0,text:"Resposta neutra"}]);
 });
 it.each([DialogicalExperience,PhenomenologyExperience,ExperimentExperience])("withholds each new learning journey when approved content is absent",Experience=>{
  render(<Experience {...base}/>);expect(screen.getByRole("heading",{name:"O acervo aguarda revisão docente"})).toBeInTheDocument();
 });
 it("shows no scoring in the dialogical journey",()=>{
  const item={...emptyEditorialItem("exercise","fixture"),title:"Fixture explicitamente fictícia",text:"Texto neutro",alternatives:[{id:"one",text:"Resposta fictícia",comment:"Comentário fictício"}]};
  const version:EditorialVersion={id:"fixture",resourceKey:"escuta-dialogica",version:1,status:"draft",configuration:{...emptyEditorialConfig("escuta-dialogica"),items:[item]},authoredBy:null,reviewerName:null,reviewerCrp:null,reviewedAt:null,updatedAt:"2026-01-01"};
  render(<DialogicalExperience {...base} version={version}/>);expect(screen.queryByText(/pontos|acertou|errou/i)).not.toBeInTheDocument();
 });
});
