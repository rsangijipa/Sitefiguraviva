import { motion, Variants } from "framer-motion";

interface WaveLinesProps {
  className?: string;
}

export default function WaveLines({ className = "" }: WaveLinesProps) {
  // Creating a more organic, topographic feel with multiple thinner lines

  interface Wave {
    color: string;
    opacity: number;
    width: number;
    path: string;
    animatePath: string[];
    duration: number;
    delay?: number;
  }

  const waves: Wave[] = [
    // Golden delicate lines
    {
      color: "#D4AF37",
      opacity: 0.08,
      width: 1.5,
      path: "M-100,200 Q400,100 800,400 T1600,200",
      animatePath: [
        "M-100,200 Q400,100 800,400 T1600,200",
        "M-100,250 Q500,150 700,450 T1600,250",
        "M-100,200 Q400,100 800,400 T1600,200",
      ],
      duration: 25,
    },
    {
      color: "#D4AF37",
      opacity: 0.05,
      width: 1,
      path: "M-100,220 Q420,120 820,420 T1620,220",
      animatePath: [
        "M-100,220 Q420,120 820,420 T1620,220",
        "M-100,270 Q520,170 720,470 T1620,270",
        "M-100,220 Q420,120 820,420 T1620,220",
      ],
      duration: 28,
      delay: 1,
    },
    // Sage Green delicate lines
    {
      color: "#4A5D4F",
      opacity: 0.06,
      width: 2,
      path: "M-100,500 Q300,700 900,400 T1600,600",
      animatePath: [
        "M-100,500 Q300,700 900,400 T1600,600",
        "M-100,450 Q400,600 800,500 T1600,550",
        "M-100,500 Q300,700 900,400 T1600,600",
      ],
      duration: 32,
    },
    {
      color: "#4A5D4F",
      opacity: 0.04,
      width: 1,
      path: "M-100,520 Q320,720 920,420 T1620,620",
      animatePath: [
        "M-100,520 Q320,720 920,420 T1620,620",
        "M-100,470 Q420,620 820,520 T1620,570",
        "M-100,520 Q320,720 920,420 T1620,620",
      ],
      duration: 35,
      delay: 2,
    },
    // Earthy Sand lines
    {
      color: "#C0B8A0",
      opacity: 0.1,
      width: 1,
      path: "M-100,350 Q500,500 1000,200 T1600,400",
      animatePath: [
        "M-100,350 Q500,500 1000,200 T1600,400",
        "M-100,300 Q600,450 900,250 T1600,350",
        "M-100,350 Q500,500 1000,200 T1600,400",
      ],
      duration: 40,
    },
  ];

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
      >
        {waves.map((wave, i) => (
          <motion.path
            key={i}
            fill="none"
            stroke={wave.color}
            strokeWidth={wave.width}
            strokeOpacity={wave.opacity}
            d={wave.path}
            animate={{
              d: wave.animatePath,
            }}
            transition={{
              duration: wave.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: wave.delay || 0,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
