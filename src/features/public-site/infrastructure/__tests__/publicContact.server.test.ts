/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));
jest.mock("../supabasePublicPagesRepository.server", () => ({
  getPublicPage: jest.fn(),
}));
import { getPublicPage } from "../supabasePublicPagesRepository.server";
import { getPublicContact } from "../publicContact.server";
import { DEFAULT_PUBLIC_CONTACT } from "../../content/contact";
const read = getPublicPage as jest.Mock;
beforeEach(() => {
  read.mockReset();
});
it("returns only the public contact DTO with configured values", async () => {
  read.mockImplementation(async (key) =>
    key === "config"
      ? {
          whatsappNumber: "5511999999999",
          whatsappMessage: "Contato da turma",
          showAudioControl: false,
          internalNotes: "private",
        }
      : { address: "Endereço revisado", updatedBy: "private@example.com" },
  );
  expect(await getPublicContact()).toEqual({
    address: "Endereço revisado",
    phone: "5511999999999",
    whatsappNumber: "5511999999999",
    whatsappMessage: "Contato da turma",
    showAudioControl: false,
  });
});
it("validates old malformed settings and uses usable fallbacks", async () => {
  read.mockResolvedValue({
    address: 123,
    whatsappNumber: "javascript:alert(1)",
    whatsappMessage: null,
    showAudioControl: "false",
  });
  expect(await getPublicContact()).toMatchObject({
    address: DEFAULT_PUBLIC_CONTACT.address,
    whatsappNumber: DEFAULT_PUBLIC_CONTACT.whatsappNumber,
    whatsappMessage: DEFAULT_PUBLIC_CONTACT.whatsappMessage,
    showAudioControl: true,
  });
});
it("falls back on an outage and recovers when the next read succeeds", async () => {
  read.mockRejectedValue(new Error("Database unavailable"));
  expect(await getPublicContact()).toEqual(DEFAULT_PUBLIC_CONTACT);
  read.mockResolvedValue({ ...DEFAULT_PUBLIC_CONTACT, address: "Restaurado" });
  expect(await getPublicContact()).toMatchObject({ address: "Restaurado" });
});
