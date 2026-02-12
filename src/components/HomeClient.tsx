"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// import { useApp } from '../context/AppContext'; (Removed)
import Navbar from "./Navbar";
import Footer from "./Footer";
import AlertBar from "./AlertBar";
import HeroSection from "./sections/HeroSection";
import CoursesSection from "./sections/CoursesSection";
import FounderSection from "./sections/FounderSection";
import FloatingControls from "./ui/FloatingControls";
import { useUI } from "@/context/UIContext";
import { useSearchParams, useRouter } from "next/navigation";
import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import MethodologySection from "./sections/MethodologySection";
import { MemoryMiniFooter } from "./sections/MemoryMiniFooter";
import SectionShell from "./ui/SectionShell";

const BlogSection = dynamic(() => import("./sections/BlogSection"));
const ResourcesSection = dynamic(() => import("./ResourcesSection"));
const InstagramSection = dynamic(() => import("./InstagramSection"));
const InstituteSection = dynamic(() => import("./sections/InstituteSection"));
const TestimonialsSection = dynamic(
  () => import("./sections/TestimonialsSection"),
);
const FAQSection = dynamic(() => import("./sections/FAQSection"));

const GalleryModal = dynamic(() => import("./GalleryModal"), { ssr: false });
const CalendarModal = dynamic(() => import("./CalendarModal"), { ssr: false });
const PDFReader = dynamic(() => import("./PDFReader"), { ssr: false });
const CourseModal = dynamic(() => import("./CourseModal"), { ssr: false });
const BlogPostModal = dynamic(() => import("./BlogPostModal"), {
  ssr: false,
});
const LegalModal = dynamic(() => import("./LegalModal"), { ssr: false });

// interface HomeClientProps removed

import {
  useCourses,
  useBlogPosts,
  usePublicGallery,
} from "../hooks/useContent";

interface HomeClientProps {
  initialData?: {
    courses: any[];
    posts: any[];
    gallery: any[];
    founder?: any;
    institute?: any;
    seo?: any;
  };
}

import methodology from "./sections/MethodologySection";
import ScrollProgressBar from "./motion/ScrollProgressBar";
import Reveal from "./motion/Reveal";

export default function HomeClient({ initialData }: HomeClientProps = {}) {
  const { data: courses = [] } = useCourses(false, {
    initialData: initialData?.courses,
  });
  const { data: blogPosts = [] } = useBlogPosts(false, {
    initialData: initialData?.posts,
  });
  const { data: gallery = [] } = usePublicGallery({
    initialData: initialData?.gallery,
  });

  const { showAlert } = useUI();

  useEffect(() => {
    // Set initial alert if needed, or fetch from DB
    showAlert("Bem-vindos ao Instituto Figura Viva");
  }, []);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Modal states derived from URL
  const modalType = searchParams.get("modal");
  const isCalendarOpen = modalType === "calendar";
  const isReaderOpen = modalType === "reader";
  const isGalleryOpen = modalType === "gallery";

  // New Modal types for Course and Blog
  const isCourseOpen = modalType === "course";
  const isBlogOpen = modalType === "blog";
  const isPrivacyOpen = modalType === "privacy";
  const isTermsOpen = modalType === "terms";
  const legalType = isPrivacyOpen ? "privacy" : isTermsOpen ? "terms" : null;

  // Item IDs
  const articleId = searchParams.get("articleId");
  const courseId = searchParams.get("courseId");
  const postId = searchParams.get("postId");

  // Resolve selections
  const selectedArticle = articleId
    ? blogPosts.find((p: any) => String(p.id) === String(articleId))
    : null;
  const selectedCourse = courseId
    ? courses.find((c: any) => String(c.id) === String(courseId))
    : null;
  const selectedPost = postId
    ? blogPosts.find((p: any) => String(p.id) === String(postId))
    : null;

  const closeModals = () => {
    router.push("/", { scroll: false });
  };

  const openModal = (name: string) => {
    router.push(`/?modal=${name}`, { scroll: false });
  };

  const selectCourse = (course: any) => {
    router.push(`/?modal=course&courseId=${course.id}`, { scroll: false });
  };

  const selectPost = (post: any) => {
    if (post.type === "library") {
      router.push(`/?modal=reader&articleId=${post.id}`, { scroll: false });
    } else {
      router.push(`/?modal=blog&postId=${post.id}`, { scroll: false });
    }
  };

  return (
    <div className="bg-paper min-h-screen flex flex-col font-sans text-primary overflow-hidden fx-grain">
      <ScrollProgressBar />
      <AlertBar />
      <Navbar />

      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="outline-none"
      >
        <HeroSection initialData={initialData?.institute} />

        <Reveal variant="medium">
          <FounderSection initialData={initialData?.founder} />
        </Reveal>

        {/* Laura Perls Tribute - Placed below Curator/Founder */}
        <Reveal variant="soft">
          <MemoryMiniFooter />
        </Reveal>

        <Reveal variant="medium">
          <MethodologySection />
        </Reveal>

        <Reveal variant="medium">
          <CoursesSection
            courses={courses}
            onOpenCalendar={() => openModal("calendar")}
            onSelectCourse={selectCourse}
          />
        </Reveal>

        <Reveal variant="soft">
          <TestimonialsSection />
        </Reveal>

        <Reveal variant="medium">
          <InstituteSection gallery={gallery} />
        </Reveal>

        <Reveal variant="soft">
          <ResourcesSection />
        </Reveal>

        <Reveal variant="medium">
          <BlogSection blogPosts={blogPosts} onSelectPost={selectPost} />
        </Reveal>

        <Reveal variant="soft">
          <FAQSection />
        </Reveal>

        <Reveal variant="soft">
          <InstagramSection />
        </Reveal>
      </main>

      <Footer />
      <FloatingControls />

      {/* MODALS */}

      <CourseModal
        isOpen={isCourseOpen}
        onClose={closeModals}
        course={selectedCourse}
      />

      <BlogPostModal
        isOpen={isBlogOpen}
        onClose={closeModals}
        post={selectedPost}
      />

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
        gallery={gallery}
      />
      <LegalModal isOpen={!!legalType} onClose={closeModals} type={legalType} />
    </div>
  );
}
