import {
  Caveat,
  Cormorant_Garamond,
  Dancing_Script,
  Lora,
  Playfair_Display,
} from "next/font/google";

/**
 * Fontes das mensagens da folha. Ficam auto-hospedadas pelo Next e, com
 * `preload: false`, o navegador só baixa o arquivo de uma família quando a
 * folha sorteia aquele estilo: nada disso pesa no carregamento da página.
 *
 * O Next exige argumentos literais nestas chamadas (sem spread/variáveis).
 */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "500",
  style: "italic",
  display: "swap",
  preload: false,
});
const caveat = Caveat({
  subsets: ["latin"],
  weight: "600",
  display: "swap",
  preload: false,
});
const lora = Lora({
  subsets: ["latin"],
  weight: "500",
  style: "italic",
  display: "swap",
  preload: false,
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "600",
  style: "italic",
  display: "swap",
  preload: false,
});
const dancing = Dancing_Script({
  subsets: ["latin"],
  weight: "600",
  display: "swap",
  preload: false,
});

export const HERO_FONTS: Record<string, string> = {
  playfair: playfair.style.fontFamily,
  caveat: caveat.style.fontFamily,
  lora: lora.style.fontFamily,
  cormorant: cormorant.style.fontFamily,
  dancing: dancing.style.fontFamily,
};
