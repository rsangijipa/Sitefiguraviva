"use client";

import { motion } from 'framer-motion';
import { MessageCircle, FileText } from 'lucide-react';
import { buttonVariants } from '../ui/Button';

export default function ClinicalSection() {
    return (
        <section id="clinica" className="py-24 md:py-48 relative overflow-hidden">
            <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-sage/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 lg:gap-32 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                    className="relative"
                >
                    <div className="relative z-10 overflow-hidden rounded-organic-1 shadow-[0_50px_100px_-20px_rgba(38,58,58,0.3)]">
                        <motion.img
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1000"
                            alt="Therapy Session"
                            className="w-full aspect-[4/5] object-cover"
                        />
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute -bottom-10 -left-10 w-full h-full border-2 border-gold/20 rounded-organic-1 -z-10" />
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
                >
                    <span className="text-accent font-bold uppercase tracking-[0.3em] text-[10px] mb-8 block">Espaço Clínico</span>
                    <h2 className="heading-section mb-10 text-balance">A Arte da <br /><span className="italic text-gold italic font-light">Presença</span></h2>
                    <p className="text-primary/70 mb-12 leading-relaxed font-light text-xl text-balance">
                        Na Gestalt-Terapia, não buscamos apenas "consertar" o que está errado. Buscamos ampliar a <span className="text-primary font-medium italic">awareness</span> sobre como você existe no mundo aqui e agora.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <motion.button
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={buttonVariants({
                                variant: 'primary',
                                size: 'lg',
                                className: 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl shadow-green-900/10 hover:shadow-green-900/20 rounded-2xl gap-4'
                            })}
                        >
                            <MessageCircle size={20} />
                            <span className="font-bold text-[11px] uppercase tracking-widest">Agendar via WhatsApp</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={buttonVariants({
                                variant: 'secondary',
                                size: 'lg',
                                className: 'rounded-2xl gap-4 border-primary/5'
                            })}
                            onClick={() => window.open('https://docs.google.com/forms/u/0/', '_blank')}
                        >
                            <FileText size={20} />
                            <span className="font-bold text-[11px] uppercase tracking-widest">Preencher Anamnese</span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
