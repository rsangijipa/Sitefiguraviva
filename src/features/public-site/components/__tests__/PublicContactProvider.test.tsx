import { renderToStaticMarkup } from "react-dom/server";
import Footer from "@/components/Footer";
import FloatingControls from "@/components/ui/FloatingControls";
import { PublicContactProvider } from "../PublicContactProvider";
import { DEFAULT_PUBLIC_CONTACT } from "../../content/contact";
jest.mock("@/components/providers/ThemeProvider", () => ({
  useTheme: () => ({
    theme: "light",
    preference: "light",
    setPreference: jest.fn(),
    mounted: false,
  }),
}));
it("renders the configured footer and WhatsApp in initial HTML without a query provider", () => {
  const html = renderToStaticMarkup(
    <PublicContactProvider
      value={{
        ...DEFAULT_PUBLIC_CONTACT,
        address: "Endereço configurado",
        whatsappNumber: "5511999999999",
        whatsappMessage: "Quero informações",
        showAudioControl: false,
      }}
    >
      <Footer />
      <FloatingControls />
    </PublicContactProvider>,
  );
  expect(html).toContain("Endereço configurado");
  expect(html).toContain(
    "https://wa.me/5511999999999?text=Quero%20informa%C3%A7%C3%B5es",
  );
  expect(html).not.toContain("<audio");
});
it("keeps a usable contact fallback when rendered outside the application shell", () => {
  expect(renderToStaticMarkup(<FloatingControls />)).toContain(
    "https://wa.me/" + DEFAULT_PUBLIC_CONTACT.whatsappNumber,
  );
});
