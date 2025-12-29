import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AmbientPlayer from '../components/AmbientPlayer';
import PDFReader from '../components/PDFReader';
import CalendarModal from '../components/CalendarModal';
import GalleryModal from '../components/GalleryModal';
import WhatsAppButton from '../components/WhatsAppButton';
import ResourcesSection from '../components/ResourcesSection';
import { Image as ImageIcon, ArrowRight } from 'lucide-react';

// Sections
import HeroSection from '../components/home/HeroSection';
import FounderSection from '../components/home/FounderSection';
import InstituteSection from '../components/home/InstituteSection';
import BlogSection from '../components/home/BlogSection';
import InstagramSection from '../components/home/InstagramSection';

export default function PublicHome() {
    const { courses, alertMessage, blogPosts } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();

    // Derive Modal State from URL
    const isCalendarOpen = searchParams.get('modal') === 'calendar';
    const isReaderOpen = searchParams.get('modal') === 'reader';
    const isGalleryOpen = searchParams.get('modal') === 'gallery';
    const articleId = searchParams.get('articleId');
    const selectedArticle = articleId ? blogPosts.find(p => String(p.id) === String(articleId)) : null;

    const openReader = (article) => {
        setSearchParams({ modal: 'reader', articleId: article.id });
    };

    const closeModals = () => {
        setSearchParams({});
    };

    return (
        <div className="bg-paper min-h-screen text-text font-sans antialiased selection:bg-accent/20">

            {/* 1. Alert Bar */}
            {alertMessage && (
                <div className="bg-primary text-white text-xs font-bold tracking-widest uppercase text-center py-3 px-4 relative z-50">
                    {alertMessage}
                </div>
            )}

            <Navbar />

            <HeroSection />

            <FounderSection />

            {/* NEW: Resources Section (Replaces inline FeelingsTree) */}
            <ResourcesSection />

            <InstituteSection
                courses={courses}
                onOpenCalendar={() => setSearchParams({ modal: 'calendar' })}
            />

            <BlogSection
                blogPosts={blogPosts}
                onOpenReader={openReader}
            />

            {/* GALLERY TRIGGER SECTION */}
            <section className="py-20 bg-stone-100 border-t border-stone-200">
                <div className="container mx-auto px-6 max-w-6xl text-center">
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">Memória Viva</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight mb-8">Galeria <span className="italic text-gold font-light">Visual</span></h2>

                    <button
                        onClick={() => setSearchParams({ modal: 'gallery' })}
                        className="group bg-white border border-stone-200 px-8 py-6 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 inline-flex flex-col items-center gap-4"
                    >
                        <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center text-primary group-hover:bg-gold group-hover:text-white transition-colors">
                            <ImageIcon size={32} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">Abrir Galeria de Fotos</span>
                    </button>

                    <p className="mt-8 text-primary/40 text-sm max-w-lg mx-auto">
                        Explore os registros fotográficos de nossas vivências, formações e da natureza que compõe o instituto.
                    </p>
                </div>
            </section>

            <InstagramSection />

            <Footer />
            <WhatsAppButton />
            <AmbientPlayer />

            <PDFReader
                isOpen={isReaderOpen}
                onClose={closeModals}
                article={selectedArticle}
            />
            <CalendarModal
                isOpen={isCalendarOpen}
                onClose={closeModals}
                courses={courses}
            />
            <GalleryModal
                isOpen={isGalleryOpen}
                onClose={closeModals}
            />
        </div>
    );
}
