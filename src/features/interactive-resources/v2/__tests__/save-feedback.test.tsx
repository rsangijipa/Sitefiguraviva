import {fireEvent,render,screen,waitFor} from "@testing-library/react";
import {SaveBar} from "../SaveBar";
import {resourceCatalog} from "@/components/resources/resourceCatalog";
import {getSavingOptions,savePrivateResourceRecord} from "../records.actions";

jest.mock("../records.actions",()=>({getSavingOptions:jest.fn(),savePrivateResourceRecord:jest.fn()}));
it("acknowledges a saved record to its host only after successful saving",async()=>{
 jest.mocked(getSavingOptions).mockResolvedValue({ok:true,data:{enabled:true,formations:[{id:"formation-test",title:"Formação fictícia",expiresAt:"2027-01-01T00:00:00.000Z"}]}});
 jest.mocked(savePrivateResourceRecord).mockResolvedValue({ok:true,data:{id:"test",expiresAt:"2027-01-01T00:00:00.000Z"}});
 const onSaved=jest.fn();
 render(<SaveBar resource={resourceCatalog.find(item=>item.slug==="chegada")!} payload={{word:"Resposta fictícia",body:[],emotion:"",intensity:null,needs:[],reflection:""}} contentVersion={null} preview={false} onDiscard={jest.fn()} onSaved={onSaved}/>);
 const button=screen.getByRole("button",{name:"Guardar no meu histórico"});
 await waitFor(()=>expect(button).toBeEnabled());
 expect(onSaved).not.toHaveBeenCalled();
 fireEvent.click(button);
 expect(await screen.findByRole("status")).toHaveTextContent("Registro guardado até");
 expect(onSaved).toHaveBeenCalledTimes(1);
 expect(screen.getByRole("button",{name:"Guardado"})).toBeDisabled();
});
