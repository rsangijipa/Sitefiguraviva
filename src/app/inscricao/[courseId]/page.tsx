import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CourseAgendaSummary from "@/components/courses/CourseAgendaSummary";
import { findPixOrder } from "@/lib/pix-order.server";
import { verifySession } from "@/lib/auth/server";
import EnrollmentStepper from "./EnrollmentStepper";
import PageShell from "@/components/ui/PageShell";
import { getPublishedCourseByField } from "@/features/content/infrastructure/supabaseContentRepository";
import { findEnrollmentBySupabaseUser } from "@/features/enrollments/infrastructure/supabaseEnrollmentRepository.server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

export const dynamic = "force-dynamic";

export default async function EnrollmentPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await verifySession();
  const uid = session?.isActive ? session.uid : null;

  // 1. Fetch Course Data
  const courseData = await getPublishedCourseByField("id", courseId);
  if (!courseData) {
    return (
      <PageShell variant="auth" className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[24px] border border-border/80 bg-paper/95 p-8 text-center shadow-xl backdrop-blur-sm">
          <p className="font-serif text-2xl font-bold text-primary mb-2">Curso não encontrado</p>
          <p className="text-sm text-text/75 mb-6">O curso solicitado não existe ou não está mais disponível.</p>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-xs font-bold uppercase tracking-widest text-white hover:bg-primary-dark transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
      </PageShell>
    );
  }
  const course = { ...courseData, duration: courseData.durationLabel } as any;

  // Check availability (new: status==open; legacy: isPublished==true)
  const isAvailable = course.status === "open" && course.isPublished === true;

  // 2. Fetch Enrollment (Root), Application & Profile in parallel if user logged in
  let enrollmentData = null;
  let applicationData = null;
  let userProfileData = null;

  if (uid) {
    const enrollmentId = `${uid}_${courseId}`;
    const supabase = createSupabaseServiceClient();
    const [enrollment, application, profileRes] = await Promise.all([
      findEnrollmentBySupabaseUser(uid, courseId),
      supabase
        .from("applications")
        .select("*")
        .eq("id", enrollmentId)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("id, email, display_name, phone_number, profession, is_active")
        .eq("id", uid)
        .maybeSingle(),
    ]);

    enrollmentData = enrollment;
    if (application.error) throw application.error;
    applicationData = application.data;
    userProfileData = profileRes.data || null;
  }

  if (!isAvailable && !enrollmentData) {
    return (
      <PageShell variant="auth" className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[24px] border border-border/80 bg-paper/95 p-8 text-center shadow-xl backdrop-blur-sm">
          <p className="font-serif text-2xl font-bold text-primary mb-2">Inscrições Encerradas</p>
          <p className="text-sm text-text/75 mb-6">As inscrições para este curso estão encerradas ou temporariamente indisponíveis.</p>
          <Link
            href={`/curso/${course.slug || course.id}`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-xs font-bold uppercase tracking-widest text-white hover:bg-primary-dark transition-colors"
          >
            Ver detalhes do curso
          </Link>
        </div>
      </PageShell>
    );
  }

  // Serialize for Client Component
  const pixOrder = uid ? await findPixOrder(uid, courseId) : null;
  const initialData = {
    pixOrder,
    course: JSON.parse(JSON.stringify(course)),
    enrollment: enrollmentData
      ? JSON.parse(JSON.stringify(enrollmentData))
      : null,
    application: applicationData
      ? JSON.parse(JSON.stringify(applicationData))
      : null,
    userProfile: userProfileData
      ? JSON.parse(JSON.stringify(userProfileData))
      : null,
    uid,
  };

  const courseCover =
    course.coverImage || course.coverImageUrl || course.imageUrl || null;

  return (
    <PageShell variant="auth" className="min-h-screen px-4 pb-16">
      {/* Top Navigation padronizada com a página de login */}
      <nav className="mx-auto max-w-6xl pt-4 pb-2" aria-label="Voltar">
        <Link
          href={`/curso/${course.slug || course.id}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-paper/95 px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-areia focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ArrowRight className="rotate-180" size={16} /> Voltar ao Curso
        </Link>
      </nav>

      <div className="mx-auto grid w-full max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_480px] xl:grid-cols-[minmax(0,1fr)_520px] lg:gap-14 py-4">
        {/* Lado Esquerdo: Card com informações completas do curso separado por seções */}
        <aside className="min-w-0">
          <div className="overflow-hidden rounded-[24px] border border-border/80 bg-paper/95 shadow-[0_16px_50px_-24px_rgba(38,58,58,0.25)] backdrop-blur-sm">
            {/* Seção 1: Capa do Curso */}
            {courseCover ? (
              <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border/60 bg-areia/30">
                <img
                  src={courseCover}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <span className="rounded-full bg-primary/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
                    {course.category || "Turma Aberta"}
                  </span>
                  {course.modality && (
                    <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium backdrop-blur-xs">
                      {course.modality}
                    </span>
                  )}
                </div>
              </div>
            ) : null}

            <div className="p-6 sm:p-7 md:p-8 space-y-6">
              {/* Seção 2: Apresentação do Curso */}
              <section className="border-b border-border/60 pb-6">
                <span className="fv-eyebrow mb-2 block">
                  Inscrição • Instituto Figura Viva
                </span>
                <h1 className="font-serif text-2xl font-semibold leading-tight text-primary sm:text-3xl">
                  {course.title}
                </h1>
                {course.subtitle && (
                  <p className="mt-2 font-serif text-base italic text-text/80">
                    {course.subtitle}
                  </p>
                )}
                {(course.description || course.details?.intro) && (
                  <p className="mt-4 text-xs sm:text-sm leading-relaxed text-text/80">
                    {course.description || course.details?.intro}
                  </p>
                )}
              </section>

              {/* Seção 3: Valores & Condições de Pagamento */}
              <section className="border-b border-border/60 pb-6 space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Valores & Condições de Pagamento
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.totalPriceCents != null && (
                    <div className="rounded-xl border border-border/60 bg-areia/35 p-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-text/70 mb-1">
                        Valor Integral
                      </p>
                      <p className="font-serif text-xl font-bold text-primary">
                        {(course.totalPriceCents / 100).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                  )}
                  {course.pixPriceCents && (
                    <div className="rounded-xl border border-terra/30 bg-terra/5 p-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-terra mb-1">
                        Matrícula / 1ª Parcela (PIX)
                      </p>
                      <p className="font-serif text-xl font-bold text-terra">
                        {(course.pixPriceCents / 100).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                  )}
                </div>
                {course.installments > 1 && (
                  <p className="text-xs text-text/70 pt-1">
                    • Parcelamento: <strong>Até {course.installments} parcelas</strong>
                  </p>
                )}
              </section>

              {/* Seção 4: Formato & Cronograma da Turma */}
              <section className={course.details?.agenda ? "border-b border-border/60 pb-6 space-y-3" : "space-y-3"}>
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Formato & Cronograma
                </h2>
                <dl className="grid grid-cols-2 gap-2.5 text-xs">
                  {course.date && (
                    <div className="rounded-lg border border-border/50 bg-areia/20 p-2.5">
                      <dt className="text-text/60">Início</dt>
                      <dd className="font-semibold text-text mt-0.5">{course.date}</dd>
                    </div>
                  )}
                  {course.duration && (
                    <div className="rounded-lg border border-border/50 bg-areia/20 p-2.5">
                      <dt className="text-text/60">Duração</dt>
                      <dd className="font-semibold text-text mt-0.5">{course.duration}</dd>
                    </div>
                  )}
                  {course.modality && (
                    <div className="rounded-lg border border-border/50 bg-areia/20 p-2.5">
                      <dt className="text-text/60">Modalidade</dt>
                      <dd className="font-semibold text-text mt-0.5">{course.modality}</dd>
                    </div>
                  )}
                  {course.workloadMinutes && (
                    <div className="rounded-lg border border-border/50 bg-areia/20 p-2.5">
                      <dt className="text-text/60">Carga Horária</dt>
                      <dd className="font-semibold text-text mt-0.5">{Math.round(course.workloadMinutes / 60)} horas</dd>
                    </div>
                  )}
                </dl>
              </section>

              {/* Seção 5: Agenda dos Encontros */}
              {course.details?.agenda && (
                <section className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Agenda & Encontros
                  </h2>
                  <CourseAgendaSummary value={course.details?.agenda} />
                </section>
              )}
            </div>
          </div>
        </aside>

        {/* Lado Direito: Card Padronizado com o Design de Login */}
        <div className="w-full">
          <EnrollmentStepper courseId={courseId} initialData={initialData} />
        </div>
      </div>
    </PageShell>
  );
}
