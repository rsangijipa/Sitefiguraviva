/** Cor de token: `rgb(var(--x) / <alpha-value>)` é o único formato que deixa o
 *  Tailwind gerar `bg-primary/10`. Com `var(--x)` cru (hex dentro da variável)
 *  o utilitário com barra era descartado silenciosamente na compilação. */
const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** Escala neutra dirigida por variável: `stone` e `gray` invertem no escuro
 *  sem que nenhum componente precise de classe `dark:`. */
const neutral = Object.fromEntries(
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((step) => [
    step,
    `rgb(var(--n-${step}) / <alpha-value>)`,
  ]),
);

/** Sombra da marca: uma cor e um multiplicador de força, ambos temáveis.
 *  No escuro a mesma classe fica mais preta e mais funda automaticamente. */
const shadow = (...layers) =>
  layers
    .map(
      ([x, y, blur, spread, alpha]) =>
        `${x} ${y} ${blur} ${spread} rgb(var(--shadow-color) / calc(var(--shadow-strength) * ${alpha}))`,
    )
    .join(", ");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        stone: neutral,
        gray: neutral,
        primary: token("primary"),
        "primary-dark": token("primary-dark"),
        "primary-light": token("primary-light"),
        "primary-solid": token("primary-solid"),
        secondary: token("secondary"),
        accent: token("accent"),
        "accent-light": token("accent-light"),
        paper: token("paper"),
        surface: token("surface"),
        "surface-raised": token("surface-raised"),
        text: token("text"),
        muted: token("muted"),
        border: token("border"),
        gold: token("gold"),
        "gold-light": token("gold-light"),
        "gold-dark": token("gold-dark"),
        beige: token("beige"),
        success: token("success"),
        warning: token("warning"),
        error: token("error"),
        info: token("igarape"),
        // Design System v1 — nomes da casa
        igarape: token("igarape"),
        terra: token("terra"),
        areia: token("areia"),
        mata: token("text"),
        pedra: token("muted"),
        nevoa: token("border"),
        // Tema fechado do Portal do aluno: intencionalmente fixo, não inverte
        ink: "#0d0c0b",
        agedGold: "#c5a05b",
        glassBg: "rgba(255, 255, 255, 0.03)",
        glassBorder: "rgba(255, 255, 255, 0.08)",
        // Confluência: só elemento gráfico, nunca texto (ver DS 3.1)
        aurora: token("aurora"),
        vazante: token("vazante"),
        broto: token("broto"),
      },
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      // Escala do Design System (3.2), traduzida do impresso para a tela.
      // Fraunces tem altura-x bem maior que a Cormorant que ela substitui, então
      // os mesmos números em pixel leem maiores: os topos da escala baixaram
      // para manter o peso ótico institucional em vez de virar cartaz.
      fontSize: {
        "fluid-h1": [
          "clamp(2.25rem, 5.4vw, 3.75rem)",
          { lineHeight: "1.06", letterSpacing: "-0.02em" },
        ],
        "fluid-h2": [
          "clamp(1.75rem, 3.8vw, 2.75rem)",
          { lineHeight: "1.14", letterSpacing: "-0.012em" },
        ],
        "fluid-h3": [
          "clamp(1.35rem, 2.3vw, 1.85rem)",
          { lineHeight: "1.25", letterSpacing: "-0.006em" },
        ],
        "fluid-body": "clamp(1rem, 1.4vw, 1.1rem)",
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.02em",
        "widest-extra": "0.3em",
      },
      backdropBlur: {
        glass: "12px",
        "glass-lg": "24px",
      },
      transitionTimingFunction: {
        soft: "var(--ease-out-soft)",
        expo: "var(--ease-out-expo)",
        "in-out-soft": "var(--ease-in-out-soft)",
        spring: "var(--ease-spring)",
      },
      boxShadow: {
        "soft-sm": shadow(
          ["0", "1px", "2px", "-1px", 0.05],
          ["0", "2px", "8px", "-2px", 0.05],
        ),
        "soft-md": shadow(
          ["0", "2px", "4px", "-2px", 0.04],
          ["0", "8px", "24px", "-6px", 0.08],
        ),
        "soft-lg": shadow(
          ["0", "4px", "8px", "-4px", 0.05],
          ["0", "18px", "44px", "-10px", 0.1],
        ),
        "soft-xl": shadow(
          ["0", "8px", "16px", "-8px", 0.06],
          ["0", "32px", "72px", "-16px", 0.14],
        ),
        premium: shadow(
          ["0", "0", "0", "1px", 0.04],
          ["0", "3px", "10px", "-3px", 0.06],
          ["0", "14px", "40px", "-12px", 0.1],
        ),
        "elev-1": shadow(["0", "1px", "2px", "0", 0.06]),
        "elev-2": shadow(
          ["0", "2px", "4px", "-2px", 0.05],
          ["0", "6px", "12px", "-4px", 0.07],
        ),
        "elev-3": shadow(
          ["0", "4px", "8px", "-4px", 0.05],
          ["0", "14px", "28px", "-8px", 0.09],
        ),
        "glow-gold":
          "0 0 0 1px rgb(var(--color-gold) / 0.18), 0 8px 30px rgb(var(--color-gold) / 0.18)",
        "glow-primary":
          "0 0 0 1px rgb(var(--color-primary) / 0.2), 0 10px 34px rgb(var(--color-primary) / 0.22)",
        "inner-light": "inset 0 1px 0 0 rgb(255 255 255 / 0.28)",
        none: "none",
      },
      borderRadius: {
        "organic-1": "60% 40% 30% 70% / 60% 30% 70% 40%",
        "organic-2": "50% 50% 20% 80% / 25% 80% 20% 75%",
        "organic-3": "30% 70% 70% 30% / 30% 30% 70% 70%",
      },
      // Só o que o código usa. Os laços infinitos (float, aurora, gradient-shift)
      // saíram junto com os componentes que os pediam: animação de ambiente
      // permanente é custo fixo de GPU por um efeito que ninguém nota.
      animation: {
        "fade-in": "fadeIn 0.45s var(--ease-out-soft) forwards",
        "fade-in-up": "fadeInUp 0.5s var(--ease-out-expo) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
