"use client";

import { Facebook, Instagram, Mail, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#4a3b32] text-paper py-16 md:py-32 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] translate-y-1/4 translate-x-1/4" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-12 gap-12 md:gap-24 mb-16 md:mb-24 pb-16 border-b border-paper/10">

                    <div className="md:col-span-4 lg:col-span-5">
                        <h3 className="font-serif text-5xl mb-8">Figura <span className="font-light text-gold italic">Viva</span></h3>
                        <p className="text-paper/60 font-light text-lg leading-relaxed max-w-sm mb-10">
                            Habitando a fronteira do encontro, cultivando awareness e transformando vidas através da Gestalt-Terapia.
                        </p>
                        <div className="flex gap-6">
                            <a
                                href="https://www.instagram.com/institutofiguraviva/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full border border-paper/10 flex items-center justify-center hover:bg-paper hover:text-primary transition-soft group"
                            >
                                <Instagram size={20} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a
                                href="mailto:contato@figuraviva.com"
                                className="w-12 h-12 rounded-full border border-paper/10 flex items-center justify-center hover:bg-paper hover:text-primary transition-soft group"
                            >
                                <Mail size={20} className="group-hover:scale-110 transition-transform" />
                            </a>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="font-sans font-bold uppercase tracking-[0.3em] text-[10px] mb-10 text-gold">Explorar</h4>
                        <ul className="space-y-6 font-light text-sm text-paper/70">
                            <li><a href="#instituto" className="hover:text-gold transition-soft py-2 block min-h-[44px] flex items-center">Formações</a></li>
                            <li><a href="#clinica" className="hover:text-gold transition-soft py-2 block min-h-[44px] flex items-center">Clínica</a></li>
                            <li><a href="/portal" className="hover:text-gold transition-soft py-2 block min-h-[44px] flex items-center">Portal do Aluno</a></li>
                        </ul>
                    </div>

                    <div className="md:col-span-6 lg:col-span-5">
                        <h4 className="font-sans font-bold uppercase tracking-[0.3em] text-[10px] mb-10 text-gold">Localização</h4>
                        <div className="grid lg:grid-cols-2 gap-10">
                            <div>
                                <div className="flex items-start gap-4 mb-8">
                                    <MapPin size={18} className="text-gold shrink-0 mt-1" />
                                    <p className="font-light text-sm text-paper/70 leading-relaxed">
                                        Rua Pinheiro Machado, 2033 - Central<br />
                                        Porto Velho - RO<br />
                                        CEP 76801-057<br />
                                        (69) 99248-1585
                                    </p>
                                </div>
                                <button
                                    onClick={() => window.open('https://maps.google.com', '_blank')} // Simple event handler is fine in Server Component if no state? No, onClick requires Client Component or just make it an anchor
                                    className="bg-primary text-white border border-transparent px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-all transform active:scale-95 shadow-sm"
                                >
                                    Traçar Rota
                                </button>
                            </div>

                            <div className="h-48 rounded-2xl overflow-hidden border border-paper/5 shadow-2xl relative group">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1973546776103!2d-46.6542999238318!3d-23.56385106159231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%201000%20-%20Bela%20Vista%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2001310-100!5e0!3m2!1sen!2sbr!4v1709000000000!5m2!1sen!2sbr"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    className="grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-soft duration-700"
                                ></iframe>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-paper/30 font-bold tracking-[0.2em] uppercase">
                    <p>&copy; {new Date().getFullYear()} Instituto Figura Viva • Todos os direitos reservados</p>
                    <div className="flex gap-10 mt-6 md:mt-0">
                        <a href="#" className="hover:text-paper transition-soft">Privacidade</a>
                        <a href="#" className="hover:text-paper transition-soft">Termos</a>
                    </div>
                </div>

            </div>
        </footer>
    );
}
