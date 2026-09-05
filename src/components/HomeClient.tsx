import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays } from "lucide-react";

import Footer from "./Footer";
import Navbar from "./Navbar";
import FloatingControls from "./ui/FloatingControls";
import HeroSection from "./sections/HeroSection";
import MethodologySection from "./sections/MethodologySection";
import TestimonialsSection from "./sections/TestimonialsSection";
import { ConsultationCta } from "@/features/public-site/components/ConsultationCta";
import { getImageSrc } from "@/lib/imageUtils";

interface HomeItem {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  excerpt?: string;
  image?: string | null;
  coverImage?: string;
  created_at?: string | null;
}

interface HomeClientProps {
  initialData?: {
    courses: HomeItem[];
    posts: HomeItem[];
    gallery: unknown[];
    institute?: unknown;
  };
}

function formatDate(value?: string | null) {
  if (!value) return "Conteúdo recente";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Conteúdo recente";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function HomeClient({ initialData }: HomeClientProps = {}) {
  const featuredCourses = (initialData?.courses ?? []).slice(0, 3);
  const latestPosts = (initialData?.posts ?? []).slice(0, 3);

  return (
    <div className="min-h-screen overflow-hidden bg-paper font-sans text-text fx-grain">
      <Navbar />

      <div>
        <span id="instituto-sobre" className="sr-only" aria-hidden="true" />
        <span id="fundadora" className="sr-only" aria-hidden="true" />
        <HeroSection initialData={initialData?.institute} />

        <section
          id="cursos"
          className="fv-bg fv-bg-formations border-y border-border/60 bg-areia py-20 md:py-28"
        >
          <span id="instituto" className="sr-only" aria-hidden="true" />
          <div className="fv-container">
            <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="fv-eyebrow mb-4">Formações em destaque</p>
                <h2 className="heading-section text-primary">
                  Percursos para aprofundar prática e presença.
                </h2>
              </div>
              <Link
                href="/formacoes"
                className="inline-flex min-h-11 items-center gap-2 self-start text-xs font-bold uppercase tracking-[0.16em] text-primary hover:text-gold md:self-auto"
              >
                Ver todas as formações{" "}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            {featuredCourses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredCourses.map((course, index) => (
                  <Link
                    key={course.id}
                    href={`/curso/${course.id}`}
                    data-testid="formation-card"
                    className="group overflow-hidden rounded-md border border-border bg-paper transition-transform duration-300 hover:-translate-y-1 hover:border-igarape focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                      <Image
                        src={getImageSrc(
                          course.image || course.coverImage,
                          "/assets/course-placeholder.jpg",
                        )}
                        alt=""
                        fill
                        unoptimized
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-6">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.17em] text-terra">
                        {course.subtitle || "Gestalt-terapia"}
                      </p>
                      <h3 className="font-serif text-2xl leading-tight text-primary">
                        {course.title}
                      </h3>
                      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-text/70">
                        {course.description ||
                          "Conheça este percurso de formação do Instituto Figura Viva."}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-border bg-paper p-10 text-center">
                <CalendarDays
                  className="mx-auto text-gold"
                  aria-hidden="true"
                />
                <p className="mt-4 font-serif text-2xl text-primary">
                  Novas turmas serão anunciadas em breve.
                </p>
                <Link
                  href="/formacoes"
                  data-testid="formation-card"
                  className="mt-5 inline-flex min-h-11 items-center text-sm font-bold text-primary underline underline-offset-4"
                >
                  Consultar calendário e percursos
                </Link>
              </div>
            )}
          </div>
        </section>

        <MethodologySection />
        <TestimonialsSection />

        <section
          id="blog"
          className="fv-bg fv-bg-articles border-t border-border/60 bg-paper py-20 md:py-28"
        >
          <div className="fv-container">
            <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="fv-eyebrow mb-4">Reflexões & saberes</p>
                <h2 className="heading-section text-primary">
                  Leituras para continuar o encontro.
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex min-h-11 items-center gap-2 self-start text-xs font-bold uppercase tracking-[0.16em] text-primary hover:text-gold md:self-auto"
              >
                Visitar o blog <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            {latestPosts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-3">
                {latestPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.id}`}
                    data-testid="content-card"
                    className="group flex min-h-64 flex-col rounded-md border border-border bg-surface p-7 transition-colors hover:border-igarape focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    <BookOpen
                      className="mb-10 text-gold"
                      size={24}
                      aria-hidden="true"
                    />
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-terra">
                      {formatDate(post.created_at)}
                    </p>
                    <h3 className="mt-3 font-serif text-2xl leading-tight text-primary group-hover:text-igarape">
                      {post.title}
                    </h3>
                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-text/70">
                      {post.excerpt ||
                        "Leia esta reflexão do Instituto Figura Viva."}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                href="/public-library"
                data-testid="content-card"
                className="flex min-h-44 items-center justify-center rounded-md border border-dashed border-border bg-areia px-6 text-center font-serif text-2xl text-primary"
              >
                Enquanto o blog floresce, explore nossa biblioteca.
              </Link>
            )}
          </div>
        </section>

        <span
          id="recursos-interativos"
          className="sr-only"
          aria-hidden="true"
        />
        <ConsultationCta />
      </div>

      <Footer />
      <FloatingControls />
    </div>
  );
}
