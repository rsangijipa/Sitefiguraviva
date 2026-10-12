import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeProvider";
function Control() {
  const {theme,toggle,setPreference} = useTheme();
  return <><button onClick={toggle}>{theme}</button><button onClick={()=>setPreference("system")}>Sistema</button></>;
}
beforeEach(()=>{localStorage.clear(); Object.defineProperty(window,"matchMedia",{configurable:true,value:jest.fn(()=>({matches:true,addEventListener:jest.fn(),removeEventListener:jest.fn()}))});});
it("restores manual preference across mounts and persists toggles",()=>{
 localStorage.setItem("theme","dark");
 const {unmount}=render(<ThemeProvider><Control /></ThemeProvider>);
 expect(document.documentElement.dataset.theme).toBe("dark");
 fireEvent.click(screen.getByRole("button",{name:"dark"}));
 expect(localStorage.getItem("theme")).toBe("light");
 unmount();
 render(<ThemeProvider><Control /></ThemeProvider>);
 expect(document.documentElement.dataset.theme).toBe("light");
});
it("resolves the system preference and follows changes",()=>{
 let changed:((event:{matches:boolean})=>void)|undefined;
 Object.defineProperty(window,"matchMedia",{configurable:true,value:jest.fn(()=>({matches:true,addEventListener:(_name:string,listener:typeof changed)=>{changed=listener;},removeEventListener:jest.fn()}))});
 render(<ThemeProvider><Control /></ThemeProvider>);
 fireEvent.click(screen.getByRole("button",{name:"Sistema"}));
 expect(localStorage.getItem("theme")).toBe("system");
 expect(document.documentElement.dataset.theme).toBe("dark");
});
