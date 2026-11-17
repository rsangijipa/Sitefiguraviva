import {fireEvent,render,screen} from "@testing-library/react";
import {FigureGroundStudies} from "../figure-ground/FigureGroundStudies";
const base={mode:"perceptivo",version:null,concepts:[],emotions:[],needs:[],cases:[],onDraft:jest.fn(),onComplete:jest.fn()};
beforeEach(()=>jest.clearAllMocks());

it("lets the person observe before revealing readings and keeps choices when returning",()=>{
 render(<FigureGroundStudies {...base}/>);
 expect(screen.getByRole("img")).toHaveAttribute("src","/brand/recursos/figura-e-fundo/estudos/vaso-perfis.webp");
 expect(screen.queryByRole("button",{name:/Um vaso no centro/})).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole("button",{name:"Ver possibilidades"}));
 fireEvent.click(screen.getByRole("button",{name:/^Dois rostos de perfil/}));
 fireEvent.click(screen.getByRole("button",{name:"Próxima imagem"}));
 expect(screen.getByRole("status")).toHaveTextContent("Imagem 2 de 4");
 fireEvent.click(screen.getByRole("button",{name:"Imagem anterior"}));
 expect(screen.getByRole("button",{name:/^Dois rostos de perfil/})).toHaveAttribute("aria-pressed","true");
 expect(base.onDraft).toHaveBeenCalledWith({observations:{"vaso-perfis":{choice:"Dois rostos de perfil",other:""}}});
});

it("accepts an alternative perception and shows a descriptive summary without a score",()=>{
 render(<FigureGroundStudies {...base}/>);
 fireEvent.click(screen.getByRole("button",{name:"Ver possibilidades"}));
 fireEvent.click(screen.getByRole("button",{name:/^Vejo outra coisa/}));
 fireEvent.change(screen.getByLabelText("O que você vê? (opcional)"),{target:{value:"Uma forma que lembra uma taça"}});
 for(let step=0;step<3;step++)fireEvent.click(screen.getByRole("button",{name:"Próxima imagem"}));
 fireEvent.click(screen.getByRole("button",{name:"Ver minhas observações"}));
 expect(screen.getByText("Uma forma que lembra uma taça")).toBeInTheDocument();
 expect(screen.getAllByText("Você seguiu sem escolher.")).toHaveLength(3);
 expect(screen.getByText(/Não há pontuação nem interpretação/)).toBeInTheDocument();
 fireEvent.click(screen.getByRole("button",{name:"Encerrar experiência"}));
 expect(base.onComplete).toHaveBeenCalledWith(null);
});

it("supports rotation and uncertain readings without writing to browser storage",()=>{
 const storage=jest.spyOn(Storage.prototype,"setItem");
 render(<FigureGroundStudies {...base}/>);
 fireEvent.click(screen.getByRole("button",{name:"Girar imagem 180°"}));
 expect(document.querySelector('.fg-image')).toHaveAttribute("data-rotated","true");
 fireEvent.click(screen.getByRole("button",{name:"Ver possibilidades"}));
 fireEvent.click(screen.getByRole("button",{name:/^Ainda não sei/}));
 expect(screen.getByRole("button",{name:/^Ainda não sei/})).toHaveAttribute("aria-pressed","true");
 expect(storage).not.toHaveBeenCalled();
 storage.mockRestore();
});
