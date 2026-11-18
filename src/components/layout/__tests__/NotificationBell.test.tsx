import {fireEvent,render,screen,waitFor} from "@testing-library/react";
import NotificationBell from "../NotificationBell";
const list=jest.fn(),count=jest.fn(),mark=jest.fn(),markAll=jest.fn();
jest.mock("@/context/AuthContext",()=>({useAuth:()=>({user:{uid:"u1"}})}));
jest.mock("@/services/notificationService",()=>({notificationService:{getUserNotifications:(...args:unknown[])=>list(...args),getUnreadCount:(...args:unknown[])=>count(...args),markAsRead:(...args:unknown[])=>mark(...args),markAllAsRead:(...args:unknown[])=>markAll(...args)}}));
beforeEach(()=>{jest.clearAllMocks();list.mockResolvedValue([{id:"n1",title:"Novo aviso",link:"/admin",isRead:false,createdAt:"2026-11-16T12:00:00Z"}]);count.mockResolvedValue(1);mark.mockResolvedValue(undefined);markAll.mockResolvedValue(undefined);});
it("loads notifications and marks an individual item as read",async()=>{
 render(<NotificationBell/>);const bell=await screen.findByRole("button",{name:"Notificações: 1 não lidas"});fireEvent.click(bell);
 expect(await screen.findByText("Novo aviso")).toBeInTheDocument();fireEvent.click(screen.getByRole("button",{name:"Marcar Novo aviso como lida"}));
 await waitFor(()=>expect(mark).toHaveBeenCalledWith("u1","n1"));
 fireEvent.keyDown(document,{key:"Escape"});expect(screen.queryByRole("region",{name:"Notificações"})).not.toBeInTheDocument();
});
it("reports an unavailable notification service instead of displaying an empty list",async()=>{
 list.mockRejectedValue(new Error("offline"));render(<NotificationBell/>);fireEvent.click(screen.getByRole("button",{name:"Notificações"}));expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar");
});
