import { motion } from "framer-motion";
import { clsx } from "clsx";

export function PaperCard({ children, className, onClick = null, active = false }) {
  const Element = onClick ? motion.button : motion.div;
  return (
    <Element
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-pressed={onClick ? active : undefined}
      whileHover={{ y: -4, boxShadow: "none" }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        "relative bg-paper rounded-2xl p-6 border text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-3",
        active
          ? "border-primary  ring-1 ring-primary/20"
          : "border-nevoa  hover:border-nevoa",
        className,
      )}
    >
      {children}
      {/* Texture overlay effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl bg-[radial-gradient(circle_at_20%_20%,rgb(38 43 34 / .35)_1px,transparent_1px)] [background-size:18px_18px]" />
    </Element>
  );
}
