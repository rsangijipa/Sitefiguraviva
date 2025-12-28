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
            <header ref={heroRef} className="relative w-full h-[110vh] flex items-center justify-center overflow-hidden">
                <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80&w=2000"
                        alt="Nature Texture"
                        className="w-full h-full object-cover scale-110"
                    />
                    <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-paper" />
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 container mx-auto px-6 text-center"
                >
                    <motion.div variants={fadeInUp} className="mb-8">
                        <span className="inline-block px-6 py-2 rounded-full glass-dark text-paper/90 text-[10px] font-bold tracking-[0.3em] uppercase backdrop-blur-3xl border border-white/10">
                            Instituto de Gestalt-Terapia
                        </span>
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="font-serif text-6xl md:text-8xl lg:text-[10rem] text-paper mb-10 leading-[0.85] tracking-tighter">
                        Habitar a <br />
                        <span className="italic text-gold font-light relative">
                            fronteira
                            <motion.span
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
                                className="absolute -bottom-4 left-0 h-[2px] bg-gradient-to-r from-gold/0 via-gold to-gold/0 opacity-60"
                            />
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-paper/70 text-lg md:text-2xl font-light mb-16 max-w-2xl mx-auto tracking-wide leading-relaxed">
                        Um espaço vivo de acolhimento clínico e formação profissional, onde o encontro transforma.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col md:flex-row gap-8 justify-center items-center">
                        <a href="#clinica" className="group relative px-10 py-5 bg-paper text-primary font-bold uppercase tracking-[0.2em] text-[10px] rounded-full overflow-hidden transition-soft hover:scale-105 shadow-2xl shadow-black/20">
                            <span className="relative z-10 flex items-center gap-3">
                                Começar Terapia <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </a>
                        <a href="#instituto" className="group relative px-10 py-5 bg-transparent border border-paper/20 text-paper font-bold uppercase tracking-[0.2em] text-[10px] rounded-full overflow-hidden transition-soft hover:bg-paper hover:text-primary backdrop-blur-md">
                            <span className="relative z-10">Formação Profissional</span>
                        </a>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 15, 0] }}
                    transition={{ delay: 2, duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 text-paper/40 flex flex-col items-center gap-2"
                >
                    <span className="text-[9px] uppercase tracking-[0.4em] font-bold">Descubra</span>
                    <ChevronDown size={24} />
                </motion.div>
            </header>

            {/* 3. Clinical Section (Abordagem) */}
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
                        <h2 className="font-serif text-5xl md:text-7xl text-primary mb-10 leading-[1.1]">A Arte da <br /><span className="italic text-gold italic font-light">Presença</span></h2>
                        <p className="text-primary/70 mb-12 leading-relaxed font-light text-xl">
                            Na Gestalt-Terapia, não buscamos apenas "consertar" o que está errado. Buscamos ampliar a <span className="text-primary font-medium italic">awareness</span> sobre como você existe no mundo aqui e agora.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <motion.button
                                whileHover={{ y: -5, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center justify-center gap-4 bg-[#25D366] text-white px-10 py-5 rounded-2xl shadow-xl shadow-green-900/10 hover:shadow-green-900/20 transition-soft active:shadow-inner"
                            >
                                <MessageCircle size={20} />
                                <span className="font-bold text-[11px] uppercase tracking-widest">Agendar via WhatsApp</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ y: -5, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center justify-center gap-4 bg-white border border-primary/5 text-primary px-10 py-5 rounded-2xl hover:bg-gray-50 transition-soft shadow-sm hover:shadow-lg"
                                onClick={() => window.open('https://docs.google.com/forms/u/0/', '_blank')}
                            >
                                <FileText size={20} />
                                <span className="font-bold text-[11px] uppercase tracking-widest">Preencher Anamnese</span>
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 4. Institute Section (Courses - Physical Cards) */}
            <section id="instituto" className="py-24 md:py-48 bg-primary text-paper relative overflow-hidden">
                {/* Background Textures */}
                <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold/10 rounded-full blur-[150px]" />
                    <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px]" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-24 md:mb-32"
                    >
                        <span className="text-gold font-bold uppercase tracking-[0.4em] text-[10px] mb-6 block">Conhecimento que Transforma</span>
                        <h2 className="font-serif text-5xl md:text-[5rem] mb-10 leading-none">Formação & Cursos</h2>
                        <div className="w-24 h-[1px] bg-gold/30 mx-auto" />
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
                        {courses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 1, ease: [0.23, 1, 0.32, 1] }}
                                className="group relative"
                            >
                                <div className="bg-paper text-primary rounded-3xl overflow-hidden shadow-2xl transition-soft group-hover:-translate-y-4 group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)]">
                                    <div className="h-72 overflow-hidden relative">
                                        <div className={`absolute top-6 left-6 z-20 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] rounded-full backdrop-blur-xl border border-white/20 shadow-sm transition-soft ${course.status === 'Aberto' ? 'bg-white/90 text-green-800' :
                                            course.status === 'Esgotado' ? 'bg-white/90 text-red-800' : 'bg-gray-200/90 text-gray-600'
                                            }`}>
                                            {course.status}
                                        </div>
                                        <motion.img
                                            whileHover={{ scale: 1.15 }}
                                            transition={{ duration: 1.2 }}
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-cover grayscale transition-soft group-hover:grayscale-0"
                                        />
                                        <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-soft mix-blend-multiply" />
                                    </div>

                                    <div className="p-10">
                                        <div className="flex items-center gap-3 text-accent font-bold mb-6">
                                            <Calendar size={14} />
                                            <span className="text-[10px] uppercase tracking-[0.2em]">{course.date}</span>
                                        </div>
                                        <h3 className="font-serif text-3xl mb-8 leading-tight h-18 line-clamp-2">{course.title}</h3>

                                        <button className="w-full py-5 rounded-2xl border border-primary/5 bg-gray-50 flex items-center justify-center gap-3 transition-soft group-hover:bg-primary group-hover:text-paper group-hover:border-primary">
                                            <span className="font-bold uppercase text-[10px] tracking-[0.2em]">
                                                {course.status === 'Aberto' ? 'Reservar Vaga' : 'Saiba Mais'}
                                            </span>
                                            <ExternalLink size={14} className="transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Agenda (Google Calendar) */}
            <section id="agenda" className="py-24 md:py-48 bg-paper relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-24 items-center">
                        <div className="lg:w-[40%]">
                            <span className="text-accent font-bold uppercase tracking-[0.4em] text-[10px] mb-8 block">Presença em Fluxo</span>
                            <h2 className="font-serif text-5xl md:text-7xl text-primary mb-12 leading-none">Encontros & Eventos</h2>
                            <p className="text-primary/70 font-light mb-12 leading-relaxed text-xl">
                                Nossa agenda é um organismo vivo. Aqui você encontra workshops abertos, grupos de estudos e supervisões públicas.
                            </p>

                            <div className="space-y-8">
                                <motion.div
                                    whileHover={{ x: 10 }}
                                    className="flex items-start gap-6 group cursor-pointer p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-soft border border-transparent hover:border-primary/5"
                                >
                                    <div className="w-14 h-14 rounded-full glass border border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-soft shadow-lg">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-primary mb-1">Próximo Grupo de Estudos</h4>
                                        <p className="text-sm text-sage flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                                            Quinta-feira, 19h • Online
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                            className="lg:w-[60%] w-full bg-white p-3 shadow-[0_60px_100px_-20px_rgba(0,0,0,0.1)] rounded-[2.5rem] border border-primary/5"
                        >
                            <div className="aspect-[16/10] w-full bg-gray-50 rounded-[2rem] overflow-hidden relative border border-gray-100 shadow-inner">
                                <iframe
                                    src="https://calendar.google.com/calendar/embed?src=pt.brazilian%23holiday%40group.v.calendar.google.com&ctz=America%2FSao_Paulo&showTitle=0&showPrint=0&showTabs=0&showCalendars=0"
                                    style={{ border: 0 }}
                                    width="100%"
                                    height="100%"
                                    className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-soft"
                                ></iframe>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 6. Visual Diary (Refined) */}
            <section className="py-24 md:py-48 bg-paper border-t border-primary/5 overflow-hidden">
                <div className="container mx-auto px-6 mb-20 flex justify-between items-end">
                    <div>
                        <span className="text-accent font-bold uppercase tracking-[0.4em] text-[10px] mb-8 block">Arquivo de Sentidos</span>
                        <h2 className="font-serif text-5xl md:text-7xl text-primary leading-none">Diário Visual</h2>
                    </div>
                    <motion.a
                        whileHover={{ x: 5 }}
                        href="#"
                        className="hidden md:flex items-center gap-3 text-primary font-bold text-[10px] tracking-[0.3em] uppercase hover:text-accent transition-soft"
                    >
                        VER TODOS <ArrowRight size={14} />
                    </motion.a>
                </div>

                <motion.div
                    className="flex gap-10 overflow-x-auto pb-20 px-6 container mx-auto snap-x custom-scrollbar"
                >
                    {blogPosts.map((post, idx) => (
                        <motion.div
                            key={post.id}
                            whileHover={{ y: -15 }}
                            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                            className="min-w-[320px] md:min-w-[450px] snap-center"
                        >
                            <div className="group bg-white p-12 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] border border-primary/5 h-full flex flex-col justify-between cursor-pointer relative overflow-hidden transition-soft hover:shadow-[0_40px_80px_-20px_rgba(38,58,58,0.1)]">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-sage/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-soft" />

                                <div>
                                    <span className="text-[9px] font-bold text-gold uppercase tracking-[0.3em] mb-8 block opacity-60">{post.date}</span>
                                    <h3 className="font-serif text-4xl text-primary mb-6 leading-tight group-hover:text-accent transition-soft">{post.title}</h3>
                                    <p className="text-primary/60 font-light leading-relaxed text-lg line-clamp-3">{post.excerpt}</p>
                                </div>

                                <div className="flex items-center justify-between mt-12">
                                    <div className="flex items-center gap-2 text-primary/30 group-hover:text-accent transition-soft">
                                        <Heart size={18} className="fill-current" />
                                        <span className="text-[10px] font-bold tracking-widest">GUARDAR</span>
                                    </div>
                                    <ArrowRight size={20} className="text-primary/20 group-hover:text-primary group-hover:translate-x-2 transition-soft" />
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
