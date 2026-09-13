import React from "react";
import { CardCategory, CardType } from "../types";

interface CategoryGlyphProps {
  category: CardCategory | CardType;
  className?: string;
  size?: number;
}

export const CategoryGlyph: React.FC<CategoryGlyphProps> = ({
  category,
  className = "",
  size = 28,
}) => {
  const norm = category.toUpperCase();

  // Abstract glyphs according to specification:
  // Conceito: duas formas que se relacionam
  // Autor: tipografia e moldura editorial
  // Pergunta: espaço vazio mais amplo e traço orgânico
  // Clínica: dois campos em relação
  // Campo: linhas/nós sutis
  // Fenomenologia: uma forma emergindo de outra

  if (norm.includes("CONCEITO")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="16"
          r="8"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <circle
          cx="20"
          cy="16"
          r="8"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeDasharray="2 2"
        />
        <path
          d="M16 11.5C17.5 13 17.5 19 16 20.5"
          stroke="#96551F"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (norm.includes("AUTOR")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        {/* Editorial frame and serif typographic hint */}
        <rect
          x="5"
          y="5"
          width="22"
          height="22"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line x1="9" y1="5" x2="23" y2="5" stroke="#96551F" strokeWidth="2" />
        <path
          d="M12 21V11H16C18.5 11 19.5 12.5 19.5 14C19.5 15.5 18.5 17 16 17H12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="16"
          y1="17"
          x2="20"
          y2="21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (norm.includes("PERGUNTA")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        {/* Ample negative space and organic stroke */}
        <path
          d="M16 7C12 7 9.5 9.5 9.5 13C9.5 16 16 17 16 20.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle cx="16" cy="24.5" r="1.5" fill="#96551F" />
        <path
          d="M24 16C24 20.4183 20.4183 24 16 24"
          stroke="#005A1F"
          strokeWidth="1"
          strokeDasharray="1.5 2.5"
        />
      </svg>
    );
  }

  if (norm.includes("CLÍNICA") || norm.includes("CLINICA")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        {/* Two fields in relation */}
        <rect
          x="6"
          y="7"
          width="13"
          height="18"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="13"
          y="11"
          width="13"
          height="14"
          rx="3"
          stroke="#96551F"
          strokeWidth="1.5"
        />
        <circle cx="14.5" cy="18" r="1.5" fill="#005A1F" />
      </svg>
    );
  }

  if (norm.includes("CAMPO")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        {/* Subtle lines and nodes */}
        <circle
          cx="8"
          cy="16"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="24" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="21" cy="22" r="2.5" stroke="#96551F" strokeWidth="1.5" />
        <line
          x1="10.5"
          y1="15"
          x2="22"
          y2="11"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeDasharray="2 2"
        />
        <line
          x1="10.5"
          y1="17"
          x2="18.5"
          y2="21.5"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <line
          x1="23.5"
          y1="12"
          x2="21.5"
          y2="19.5"
          stroke="#96551F"
          strokeWidth="1"
          strokeDasharray="1.5 2"
        />
      </svg>
    );
  }

  // FENOMENOLOGIA: uma forma emergindo de outra
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <ellipse
        cx="16"
        cy="20"
        rx="10"
        ry="6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M16 6C12.5 12 10 16 16 19C22 16 19.5 12 16 6Z"
        stroke="#96551F"
        strokeWidth="1.5"
      />
      <circle cx="16" cy="14" r="1.5" fill="#005A1F" />
    </svg>
  );
};
