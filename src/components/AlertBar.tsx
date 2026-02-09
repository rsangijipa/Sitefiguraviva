"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

import { useUI } from "@/context/UIContext";

export default function AlertBar() {
  const { alert, hideAlert } = useUI();

  if (!alert) return null;

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={hideAlert}
          className="bg-accent text-white text-xs font-bold tracking-widest uppercase text-center py-2 px-4 shadow-md relative z-[60] cursor-pointer hover:bg-gold transition-colors"
        >
          {alert}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
