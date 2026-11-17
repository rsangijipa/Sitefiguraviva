import {fireEvent,render,screen} from "@testing-library/react";
import AdminShell from "../AdminShell";
jest.mock("next/navigation",()=>({usePathname:()=>"/admin"}));
jest.mock("@/context/AuthContext",()=>({useAuth:()=>({user:{displayName:"Admin"},signOut:jest.fn()})}));
jest.mock("@/context/ToastContext",()=>({useToast:()=>({addToast:jest.fn()})}));
jest.mock("@/hooks/useSiteSettings",()=>({useFounderSettings:()=>({data:{image:"/fundadora.jpg"}})}));
jest.mock("@/components/layout/NotificationBell",()=>()=> <button>Notificações</button>);
jest.mock("@/components/ui/Breadcrumbs",()=>()=>null);
it("allows each navigation group to collapse and expand",()=>{
 render(<AdminShell>Conteúdo</AdminShell>);
 const group=screen.getByRole("button",{name:"Aprendizagem"});expect(group).toHaveAttribute("aria-expanded","true");
 fireEvent.click(group);expect(group).toHaveAttribute("aria-expanded","false");expect(screen.queryByRole("link",{name:"Cursos"})).not.toBeInTheDocument();
 fireEvent.click(group);expect(screen.getByRole("link",{name:"Cursos"})).toBeInTheDocument();
});
it("searches administrative tools beyond the navigation list and displays the founder portrait",()=>{
 const {container}=render(<AdminShell>Conteúdo</AdminShell>);const input=screen.getByRole("searchbox",{name:"Buscar área do painel"});
 fireEvent.change(input,{target:{value:"matriculas"}});expect(screen.getByRole("link",{name:/Matrículas/})).toHaveAttribute("href","/admin/enrollments");
 fireEvent.change(input,{target:{value:"fundadora"}});expect(screen.getByRole("link",{name:/Conteúdo do site e fundadora/})).toHaveAttribute("href","/admin/settings");
 expect(container.querySelectorAll('img[src="/fundadora.jpg"]')).toHaveLength(1);
});
