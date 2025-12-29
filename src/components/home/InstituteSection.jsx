import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

export default function InstituteSection({ courses = [], onOpenCalendar }) {
    // 3 latest courses
    const displayCourses = courses.slice(0, 3);

    return (
        <section id="instituto" className="py-20 md:py-32 px-6 bg-[#EFECE5]">
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="mb-16 md:flex justify-between items-end"
                >
                    <div className="max-w-2xl">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary/60 mb-4 block">Formação & Estudos</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight mb-6">
                            Ciclos de <span className="italic text-gold font-light">Aprendizagem</span>
                        </h2>
                        <p className="text-lg text-primary/70 leading-relaxed font-light text-balance">
                            Nossos percursos formativos são convites para habitar a Gestalt-terapia com rigor ético, densidade teórica e sensibilidade clínica.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <button
                            onClick={onOpenCalendar}
                            className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-1 hover:text-gold hover:border-gold transition-colors"
                        >
                            Ver Calendário Completo
                        </button>
                    </div>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {displayCourses.map((course, index) => {
                        const isClosed = course.status === 'Encerrado' || course.status === 'Esgotado';

                        return (
                            <motion.article
                                key={course.id || index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: { delay: index * 0.1, duration: 0.6 }
                                    }
                                }}
                                className="group flex flex-col h-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                            >
                                <div className="aspect-[4/3] overflow-hidden rounded-xl mb-6 relative">
                                    {/* Link image also to details */}
                                    <Link to={`/curso/${course.id}`} className="block w-full h-full">
                                        <img
                                            src={course.image || course.images?.[0] || 'https://via.placeholder.com/400x300'}
                                            alt={course.title}
                                            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${isClosed ? 'grayscale opacity-70' : ''}`}
                                        />
                                    </Link>
                                    <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
                                        {course.category && (
                                            <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider text-primary shadow-sm border border-gray-100">
                                                {course.category === 'Formacao' ? 'Formação' : course.category === 'GrupoEstudos' ? 'Grupo de Estudos' : 'Curso Livre'}
                                            </span>
                                        )}
                                        {isClosed && (
                                            <span className="bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider text-white shadow-sm">
                                                {course.status}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col px-2">
                                    <div className="mb-4">
                                        <Link to={`/curso/${course.id}`} className="block">
                                            <h3 className="text-xl font-bold text-primary mb-2 leading-tight group-hover:text-gold transition-colors">
                                                {course.title}
                                            </h3>
                                        </Link>
                                        {course.subtitle && (
                                            <p className="text-sm text-primary/60 italic mb-2">
                                                {course.subtitle}
                                            </p>
                                        )}
                                        <p className="text-xs font-medium uppercase tracking-wider text-sage">
                                            {course.date}
                                        </p>
                                    </div>

                                    <p className="text-primary/70 text-sm leading-relaxed mb-6 line-clamp-3">
                                        {course.description || course.details?.intro}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                        {isClosed ? (
                                            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 cursor-not-allowed py-2">
                                                Inscrições Encerradas
                                            </span>
                                        ) : (
                                            <Link
                                                to={`/curso/${course.id}`}
                                                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:gap-4 transition-all py-3 px-2 -ml-2 rounded-lg hover:bg-gray-50 bg-transparent active:scale-95 touch-manipulation"
                                            >
                                                Saiba Mais <span className="text-gold">→</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <button
                        onClick={onOpenCalendar}
                        className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-1 hover:text-gold hover:border-gold transition-colors"
                    >
                        Ver Calendário Completo
                    </button>
                </div>
            </div>
        </section>
    );
}
