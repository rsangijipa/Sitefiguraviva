import { motion } from "framer-motion";
import { Award, Star, CheckCircle } from "lucide-react";

interface BadgeProps {
  type: "bronze" | "silver" | "gold" | "platinum" | "special";
  icon?: React.ReactNode;
  title: string;
  description?: string;
  isLocked?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variants = {
  bronze:
    "from-orange-700/80 to-orange-400/80 border-orange-500/50 text-orange-100",
  silver:
    "from-slate-400/80 to-slate-200/80 border-slate-300/50 text-slate-800",
  gold: "from-yellow-600/80 to-yellow-300/80 border-yellow-400/50 text-yellow-900",
  platinum: "from-cyan-700/80 to-cyan-400/80 border-cyan-500/50 text-cyan-100",
  special: "from-primary/90 to-primary-light/90 border-primary/50 text-white",
};

const sizes = {
  sm: "w-16 h-16 p-3",
  md: "w-24 h-24 p-5",
  lg: "w-32 h-32 p-6",
};

export default function BadgeDisplay({
  type,
  icon,
  title,
  description,
  isLocked = false,
  size = "md",
  className = "",
}: BadgeProps) {
  const baseClasses =
    "relative rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg backdrop-blur-sm border-2 overflow-hidden transform transition-all duration-300";
  const lockedClasses = isLocked
    ? "opacity-40 grayscale contrast-125"
    : "hover:scale-105 hover:shadow-xl";

  return (
    <div className={`flex flex-col items-center gap-2 group ${className}`}>
      <motion.div
        initial={false}
        className={`${baseClasses} ${variants[type]} ${sizes[size]} ${lockedClasses}`}
        whileHover={!isLocked ? { rotate: [0, -5, 5, 0] } : {}}
      >
        {/* Shine Effect */}
        {!isLocked && (
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -translate-x-full group-hover:translate-x-full" />
        )}

        {/* Content */}
        <div className="relative z-10 drop-shadow-md">
          {icon || (
            <Award
              size={size === "sm" ? 24 : size === "md" ? 40 : 56}
              strokeWidth={1.5}
            />
          )}
        </div>

        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center"></div>
        )}
      </motion.div>

      {/* Label */}
      <div className="text-center">
        <h4
          className={`font-serif font-bold leading-tight ${size === "sm" ? "text-xs" : "text-sm"} ${isLocked ? "text-stone-400" : "text-primary"}`}
        >
          {title}
        </h4>
        {description && !isLocked && (
          <span className="text-[10px] text-stone-500 block mt-1 leading-snug max-w-[120px]">
            {description}
          </span>
        )}
      </div>
    </div>
  );
}
