import {fireEvent,render,screen,within} from "@testing-library/react";
import {CardsExperience} from "../cards/CardsExperience";
import {emptyEditorialConfig,emptyEditorialItem,type EditorialVersion} from "../editorial-schema";

jest.mock("../ResourceShell",()=>({useResourceMotion:()=>true}));
const reference={author:"Autoria fictícia",work:"Obra de teste",year:2020,edition:"",pages:""};
const items=[
 {...emptyEditorialItem("card","presenca","relacao-dialogica"),title:"Presença",text:"Primeira frase da carta. Segunda frase só no aprofundamento.",prompt:"O que aparece agora?",relatedConcepts:["contato"],references:[reference,{...reference,work:"Segunda obra"},{...reference,work:"Terceira obra"}]},
 {...emptyEditorialItem("card","contato","fundamentos"),title:"Contato",text:"Outro conceito fictício para o teste.",prompt:"Como você percebe o encontro?"},
 {...emptyEditorialItem("card","laura","autoras-autores"),title:"Laura Perls",text:"Autora fictícia para o teste.",prompt:"Que apoio você percebe?"},
];
const version:EditorialVersion={id:"fixture",resourceKey:"cartas-gestalticas",version:1,status:"published",configuration:{...emptyEditorialConfig("cartas-gestalticas"),items},authoredBy:null,reviewerName:null,reviewerCrp:null,reviewedAt:null,updatedAt:"2026-11-17",reviewNote:null,returnedAt:null,demo:true};
const base={mode:"explorar",version,emotions:[],needs:[],cases:[],concepts:items,onDraft:jest.fn(),onComplete:jest.fn()};
beforeAll(()=>{HTMLDialogElement.prototype.showModal=function(){this.setAttribute("open","");};HTMLDialogElement.prototype.close=function(){this.removeAttribute("open");};});
beforeEach(()=>jest.clearAllMocks());

it("opens on an illustrated grid with every filtered card side by side",()=>{
 render(<CardsExperience {...base}/>);
 const cards=screen.getAllByRole("article");
 expect(cards.map(card=>card.getAttribute("aria-label"))).toEqual(["Presença, frente","Contato, frente","Laura Perls, frente"]);
 expect(document.querySelectorAll(".cg-grid .fv-gcard-art")).toHaveLength(3);
 expect(document.querySelector('.cg-grid img[data-slot="/brand/recursos/cartas/autores/laura-perls.webp"]')).not.toBeNull();
 expect(document.querySelector(".cg-scene")).toBeNull();
 const presence=cards[0];
 expect(within(presence).getByText("Primeira frase da carta.")).toBeInTheDocument();
 expect(within(presence).queryByText(/Segunda frase/)).not.toBeInTheDocument();
 expect(within(presence).getByText("+2 referências em Aprofundar")).toBeInTheDocument();
 fireEvent.change(screen.getByRole("combobox",{name:"Baralho"}),{target:{value:"fundamentos"}});
 expect(screen.getAllByRole("article").map(card=>card.getAttribute("aria-label"))).toEqual(["Contato, frente"]);
 expect(screen.getByRole("status")).toHaveTextContent("1 carta encontrada");
});

it("flips a grid card in place, keeping focus on its control",()=>{
 render(<CardsExperience {...base}/>);
 const flip=screen.getByRole("button",{name:"Virar carta: Contato"});
 flip.focus();
 fireEvent.click(flip);
 expect(screen.getByRole("article",{name:"Contato, verso"})).toBeInTheDocument();
 const back=screen.getByRole("button",{name:"Ver conceito: Contato"});
 expect(back).toHaveFocus();
 expect(screen.getByText("Como você percebe o encontro?").closest("[aria-hidden]")).toHaveAttribute("aria-hidden","false");
 expect(screen.getByText("Outro conceito fictício para o teste.").closest("[aria-hidden]")).toHaveAttribute("aria-hidden","true");
 expect(screen.getByRole("article",{name:"Presença, frente"})).toBeInTheDocument();
 fireEvent.click(back);
 expect(screen.getByRole("article",{name:"Contato, frente"})).toBeInTheDocument();
});

it("marks cards from the grid, deepens one in the dialog and filters the selection",()=>{
 render(<CardsExperience {...base}/>);
 const marks=screen.getByRole("group",{name:"Marcar Contato"});
 fireEvent.click(within(marks).getByRole("button",{name:"Favorita"}));
 fireEvent.click(within(marks).getByRole("button",{name:"Já li"}));
 expect(within(marks).getByRole("button",{name:"Favorita"})).toHaveAttribute("aria-pressed","true");
 expect(within(marks).getByRole("button",{name:"Rever"})).toHaveAttribute("aria-pressed","false");
 fireEvent.click(screen.getByRole("button",{name:"Aprofundar: Presença"}));
 const dialog=screen.getByRole("dialog");
 expect(within(dialog).getByText("Primeira frase da carta. Segunda frase só no aprofundamento.")).toBeInTheDocument();
 fireEvent.click(within(dialog).getByRole("button",{name:"Fechar"}));
 fireEvent.click(screen.getByRole("button",{name:/^Minhas cartas/}));
 expect(screen.getAllByRole("article").map(card=>card.getAttribute("aria-label"))).toEqual(["Contato, frente"]);
 fireEvent.click(within(screen.getByRole("group",{name:"Filtrar minhas cartas"})).getByRole("button",{name:/^Para rever/}));
 expect(screen.getByRole("heading",{name:"Nenhuma carta por aqui ainda."})).toBeInTheDocument();
 fireEvent.click(screen.getByRole("button",{name:"Concluir estudo",exact:true}));
 expect(base.onComplete).toHaveBeenCalledWith({favorites:["contato"],review:[],known:["contato"],reflection:""});
});

it("shows related concepts on grid cards in the relations mode",()=>{
 render(<CardsExperience {...base} mode="relacoes"/>);
 fireEvent.click(within(screen.getByRole("article",{name:"Presença, frente"})).getByRole("button",{name:"Contato"}));
 expect(screen.getByRole("button",{name:"Voltar à grade"})).toHaveFocus();
 expect(screen.getByRole("button",{name:"Virar carta: Contato"})).toBeInTheDocument();
});
