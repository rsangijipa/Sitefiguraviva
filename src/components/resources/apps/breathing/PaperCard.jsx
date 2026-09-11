import { motion } from "framer-motion";
import { clsx } from "clsx";

export function PaperCard({ children, className, onClick, active = false }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileHover={{ y: -4, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        "relative bg-white rounded-2xl p-6 border text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-3",
        active
          ? "border-primary shadow-lg ring-1 ring-primary/20"
          : "border-gray-100 shadow-sm hover:border-gray-200",
        className,
      )}
    >
      {children}
      {/* Texture overlay effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl bg-[radial-gradient(circle_at_20%_20%,rgba(38,43,34,.35)_1px,transparent_1px)] [background-size:18px_18px]" />
    </motion.button>
  );
}
