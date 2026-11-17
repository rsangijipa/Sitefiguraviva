import {fireEvent,render,screen} from "@testing-library/react";
import {PausePractice} from "../immersive/PausePractice";

jest.mock("../immersive/AmbientControl",()=>({AmbientControl:()=>null}));
jest.mock("../audio-manager",()=>({resourceAudioManager:{stop:jest.fn(),activateFromGesture:jest.fn().mockResolvedValue(true),play:jest.fn().mockResolvedValue(true)}}));

it("permite explorar e restaurar uma forma sensorial",()=>{
 render(<PausePractice practice="pelos-sentidos" title="Pelos sentidos" paused={false} motion/>);
 const bubble=screen.getByRole("button",{name:"Tocar forma 1"});fireEvent.click(bubble);
 expect(screen.getByRole("button",{name:"Restaurar forma 1"})).toHaveAttribute("aria-pressed","true");
 fireEvent.click(screen.getByRole("button",{name:"Recomeçar formas"}));expect(screen.getByRole("button",{name:"Tocar forma 1"})).toHaveAttribute("aria-pressed","false");
});
it("apresenta cinco respostas e registra a percepção do som",()=>{
 render(<PausePractice practice="ouvir" title="Ouvir" paused={false} motion/>);
 fireEvent.click(screen.getByRole("button",{name:"Floresta"}));expect(screen.getByRole("status")).toHaveTextContent("identificou");
 fireEvent.click(screen.getByRole("button",{name:"Me relaxa"}));expect(screen.getByRole("button",{name:"Me relaxa"})).toHaveAttribute("aria-pressed","true");
 fireEvent.click(screen.getByRole("button",{name:"Próximo som"}));expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
it("navega pelas orientações de movimento",()=>{
 render(<PausePractice practice="movimentar" title="Movimentar" paused={false} motion/>);
 fireEvent.click(screen.getByRole("button",{name:"Próximo"}));expect(screen.getByRole("heading",{name:"Solte as mãos"})).toBeInTheDocument();
});
