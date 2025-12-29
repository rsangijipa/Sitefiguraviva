import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AmbientPlayer from '../components/AmbientPlayer';
import PDFReader from '../components/PDFReader';
import CalendarModal from '../components/CalendarModal';
import WhatsAppButton from '../components/WhatsAppButton';
import ResourcesSection from '../components/ResourcesSection';

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
                courses={courses} // Pass all courses so it can extract dates
            />
        </div>
    );
}
