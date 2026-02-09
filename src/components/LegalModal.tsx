"use client";

import { motion } from "framer-motion";
import { X, ShieldCheck, FileText, Calendar } from "lucide-react";
import { Modal, ModalContent } from "./ui/Modal";
import { useLegalSettings } from "@/hooks/useSiteSettings";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "privacy" | "terms" | null;
}

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  const { data } = useLegalSettings();

  if (!type || !data) return null;

  const content = data[type];
  const Icon = type === "privacy" ? ShieldCheck : FileText;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent
        size="lg"
        className="bg-paper overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="relative bg-stone-50 border-b border-stone-100 p-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-center text-gold">
              <Icon size={24} />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-primary">
                {content.title}
              </h2>
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-primary/40 mt-1">
                <Calendar size={10} />
                <span>Atualizado em {content.lastUpdated}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="group flex items-center gap-2 bg-white border border-stone-100 pl-3 pr-2 py-2 rounded-full text-primary hover:bg-gold hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary shadow-sm hover:translate-y-[-1px]"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap">
              Fechar
            </span>
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-stone-100 group-hover:bg-white/20 transition-colors">
              <X size={14} />
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-8 md:p-12 space-y-8 custom-scrollbar">
          {content.content.map((section, index) => (
            <motion.section
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="font-serif text-lg text-primary mb-3 font-bold">
                {section.heading}
              </h3>
              <p className="text-primary/70 leading-relaxed font-light text-sm text-justify">
                {section.text}
              </p>
            </motion.section>
          ))}

          <div className="pt-8 border-t border-stone-100 text-center">
            <p className="text-xs text-primary/40 italic">
              Instituto Figura Viva - Todos os direitos reservados.
            </p>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
