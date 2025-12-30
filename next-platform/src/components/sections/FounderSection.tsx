"use client";

import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function FounderSection() {
    const { founderData } = useApp();

    // Fallback data
    const data = founderData || {
        name: "Lilian Vanessa Nicacio Gusmão Vianei",
        role: "Psicóloga e Gestalt-terapeuta",
        bio: "Psicóloga, gestalt-terapeuta e pesquisadora, com trajetória que integra clínica, docência e estudos em trauma, psicoterapia corporal e neurodiversidades, além de perspectivas feministas e decoloniais.",
        image: "/assets/lilian.jpeg",
        link: "http://lattes.cnpq.br/"
    };

    return (
        <section id="fundadora" className="py-20 bg-stone-50 border-t border-stone-200">
            <div className="container mx-auto px-6 max-w-5xl">
                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                    {/* Image - Compact */}
                    <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0">
                        <div className="absolute inset-0 rounded-full border-2 border-gold/30 scale-105" />
                        <div className="w-full h-full rounded-full overflow-hidden shadow-lg border-4 border-white bg-stone-200 relative">
                            <Image
                                src={data.image}
                                alt={data.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 192px, 256px"
                                priority
                            />
                        </div>
                    </div>

                    {/* Content - Compact */}
                    <div className="text-center md:text-left flex-1">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-2 block">
                            Curadoria
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl text-primary mb-2">
                            {data.name}
                        </h2>
                        <p className="text-sm font-bold uppercase tracking-wider text-primary/40 mb-6">
                            {data.role}
                        </p>
                        <p className="text-primary/70 leading-relaxed mb-6 max-w-2xl font-light text-lg">
                            {data.bio}
                        </p>

                        <div className="flex justify-center md:justify-start">
                            <a
                                href={data.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary hover:text-gold transition-colors"
                            >
                                Ver Currículo Lattes
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
