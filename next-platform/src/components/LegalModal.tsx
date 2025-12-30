
"use client";

import { motion } from 'framer-motion';
import { X, ShieldCheck, FileText, Calendar } from 'lucide-react';
import { Modal, ModalContent } from './ui/Modal';
import { legalContent } from '@/data/legalText';

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'privacy' | 'terms' | null;
}

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
    if (!type) return null;

    const data = legalContent[type];
    const Icon = type === 'privacy' ? ShieldCheck : FileText;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent size="lg" className="bg-paper overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="relative bg-stone-50 border-b border-stone-100 p-8 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-center text-gold">
                            <Icon size={24} />
                        </div>
                        <div>
                            <h2 className="font-serif text-2xl text-primary">{data.title}</h2>
                            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-primary/40 mt-1">
                                <Calendar size={10} />
                                <span>Atualizado em {data.lastUpdated}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-stone-200/50 flex items-center justify-center text-primary/40 hover:text-primary transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-8 md:p-12 space-y-8 custom-scrollbar">
                    {data.content.map((section, index) => (
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
