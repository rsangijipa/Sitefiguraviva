"use client";

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

export default function FounderSection() {
    return (
        <section id="fundadora" className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="order-2 lg:order-1"
                    >
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">Fundadora</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-primary mb-8 leading-tight">Lilian Vanessa <span className="italic text-gold font-light">Nicacio Gusmão Vianei</span></h2>

                        <div className="space-y-6 text-lg text-text/80 leading-relaxed font-light">
                            <p>
                                Mulher, mineira, migrante, mãe atípica e feminista. Atuo como psicóloga, Gestalt-terapeuta, idealizadora, sócia fundadora e curadora do Instituto de Gestalt-terapia de Rondônia – Figura Viva com ênfase em estudos, vivências a partir de temas feministas, antirracistas, anticapacitistas e decoloniais, que des-cobrem e in-ventam uma presença sensível no campo/organismo/ambiente.
                            </p>
                            <p>
                                Formação e Pós-formação em Gestalt-terapia, Trauma, Psicoterapia corporal, Neurodiversidades. Escreve com interesse em temas como o lugar da mulher na Gestalt-terapia a partir de Laura Perls, opressões de gênero, violências, solidariedade política entre mulheres brancas e multiétnicas. Mestra em Ciências Ambientais pela UNITAU e graduada em psicologia pela UFMG, docente e a primeira mulher da família a possuir uma graduação.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-gold flex-shrink-0 shadow-sm" />
                                    <div>
                                        <h4 className="font-bold text-primary text-base uppercase tracking-wider mb-1">Mestra & Psicóloga</h4>
                                        <p className="text-sm font-medium text-text/80">Ciências Ambientais (UNITAU) e Psicologia (UFMG).</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-gold flex-shrink-0 shadow-sm" />
                                    <div>
                                        <h4 className="font-bold text-primary text-base uppercase tracking-wider mb-1">Gestalt-Terapeuta</h4>
                                        <p className="text-sm font-medium text-text/80">Foco em Neurodiversidades, Trauma e Temas Feministas.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8">
                                <a
                                    href="http://lattes.cnpq.br/9287840585952055"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-b border-primary pb-1 hover:text-gold hover:border-gold transition-colors"
                                >
                                    Acesse o Currículo Lattes <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="order-1 lg:order-2 relative"
                    >
                        <div className="relative z-10 aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl">
                            <img
                                src="/assets/lilian-vanessa.jpeg"
                                alt="Lilian Vanessa Nicacio Gusmão"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -top-10 -right-10 w-full h-full border-2 border-gold/20 rounded-[2rem] -z-10" />
                        <div className="absolute -bottom-6 -left-6 bg-paper p-8 rounded-2xl shadow-xl z-20 hidden md:block border border-gray-100">
                            <p className="font-serif italic text-primary text-lg leading-snug">
                                "O encontro é a fronteira onde a vida se renova."
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
