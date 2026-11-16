// figuraviva.com.br does not resolve in DNS, so mail to the previous address
// bounced. The institute's domain is institutofiguraviva.com.br; this mailbox
// must exist there (see docs/operations/email-corporativo-e-envio.md).
export const PUBLIC_CONTACT_EMAIL = "contato@institutofiguraviva.com.br";

export const DEFAULT_PUBLIC_CONTACT = {
  address:
    "Rua Santos Dumont, 156 - Uniao, Ouro Preto D'Oeste - RO - CEP 76920-000",
  phone: "(69) 99248-1585",
  whatsappNumber: "5569992481585",
  whatsappMessage:
    "Olá! Gostaria de saber mais sobre as formações do Instituto Figura Viva.",
  showAudioControl: true,
};

export type PublicContact = typeof DEFAULT_PUBLIC_CONTACT;
