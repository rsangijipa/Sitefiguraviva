import "server-only";
import { unstable_cache } from "next/cache";
import { DEFAULT_PUBLIC_CONTACT, type PublicContact } from "../content/contact";
import { getPublicPage } from "./supabasePublicPagesRepository.server";

// Settings changes already revalidate the root layout. TTL also limits staleness
// for out-of-band edits; failures are allowed to recover on the next request.
const readContact = unstable_cache(
  async (): Promise<PublicContact> => {
    const [config, institute] = await Promise.all([
      getPublicPage("config", DEFAULT_PUBLIC_CONTACT),
      getPublicPage("institute", DEFAULT_PUBLIC_CONTACT),
    ]);
    const text = (value: unknown, fallback: string) =>
      typeof value === "string" ? value : fallback;
    const whatsappNumber =
      typeof config.whatsappNumber === "string" &&
      /^\d{10,15}$/.test(config.whatsappNumber)
        ? config.whatsappNumber
        : DEFAULT_PUBLIC_CONTACT.whatsappNumber;
    return {
      address: text(institute.address, DEFAULT_PUBLIC_CONTACT.address),
      phone: whatsappNumber,
      whatsappNumber,
      whatsappMessage: text(
        config.whatsappMessage,
        DEFAULT_PUBLIC_CONTACT.whatsappMessage,
      ),
      showAudioControl:
        typeof config.showAudioControl === "boolean"
          ? config.showAudioControl
          : true,
    };
  },
  ["public-contact-v1"],
  { revalidate: 60 },
);

export async function getPublicContact(): Promise<PublicContact> {
  try {
    return await readContact();
  } catch {
    return DEFAULT_PUBLIC_CONTACT;
  }
}
