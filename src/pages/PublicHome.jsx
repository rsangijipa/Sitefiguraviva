import { useState } from 'react';
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
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [isReaderOpen, setIsReaderOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const openReader = (article) => {
        setSelectedArticle(article);
        setIsReaderOpen(true);
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
                onOpenCalendar={() => setIsCalendarOpen(true)}
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
                onClose={() => setIsReaderOpen(false)}
                article={selectedArticle}
            />
            <CalendarModal
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                courses={courses} // Pass all courses so it can extract dates
            />
        </div>
    );
}
