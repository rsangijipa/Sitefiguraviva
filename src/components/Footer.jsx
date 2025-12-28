import { Facebook, Instagram, Mail, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-primary text-paper py-20 relative overflow-hidden">
            {/* Decorative abstract shape */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-4 gap-12 border-b border-gold/20 pb-12 mb-12">

                    <div className="md:col-span-1">
                        <h3 className="font-serif text-3xl mb-6">Figura <span className="text-gold">Viva</span></h3>
                        <p className="text-sage font-light text-sm leading-relaxed mb-6">
                            Habitando a fronteira do encontro, cultivando awareness e transformando vidas através da Gestalt-Terapia.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gold hover:text-white transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="text-gold hover:text-white transition-colors"><Facebook size={20} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-sans font-bold uppercase tracking-widest text-xs mb-6 text-gold">Explorar</h4>
                        <ul className="space-y-4 font-light text-sm text-sage">
                            <li><a href="#" className="hover:text-paper transition-colors">Sobre Nós</a></li>
                            <li><a href="#" className="hover:text-paper transition-colors">Cursos e Eventos</a></li>
                            <li><a href="#" className="hover:text-paper transition-colors">Atendimento Clínico</a></li>
                            <li><a href="#" className="hover:text-paper transition-colors">Portal do Aluno</a></li>
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="font-sans font-bold uppercase tracking-widest text-xs mb-6 text-gold">Localização</h4>
                        <div className="grid md:grid-cols-2 gap-6">
                            <ul className="space-y-4 font-light text-sm text-sage">
                                <li className="flex items-start gap-3">
                                    <MapPin size={16} className="text-gold mt-1 shrink-0" />
                                    <span>Av. Paulista, 1000, Sala 142<br />Bela Vista, São Paulo - SP<br />CEP 01310-100</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail size={16} className="text-gold" />
                                    <span>contato@figuraviva.com.br</span>
                                </li>
                                <li className="pt-4">
                                    <button className="text-xs border text-gold border-gold px-4 py-2 rounded hover:bg-gold hover:text-primary transition-colors uppercase tracking-widest">
                                        Abrir no Google Maps
                                    </button>
                                </li>
                            </ul>

                            {/* Embedded Google Map */}
                            <div className="h-48 rounded-lg overflow-hidden border border-sage/20 shadow-lg grayscale hover:grayscale-0 transition-all duration-500 relative group">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1973546776103!2d-46.6542999238318!3d-23.56385106159231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%201000%20-%20Bela%20Vista%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2001310-100!5e0!3m2!1sen!2sbr!4v1709000000000!5m2!1sen!2sbr"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="opacity-70 group-hover:opacity-100 transition-opacity"
                                ></iframe>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="flex flex-col md:flex-row justify-between items-center text-xs text-sage/60 font-light">
                    <p>&copy; {new Date().getFullYear()} Instituto Figura Viva. Desenvolvido com Google Cloud.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-gold">Privacidade</a>
                        <a href="#" className="hover:text-gold">Termos</a>
                    </div>
                </div>

            </div>
        </footer>
    );
}
