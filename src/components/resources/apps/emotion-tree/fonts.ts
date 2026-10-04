import { Caveat, Cormorant_Garamond, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

const display = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const displayAlt = Playfair_Display({ variable: "--font-display-alt", subsets: ["latin"], weight: ["500", "600"], display: "swap" });
const hand = Caveat({ variable: "--font-hand", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const sans = Plus_Jakarta_Sans({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });

export const emotionTreeFonts = `${display.variable} ${displayAlt.variable} ${hand.variable} ${sans.variable}`;
