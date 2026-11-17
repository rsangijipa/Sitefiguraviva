import {fireEvent,render,screen,within} from "@testing-library/react";
import {ResourceShell} from "../ResourceShell";
import {resourceCatalog} from "@/components/resources/resourceCatalog";

jest.mock("@/components/providers/ThemeProvider",()=>({useTheme:()=>({theme:"light",toggle:jest.fn()})}));
beforeAll(()=>{
 window.matchMedia=jest.fn().mockReturnValue({matches:false,addEventListener:jest.fn(),removeEventListener:jest.fn()});
 HTMLDialogElement.prototype.close=function(){this.removeAttribute("open");};
});
it("opens as an accessible resource window and can enlarge its text",()=>{
 const resource=resourceCatalog.find(item=>item.slug==="chegada")!;
 render(<ResourceShell resource={resource} version={null} concepts={[]} returnTo="/portal/recursos"><p>Conteúdo</p></ResourceShell>);
 const window=screen.getByRole("dialog",{name:resource.title});
 expect(window).toHaveAttribute("aria-modal","true");expect(screen.getByRole("link",{name:"Voltar para recursos"})).toHaveAttribute("href","/portal/recursos");
 fireEvent.click(screen.getByRole("button",{name:"Aumentar tamanho do texto"}));expect(window).toHaveAttribute("data-text-size","large");
});
it.each(["cartas-gestalticas","mapa-do-corpo","sala-de-pausa"])("%s keeps only its title and description in the resource toolbar",slug=>{
 const resource=resourceCatalog.find(item=>item.slug===slug)!;
 render(<ResourceShell resource={resource} version={null} concepts={[]}><p>Conteúdo de teste</p></ResourceShell>);
 const toolbar=screen.getByRole("banner");
 expect(within(toolbar).getByRole("heading",{name:resource.title,level:1})).toBeInTheDocument();
 expect(within(toolbar).getByText(resource.description)).toBeInTheDocument();
 expect(toolbar).not.toHaveTextContent(resource.category);
 expect(toolbar).not.toHaveTextContent(resource.duration);
 expect(screen.getAllByRole("heading",{level:1})).toHaveLength(1);
 expect(screen.queryByText("Experiência interativa")).not.toBeInTheDocument();
});
