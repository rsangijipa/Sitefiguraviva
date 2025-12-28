import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Calendar, ExternalLink, Heart, MessageCircle, FileText, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Fade In Up Variant
const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

export default function PublicHome() {
    const { courses, alertMessage, blogPosts } = useApp();
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <div className="bg-paper min-h-screen flex flex-col font-sans text-primary overflow-hidden">

            {/* 1. Alert Bar */}
            {alertMessage && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-accent text-white text-xs font-bold tracking-widest uppercase text-center py-2 px-4 shadow-md relative z-50"
                >
                    {alertMessage}
                </motion.div>
            )}

            <Navbar />

            {/* 2. Hero Section (Parallax) */}
            <header ref={heroRef} className="relative w-full h-screen flex items-center justify-center overflow-hidden">
                <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80&w=2000"
                        alt="Nature Texture"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/30 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-t from-paper via-transparent to-transparent opacity-90" />
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 container mx-auto px-6 text-center"
                >
                    <motion.div variants={fadeInUp}>
                        <span className="inline-block px-4 py-1 rounded-full border border-paper/30 text-paper/80 text-xs tracking-[0.2em] uppercase mb-6 backdrop-blur-sm">
                            Instituto de Gestalt-Terapia
                        </span>
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="font-serif text-6xl md:text-8xl lg:text-9xl text-paper mb-8 leading-[0.9]">
                        Habitar a <br />
                        <span className="italic text-gold font-light relative">
                            fronteira
                            <motion.span
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
                                className="absolute -bottom-2 left-0 h-1 bg-gold opacity-60"
                            />
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-sage/90 text-lg md:text-xl font-light mb-12 max-w-xl mx-auto tracking-wide leading-relaxed">
                        Um espaço vivo de acolhimento clínico e formação profissional, onde o encontro transforma.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col md:flex-row gap-6 justify-center items-center">
                        <a href="#clinica" className="group relative px-8 py-4 bg-paper text-primary font-bold uppercase tracking-widest text-xs rounded-full overflow-hidden transition-all hover:scale-105 shadow-lg shadow-black/10">
                            <span className="relative z-10 flex items-center gap-2">
                                Começar Terapia <ArrowRight size={16} />
                            </span>
                        </a>
                        <a href="#instituto" className="group relative px-8 py-4 bg-transparent border border-paper/40 text-paper font-bold uppercase tracking-widest text-xs rounded-full overflow-hidden transition-all hover:bg-paper hover:text-primary backdrop-blur-sm">
                            <span className="relative z-10">Formação Profissional</span>
                        </a>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ delay: 2, duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 text-paper/50"
                >
                    <ChevronDown size={32} />
                </motion.div>
            </header>

            {/* 3. Clinical Section (Abordagem) */}
            <section id="clinica" className="py-32 relative overflow-hidden">
                <div className="absolute top-20 left-0 w-96 h-96 bg-sage/20 rounded-full blur-[100px]" />

                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="relative z-10 overflow-hidden rounded-organic-1 shadow-2xl">
                            <motion.img
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.6 }}
                                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1000"
                                alt="Therapy Session"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -bottom-10 -left-10 w-full h-full border-2 border-gold/30 rounded-organic-1 z-0" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <span className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-6 block">Espaço Clínico</span>
                        <h2 className="font-serif text-6xl text-primary mb-8 leading-none">A Arte da <br /><span className="italic text-gold">Presença</span></h2>
                        <p className="text-primary/70 mb-8 leading-relaxed font-light text-lg">
                            Na Gestalt-Terapia, não buscamos apenas "consertar" o que está errado. Buscamos ampliar a consciência (awareness) sobre como você existe no mundo aqui e agora.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <motion.button
                                whileHover={{ y: -5 }}
                                className="flex items-center justify-center gap-3 bg-green-700 text-white px-8 py-4 rounded-xl shadow-lg shadow-green-900/20 hover:bg-green-800 transition-colors"
                            >
                                <MessageCircle size={20} />
                                <span className="font-bold text-sm tracking-wide">Agendar via WhatsApp</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ y: -5 }}
                                className="flex items-center justify-center gap-3 bg-white border border-primary/10 text-primary px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors"
                                onClick={() => window.open('https://docs.google.com/forms/u/0/', '_blank')}
                            >
                                <FileText size={20} />
                                <span className="font-bold text-sm tracking-wide">Preencher Anamnese</span>
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 4. Institute Section (Courses - Physical Cards) */}
            <section id="instituto" className="py-32 bg-primary text-paper relative overflow-hidden">
                {/* Grain overlay specific to dark section */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <span className="text-gold font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Instituto Figura Viva</span>
                        <h2 className="font-serif text-6xl mb-6">Formação & Cursos</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {courses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                whileHover={{ y: -15, rotateX: 5, rotateY: 5 }}
                                className="bg-paper text-primary rounded-2xl overflow-hidden shadow-2xl relative group transform preserve-3d perspective-1000"
                            >
                                <div className="h-64 overflow-hidden relative">
                                    <div className={`absolute top-4 right-4 z-10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-md shadow-sm ${course.status === 'Aberto' ? 'bg-white/90 text-green-800' :
                                            course.status === 'Esgotado' ? 'bg-white/90 text-red-800' : 'bg-gray-200/90 text-gray-600'
                                        }`}>
                                        {course.status}
                                    </div>
                                    <motion.img
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.8 }}
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-500" />
                                </div>

                                <div className="p-8">
                                    <h3 className="font-serif text-3xl mb-4 leading-tight">{course.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-accent font-bold mb-8 uppercase tracking-wider">
                                        <Calendar size={16} />
                                        <span>{course.date}</span>
                                    </div>

                                    <button className="w-full py-4 border-t border-primary/10 hover:bg-gold hover:text-white transition-colors flex items-center justify-between group-hover:px-4 duration-300">
                                        <span className="font-bold uppercase text-xs tracking-widest">
                                            {course.status === 'Aberto' ? 'Inscrever-se' : 'Saiba Mais'}
                                        </span>
                                        <ExternalLink size={16} className="transform group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Agenda (Google Calendar) */}
            <section id="agenda" className="py-32 bg-paper relative">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row gap-20 items-center">
                        <div className="md:w-1/3">
                            <span className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Agenda Viva</span>
                            <h2 className="font-serif text-5xl text-primary mb-8">Encontros & Eventos</h2>
                            <p className="text-primary/70 font-light mb-8 leading-relaxed">
                                Nossa agenda é um organismo vivo. Aqui você encontra workshops abertos, grupos de estudos e supervisões públicas.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-12 h-12 rounded-full border border-gold flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-colors">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-primary">Próximo Grupo de Estudos</h4>
                                        <p className="text-sm text-sage">Quinta-feira, 19h • Online</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="md:w-2/3 w-full bg-white p-2 shadow-2xl rounded-3xl -rotate-1 hover:rotate-0 transition-transform duration-700 ease-out"
                        >
                            <div className="aspect-video w-full bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100">
                                <iframe
                                    src="https://calendar.google.com/calendar/embed?src=pt.brazilian%23holiday%40group.v.calendar.google.com&ctz=America%2FSao_Paulo&showTitle=0&showPrint=0&showTabs=0&showCalendars=0"
                                    style={{ border: 0 }}
                                    width="100%"
                                    height="100%"
                                    className="grayscale hover:grayscale-0 transition-all duration-700"
                                ></iframe>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 6. Visual Diary (Refined) */}
            <section className="py-32 bg-paper box-border border-t border-primary/5 overflow-hidden">
                <div className="container mx-auto px-6 mb-16 flex justify-between items-end">
                    <div>
                        <span className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Arquivo</span>
                        <h2 className="font-serif text-5xl text-primary">Diário Visual</h2>
                    </div>
                    <motion.a
                        whileHover={{ x: 5 }}
                        href="#"
                        className="hidden md:flex items-center gap-2 text-primary font-bold text-sm tracking-widest hover:text-accent transition-colors"
                    >
                        VER TODOS <ArrowRight size={16} />
                    </motion.a>
                </div>

                <motion.div
                    className="flex gap-8 overflow-x-auto pb-12 px-6 container mx-auto snap-x custom-scrollbar"
                >
                    {blogPosts.map((post, idx) => (
                        <motion.div
                            key={post.id}
                            whileHover={{ y: -10 }}
                            className="min-w-[350px] md:min-w-[450px] snap-center"
                        >
                            <div className="bg-white p-10 rounded-organic-2 shadow-xl border border-primary/5 h-full flex flex-col justify-between group cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-sage/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors" />

                                <div>
                                    <span className="text-[10px] font-bold text-gold uppercase tracking-widest mb-4 block">{post.date}</span>
                                    <h3 className="font-serif text-3xl text-primary mb-4 leading-none group-hover:text-accent transition-colors">{post.title}</h3>
                                    <p className="text-primary/60 font-light leading-relaxed">{post.excerpt}</p>
                                </div>
                                <div className="flex justify-end mt-8 text-primary/20 group-hover:text-accent transition-colors">
                                    <Heart size={20} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            <Footer />
        </div>
    );
}
