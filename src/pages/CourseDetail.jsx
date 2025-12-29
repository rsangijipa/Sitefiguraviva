import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../services/courseService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowLeft, ExternalLink } from 'lucide-react';

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            setLoading(true);
            const data = await courseService.getById(id);
            setCourse(data);
            setLoading(false);
        };
        fetchCourse();
    }, [id]);

    const getCoverImage = () => {
        if (!course) return '';
        if (course.images && course.images.length > 0) return course.images[0];
        return course.image;
    };

    const getGalleryImages = () => {
        if (!course || !course.images || course.images.length <= 1) return [];
        return course.images.slice(1); // Exclude the cover image
    };

    const openLightbox = (index) => {
        // Index relative to all images (cover + gallery)
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    if (loading) return <div className="min-h-screen bg-paper flex items-center justify-center font-serif text-3xl">Carregando...</div>;
    if (!course) return <div className="min-h-screen bg-paper flex items-center justify-center font-serif text-3xl">Curso não encontrado.</div>;

    const galleryImages = getGalleryImages();
    const allImages = course.images && course.images.length > 0 ? course.images : [course.image];

    return (
        <div className="bg-paper min-h-screen">
            <Navbar />
            <main className="pt-32 pb-20 md:pt-40">
                <div className="container mx-auto px-6 max-w-6xl">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-[10px] mb-12 hover:translate-x-[-5px] transition-transform">
                        <ArrowLeft size={14} /> Voltar
                    </button>

                    {/* HERO SECTION */}
                    <div className="grid lg:grid-cols-2 gap-16 items-start mb-24">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <span className="bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">{course.status || 'Aberto'}</span>

                            <div>
                                <h1 className="font-serif text-4xl md:text-6xl text-primary leading-tight mb-4">{course.title}</h1>
                                {course.subtitle && <p className="text-xl md:text-2xl font-serif italic text-gold/80 leading-snug">{course.subtitle}</p>}
                            </div>

                            {/* Mediators */}
                            {course.mediators && (
                                <div className="border-l-4 border-accent/20 pl-6 py-2">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Mediadoras</h4>
                                    <p className="text-lg text-primary font-medium">{course.mediators.join(' e ')}</p>
                                </div>
                            )}

                            {/* Meta Info */}
                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-4 text-primary/70">
                                    <Calendar className="text-gold shrink-0" size={20} />
                                    <span className="font-light text-lg">{course.fullDate || course.date}</span>
                                </div>
                                <div className="flex items-center gap-4 text-primary/70">
                                    <MapPin className="text-gold shrink-0" size={20} />
                                    <span className="font-light text-lg">Online via Zoom</span>
                                </div>
                                {/* Tags */}
                                {course.tags && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {course.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-white border border-gray-100 rounded text-[10px] uppercase font-bold text-gray-400">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => window.open(course.link, '_blank')}
                                className="w-full md:w-auto px-8 py-4 bg-primary text-paper rounded-xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-gold hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3"
                            >
                                Inscrever-se Agora <ExternalLink size={14} />
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative cursor-pointer group"
                            onClick={() => openLightbox(0)}
                        >
                            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-8 border-white bg-white">
                                <img src={getCoverImage()} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            </div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[3rem]">
                                <span className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-xs uppercase tracking-widest font-bold">Ver Capa</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* CONTENT BLOCKS */}
                    <div className="grid md:grid-cols-12 gap-12">

                        {/* Main Content (Left) */}
                        <div className="md:col-span-8 space-y-16">

                            {/* Intro / Description */}
                            <section>
                                <h3 className="font-serif text-3xl text-primary mb-6">O que você vai vivenciar</h3>
                                <p className="text-lg text-primary/70 font-light leading-relaxed whitespace-pre-line">
                                    {course.details?.intro || course.description}
                                </p>
                            </section>

                            {/* How it works (Bullets) */}
                            {course.details?.format && (
                                <section className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm">
                                    <h3 className="font-serif text-2xl text-primary mb-6">Como funciona</h3>
                                    <ul className="space-y-4">
                                        {course.details.format.map((item, i) => (
                                            <li key={i} className="flex items-start gap-4">
                                                <span className="w-1.5 h-1.5 mt-2.5 rounded-full bg-accent shrink-0" />
                                                <span className="text-primary/70 leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* Gallery Section (If any) */}
                            {galleryImages.length > 0 && (
                                <section>
                                    <h3 className="font-serif text-2xl text-primary mb-6">Galeria</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {galleryImages.map((img, idx) => (
                                            <div key={idx} className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => openLightbox(idx + 1)}>
                                                <img src={img} className="w-full h-full object-cover" alt="" />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar (Right) - Calendar & CTA */}
                        <div className="md:col-span-4 space-y-8">

                            {/* Calendar Widget */}
                            {course.details?.schedule && (
                                <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 sticky top-32">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-primary text-sm uppercase tracking-wider">Cronograma</h4>
                                            <p className="text-xs text-primary/50">12 Encontros</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-8">
                                        {course.details.schedule.map((date, i) => (
                                            <div key={i} className="bg-white px-3 py-2 rounded border border-stone-100 text-center">
                                                <span className="text-sm font-bold text-primary/80">{date}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-center">
                                        <p className="text-xs text-primary/50 mb-4">Tem alguma dúvida?</p>
                                        <a
                                            href="https://wa.me/556992481585"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full py-3 border border-green-200 bg-green-50 text-green-700 font-bold uppercase tracking-widest text-[10px] rounded-lg hover:bg-green-100 transition-colors"
                                        >
                                            Falar no WhatsApp
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Lightbox remains the same */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
                    <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                        <ArrowLeft size={32} className="rotate-180" />
                    </button>
                    <div className="max-w-5xl max-h-screen">
                        <img src={allImages[lightboxIndex]} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                    </div>
                </div>
            )}
        </div>
    );
}
