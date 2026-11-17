import {fireEvent,render,screen} from "@testing-library/react";
import {SidebarNav} from "../SidebarNav";
jest.mock("next/navigation",()=>({usePathname:()=>"/portal/course/example"}));
jest.mock("@/context/AuthContext",()=>({useAuth:()=>({user:null,role:"student",signOut:jest.fn()})}));
jest.mock("@/context/ToastContext",()=>({useToast:()=>({addToast:jest.fn()})}));
jest.mock("@/services/gamificationService",()=>({gamificationService:{getProfile:jest.fn()}}));
it("groups the student navigation and preserves the active course link",()=>{
 render(<SidebarNav/>);
 expect(screen.getByRole("link",{name:"Meus Cursos"})).toHaveAttribute("aria-current","page");
 const group=screen.getByRole("button",{name:"Formação"});fireEvent.click(group);
 expect(group).toHaveAttribute("aria-expanded","false");expect(screen.queryByRole("link",{name:"Meus Cursos"})).not.toBeInTheDocument();
 expect(screen.getByRole("link",{name:"Recursos"})).toBeVisible();fireEvent.click(group);
 expect(screen.getByRole("link",{name:"Meus Cursos"})).toBeVisible();
});
