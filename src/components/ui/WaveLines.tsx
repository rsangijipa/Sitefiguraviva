import { motion, Variants } from 'framer-motion';

interface WaveLinesProps {
    className?: string;
}

export default function WaveLines({ className = "" }: WaveLinesProps) {
    // Increased stroke widths and larger amplitude paths to cover more space physically and visually.

    interface Wave {
        color: string;
        opacity: number;
        width: number;
        pathVariants: Variants;
        duration: number;
    }

    const waves: Wave[] = [
        // Gold Wave - Dominant
        {
            color: "#D4AF37",
            opacity: 0.15,
            width: 8,
            pathVariants: {
                initial: { d: "M-200,600 C400,400 1000,800 1800,600" },
                animate: {
                    d: [
                        "M-200,600 C400,400 1000,800 1800,600",
                        "M-200,500 C600,800 1200,300 1800,500",
                        "M-200,600 C400,400 1000,800 1800,600"
                    ]
                }
            },
            duration: 20
        },
        // Green Wave - High and sweeping
        {
            color: "#4A5D4F",
            opacity: 0.1,
            width: 12,
            pathVariants: {
                initial: { d: "M-200,200 C400,50 1000,350 1800,200" },
                animate: {
                    d: [
                        "M-200,200 C400,50 1000,350 1800,200",
                        "M-200,300 C500,100 1100,500 1800,300",
                        "M-200,200 C400,50 1000,350 1800,200"
                    ]
                }
            },
            duration: 25
        },
        // Sand Wave - Middle Filler
        {
            color: "#C0B8A0",
            opacity: 0.2,
            width: 6,
            pathVariants: {
                initial: { d: "M-200,400 C600,200 1200,600 1800,400" },
                animate: {
                    d: [
                        "M-200,400 C600,200 1200,600 1800,400",
                        "M-200,350 C500,650 1300,150 1800,350",
                        "M-200,400 C600,200 1200,600 1800,400"
                    ]
                }
            },
            duration: 30
        }
    ];

    return (
        <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
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
                        initial="initial"
                        animate="animate"
                        variants={wave.pathVariants}
                        transition={{
                            duration: wave.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}
