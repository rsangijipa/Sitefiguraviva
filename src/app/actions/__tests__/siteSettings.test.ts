jest.mock("@/lib/auth/server", () => ({ requireAdmin: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock(
  "@/features/public-site/infrastructure/supabasePublicPagesRepository.server",
  () => ({
    upsertPublicPage: jest.fn(),
    patchPublicConfig: jest.fn(),
    getPublicPage: jest.fn(),
  }),
);
import { requireAdmin } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import {
  upsertPublicPage,
  patchPublicConfig,
} from "@/features/public-site/infrastructure/supabasePublicPagesRepository.server";
import { updateSiteSettings, updateGoogleSettings } from "../siteSettings";
import { DEFAULT_HOME } from "@/lib/site-content";
beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(requireAdmin)
    .mockResolvedValue({ email: "admin@example.com" } as any);
  jest.mocked(upsertPublicPage).mockResolvedValue("now");
  jest.mocked(patchPublicConfig).mockResolvedValue("now");
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
  expect(jest.mocked(patchPublicConfig).mock.calls[0][0]).not.toHaveProperty(
    "visualMode",
  );
  expect(patchPublicConfig.mock.calls[0][0]).not.toHaveProperty(
    "enableParticles",
  );
});

it("validates Google fields and sends only its namespace to the merge", async () => {
  expect(
    await updateGoogleSettings({
      calendarId: "calendar",
      driveFolderId: "folder",
      formsUrl: "https://forms.gle/abc",
      youtubeId: "@channel",
      whatsappNumber: "overwrite",
    }),
  ).toMatchObject({ success: true });
  expect(patchPublicConfig).toHaveBeenCalledWith(
    expect.objectContaining({ calendarId: "calendar" }),
  );
  expect(patchPublicConfig.mock.calls[0][0]).not.toHaveProperty(
    "whatsappNumber",
  );
});
it("rejects unsafe Forms links and unauthorized Google saves", async () => {
  const values = {
    calendarId: "",
    driveFolderId: "",
    formsUrl: "javascript:alert(1)",
    youtubeId: "",
  };
  expect(await updateGoogleSettings(values)).toMatchObject({ success: false });
  jest.mocked(requireAdmin).mockRejectedValue(new Error("denied"));
  expect(await updateGoogleSettings({ ...values, formsUrl: "" })).toMatchObject(
    { success: false },
  );
  expect(patchPublicConfig).not.toHaveBeenCalled();
});
