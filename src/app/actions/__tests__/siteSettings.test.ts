jest.mock("@/lib/auth/server", () => ({ requireAdmin: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock(
  "@/features/public-site/infrastructure/supabasePublicPagesRepository.server",
  () => ({ upsertPublicPage: jest.fn() }),
);
import { requireAdmin } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import { upsertPublicPage } from "@/features/public-site/infrastructure/supabasePublicPagesRepository.server";
import { updateSiteSettings } from "../siteSettings";
import { DEFAULT_HOME } from "@/lib/site-content";
beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(requireAdmin)
    .mockResolvedValue({ email: "admin@example.com" } as any);
  jest.mocked(upsertPublicPage).mockResolvedValue("now");
});
it("publishes homepage content and revalidates the actual institutional routes", async () => {
  expect(await updateSiteSettings("home", DEFAULT_HOME)).toEqual({
    success: true,
    updatedAt: "now",
  });
  expect(upsertPublicPage).toHaveBeenCalledWith(
    "home",
    expect.objectContaining({
      heroTitle: DEFAULT_HOME.heroTitle,
      faqs: DEFAULT_HOME.faqs,
    }),
  );
  expect(revalidatePath).toHaveBeenCalledWith("/instituto/fundadora", "page");
  expect(revalidatePath).toHaveBeenCalledWith("/instituto/manifesto", "page");
});
it("rejects unauthorized writes", async () => {
  jest.mocked(requireAdmin).mockRejectedValue(new Error("Sem permissão"));
  expect(await updateSiteSettings("home", DEFAULT_HOME)).toMatchObject({
    success: false,
  });
  expect(upsertPublicPage).not.toHaveBeenCalled();
});
it("rejects incomplete FAQ entries and unsafe image links", async () => {
  expect(
    await updateSiteSettings("home", {
      ...DEFAULT_HOME,
      faqs: [{ question: "", answer: "" }],
    }),
  ).toMatchObject({ success: false });
  expect(
    await updateSiteSettings("founder", {
      name: "Ana",
      role: "",
      bio: "",
      image: "javascript:alert(1)",
      link: "",
    }),
  ).toMatchObject({ success: false });
  expect(upsertPublicPage).not.toHaveBeenCalled();
});
it("does not persist retired visual settings", async () => {
  expect(
    await updateSiteSettings("config", {
      whatsappNumber: "5569992481585",
      whatsappMessage: "Olá",
      showAudioControl: true,
      visualMode: "classic",
      enableParticles: false,
    }),
  ).toMatchObject({ success: true });
  expect(jest.mocked(upsertPublicPage).mock.calls[0][1]).not.toHaveProperty(
    "visualMode",
  );
  expect(upsertPublicPage.mock.calls[0][1]).not.toHaveProperty(
    "enableParticles",
  );
});
