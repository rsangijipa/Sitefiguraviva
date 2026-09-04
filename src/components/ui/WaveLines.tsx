interface WaveLinesProps {
  className?: string;
}

/**
 * Linhas de fundo. Antes cada uma interpolava o atributo `d` em laço infinito —
 * cinco animações de caminho SVG rodando na thread principal para sempre, atrás
 * do conteúdo, a 4–10% de opacidade. O desenho ficou; o laço saiu.
 */
interface Wave {
  color: string;
  opacity: number;
  width: number;
  path: string;
}

const WAVES: Wave[] = [
  // Golden delicate lines
  {
    color: "#D4AF37",
    opacity: 0.08,
    width: 1.5,
    path: "M-100,200 Q400,100 800,400 T1600,200",
  },
  {
    color: "#D4AF37",
    opacity: 0.05,
    width: 1,
    path: "M-100,220 Q420,120 820,420 T1620,220",
  },
  // Sage Green delicate lines
  {
    color: "#4A5D4F",
    opacity: 0.06,
    width: 2,
    path: "M-100,500 Q300,700 900,400 T1600,600",
  },
  {
    color: "#4A5D4F",
    opacity: 0.04,
    width: 1,
    path: "M-100,520 Q320,720 920,420 T1620,620",
  },
  // Earthy Sand lines
  {
    color: "#C0B8A0",
    opacity: 0.1,
    width: 1,
    path: "M-100,350 Q500,500 1000,200 T1600,400",
  },
];

export default function WaveLines({ className = "" }: WaveLinesProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
      >
        {WAVES.map((wave, i) => (
          <path
            key={i}
            fill="none"
            stroke={wave.color}
            strokeWidth={wave.width}
            strokeOpacity={wave.opacity}
            d={wave.path}
          />
        ))}
      </svg>
    </div>
  );
}
