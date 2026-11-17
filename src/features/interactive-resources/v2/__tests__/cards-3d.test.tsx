import {fireEvent,render,screen,within} from "@testing-library/react";
import {CardsExperience} from "../cards/CardsExperience";
import {emptyEditorialConfig,emptyEditorialItem,type EditorialVersion} from "../editorial-schema";

jest.mock("../ResourceShell",()=>({useResourceMotion:()=>true}));
const items=[
 {...emptyEditorialItem("card","presenca","relacao-dialogica"),title:"Presença",text:"Um conceito fictício para testar a leitura.",prompt:"O que aparece agora?",relatedConcepts:["contato"]},
 {...emptyEditorialItem("card","contato","fundamentos"),title:"Contato",text:"Outro conceito fictício para o teste.",prompt:"Como você percebe o encontro?"},
 {...emptyEditorialItem("card","campo","campo"),title:"Campo",text:"Terceiro conceito fictício.",prompt:"O que está no entorno?"},
];
const version:EditorialVersion={id:"fixture",resourceKey:"cartas-gestalticas",version:1,status:"published",configuration:{...emptyEditorialConfig("cartas-gestalticas"),items},authoredBy:null,reviewerName:null,reviewerCrp:null,reviewedAt:null,updatedAt:"2026-11-16",reviewNote:null,returnedAt:null,demo:true};
const base={mode:"explorar",version,emotions:[],needs:[],cases:[],concepts:items,onDraft:jest.fn(),onComplete:jest.fn()};
beforeAll(()=>{HTMLDialogElement.prototype.showModal=function(){this.setAttribute("open","");};HTMLDialogElement.prototype.close=function(){this.removeAttribute("open");};});
beforeEach(()=>jest.clearAllMocks());
const openCard=(title:string)=>fireEvent.click(screen.getByRole("button",{name:`Abrir em destaque: ${title}`}));

it("opens a grid card in the 3D view, flips both ways and returns focus to the grid",()=>{
 render(<CardsExperience {...base}/>);
 openCard("Presença");
 expect(screen.getByRole("button",{name:"Voltar à grade"})).toHaveFocus();
 fireEvent.click(screen.getByRole("button",{name:"Virar carta: Presença"}));
 const back=screen.getByRole("button",{name:"Ver conceito: Presença"});
 expect(back).toHaveFocus();
 expect(screen.queryByRole("button",{name:"Virar carta: Presença"})).not.toBeInTheDocument();
 expect(screen.getByText("O que aparece agora?")).toBeVisible();
 expect(document.querySelector('.cg-scene')).toHaveAttribute("data-reduced","true");
 fireEvent.click(back);
 const front=screen.getByRole("button",{name:"Virar carta: Presença"});
 expect(front).toHaveFocus();
 fireEvent.keyDown(front,{key:"Escape"});
 expect(screen.queryByRole("button",{name:"Voltar à grade"})).not.toBeInTheDocument();
 expect(screen.getByRole("button",{name:"Abrir em destaque: Presença"})).toHaveFocus();
});

it("keeps favorites, review marks and notes when switching between the three views",()=>{
 render(<CardsExperience {...base}/>);
 openCard("Presença");
 fireEvent.click(screen.getByRole("button",{name:"Favoritar",exact:true}));
 fireEvent.click(within(screen.getByRole("group",{name:"Marcar esta carta"})).getByRole("button",{name:"Para rever"}));
 fireEvent.change(screen.getByLabelText("Uma nota de estudo, se quiser"),{target:{value:"Nota temporária"}});
 fireEvent.click(screen.getByRole("button",{name:/^Minhas cartas/}));
 expect(within(screen.getByRole("group",{name:"Marcar Presença"})).getByRole("button",{name:"Favorita"})).toHaveAttribute("aria-pressed","true");
 fireEvent.click(screen.getByRole("button",{name:"Colher ao acaso",exact:true}));
 fireEvent.click(screen.getByRole("button",{name:/^Minhas cartas/}));
 fireEvent.click(screen.getByRole("button",{name:"Concluir estudo",exact:true}));
 expect(base.onComplete).toHaveBeenCalledWith({favorites:["presenca"],review:["presenca"],known:[],reflection:"Nota temporária"});
});

it("searches without accents and recovers from an empty search",()=>{
 render(<CardsExperience {...base}/>);
 fireEvent.change(screen.getByRole("searchbox",{name:"Buscar carta ou conceito"}),{target:{value:"presenca"}});
 expect(screen.getByRole("status")).toHaveTextContent("1 carta encontrada");
 expect(screen.getAllByRole("article")).toHaveLength(1);
 fireEvent.change(screen.getByRole("searchbox"),{target:{value:"nenhum resultado"}});
 expect(screen.getByRole("heading",{name:"Nenhuma carta por aqui ainda."})).toBeInTheDocument();
 fireEvent.click(screen.getByRole("button",{name:"Limpar busca e baralho"}));
 expect(screen.getByRole("status")).toHaveTextContent("3 cartas no baralho");
});

it("shows an actionable review empty state and supports navigating a related concept",()=>{
 render(<CardsExperience {...base} mode="revisar"/>);
 expect(screen.getByRole("heading",{name:"Sua seleção começa por uma carta."})).toBeInTheDocument();
 fireEvent.click(within(document.querySelector('.cg-empty') as HTMLElement).getByRole("button",{name:"Explorar acervo"}));
 fireEvent.click(screen.getByRole("button",{name:"Aprofundar: Presença"}));
 fireEvent.click(screen.getByRole("button",{name:"Abrir carta relacionada: Contato"}));
 expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
 expect(screen.getByRole("button",{name:"Voltar à grade"})).toBeInTheDocument();
 expect(screen.getByRole("button",{name:"Virar carta: Contato"})).toBeInTheDocument();
});

it("keeps pagination in bounds and chooses another random card when possible",()=>{
 render(<CardsExperience {...base}/>);
 openCard("Presença");
 expect(screen.getByRole("status")).toHaveTextContent("Carta 1 de 3");
 expect(screen.getByRole("button",{name:"Anterior",exact:true})).toBeDisabled();
 fireEvent.click(screen.getByRole("button",{name:"Próxima",exact:true}));
 fireEvent.click(screen.getByRole("button",{name:"Próxima",exact:true}));
 expect(screen.getByRole("button",{name:"Próxima",exact:true})).toBeDisabled();
 fireEvent.click(screen.getByRole("button",{name:"Colher ao acaso",exact:true}));
 expect(screen.queryByRole("button",{name:"Virar carta: Campo"})).not.toBeInTheDocument();
});
