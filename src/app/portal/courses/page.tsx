import { CourseCollection } from "@/components/portal/CourseCollection";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { requireSession } from "@/lib/auth/server";
import { listUserEnrollments } from "@/features/enrollments/infrastructure/supabaseEnrollmentRepository.server";
import { listAdminCourses } from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";

// --- Reusable Course Card (Inline for now, extract later) ---
const CourseCard = ({
  course,
  enrollment,
  isCatalog = false,
}: {
  course: any;
  enrollment?: any;
  isCatalog?: boolean;
}) => {
  const status =
    enrollment?.status || (isCatalog ? "catalog" : "pending_approval");
  const isActive = status === "active" || status === "completed";
  const isPendingApproval = status === "pending_approval";
  const progress = Math.max(0, Math.min(100, Number(enrollment?.progressSummary?.percent) || 0));
  const lastAccessValue =
    enrollment?.lastAccessAt ?? enrollment?.lastAccessedAt;
  const lastAccess = lastAccessValue
    ? new Date(String(lastAccessValue)).toLocaleDateString()
    : undefined;

  const detailsHref = isCatalog
    ? `/curso/${course.slug || course.id}`
    : isPendingApproval
      ? `/inscricao/${course.id}`
      : `/portal/course/${course.id}`;

  const getStatusChip = () => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full">
            Ativo
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-full">
            Concluído
          </span>
        );
      case "canceled":
        return (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold uppercase rounded-full">
            Cancelado
          </span>
        );
      case "refunded":
        return (
          <span className="px-2 py-0.5 bg-stone-200 text-stone-700 text-xs font-bold uppercase rounded-full">
            Reembolsado
          </span>
        );
      case "pending_approval":
        return (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold uppercase rounded-full">
            Em análise
          </span>
        );
      case "catalog":
        return (
          <span className="px-2 py-0.5 bg-stone-200 text-stone-700 text-xs font-bold uppercase rounded-full">
            Disponível
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs font-bold uppercase rounded-full">
            Aguardando
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col h-full">
      {/* Cover Image */}
      <div className="aspect-[16/10] bg-emerald-50 relative overflow-hidden">
        {course.image ? (
          <Image
            src={course.image}
            alt={course.title}
            fill
            className="object-contain p-2"
            sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-500">
            <BookOpen size={32} />
          </div>
        )}
        <div className="absolute top-3 left-3">{getStatusChip()}</div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-stone-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        {isActive ? (
          <div className="mt-auto space-y-3">
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-stone-500">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-50">
              <span className="text-xs text-stone-500">
                Último acesso: {lastAccess || "Nunca"}
              </span>
            </div>

            <Link
              href={`/portal/course/${course.id}`}
              className="flex min-h-12 items-center justify-center w-full py-2 bg-primary text-white text-center text-sm font-semibold rounded-lg hover:bg-stone-800 transition-colors mt-2"
            >
              Continuar
            </Link>
          </div>
        ) : (
          <div className="mt-auto pt-4">
            {isCatalog ? (
              <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                {course.description || "Domine novas habilidades."}
              </p>
            ) : isPendingApproval ? (
              <p className="text-xs text-amber-700">
                Sua inscrição está em análise. A equipe verificará o pagamento e os dados da matrícula.
              </p>
            ) : (
              <p className="text-xs text-stone-500 italic">
                Seu acesso ainda não está liberado. Verifique o status da
                matrícula ou fale com o suporte.
              </p>
            )}

            <Link
              href={detailsHref}
              className={cn(
                "flex min-h-12 items-center justify-center w-full py-2 border text-center text-sm font-semibold rounded-lg transition-colors mt-3",
                isCatalog
                  ? "border-primary text-primary hover:bg-primary hover:text-white"
                  : isPendingApproval
                    ? "border-amber-300 text-amber-800 hover:bg-amber-50"
                    : "border-stone-200 text-stone-500 hover:bg-stone-50",
              )}
            >
              {isCatalog
                ? "Saiba Mais"
                : isPendingApproval
                  ? "Acompanhar Inscrição"
                  : "Ver Detalhes"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default async function MyCoursesPage() {
  const session = await requireSession("/auth");
  const uid = session.uid;

  // 1. Fetch User Enrollments
  const [enrollments, courses] = await Promise.all([listUserEnrollments(uid), listAdminCourses()]);

  // 2. Resolve Enrolled Courses
  let enrolledCourses: any[] = [];
  let enrolledCourseIds = new Set<string>();

  if (enrollments.length > 0) {
    const courseIds = enrollments.map((e) => e.courseId);
    enrolledCourseIds = new Set(courseIds);
    enrolledCourses = courses
      .filter(
        (course) =>
          course.isPublished !== false && enrolledCourseIds.has(course.id),
      )
      .map((course) => ({
        ...course,
        enrollment: enrollments.find(
          (enrollment) => enrollment.courseId === course.id,
        ),
      }));
  }
  const activeEnrolledCourses = enrolledCourses.filter((course: any) =>
    ["active", "completed"].includes(course?.enrollment?.status),
  );
  const pendingEnrolledCourses = enrolledCourses.filter(
    (course: any) =>
      !["active", "completed"].includes(course?.enrollment?.status),
  );

  // Reuse the same course snapshot for enrollments and the open catalog.
  const catalogCourses = courses
    .filter(
      (course) => course.status === "open" && course.isPublished !== false,
    )
    .filter((course) => !enrolledCourseIds.has(course.id));

  return (
    <div className="portal-courses space-y-10 pb-8">
      {/* Section: My Enrollments */}
      <section className="space-y-6">
        <header className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h1 className="font-serif text-3xl text-stone-800 flex items-center gap-3">
              <BookOpen className="text-primary" />
              Meus Cursos
            </h1>
            <p className="text-stone-500 mt-1">Continue de onde parou.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white border border-stone-100 rounded-xl px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-stone-500 font-bold">
              Cursos liberados
            </p>
            <p className="text-2xl font-bold text-stone-800 mt-1">
              {activeEnrolledCourses.length}
            </p>
          </div>
          <div className="bg-white border border-stone-100 rounded-xl px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-stone-500 font-bold">
              Em análise
            </p>
            <p className="text-2xl font-bold text-amber-700 mt-1">
              {
                pendingEnrolledCourses.filter(
                  (course: any) =>
                    course?.enrollment?.status === "pending_approval",
                ).length
              }
            </p>
          </div>
          <div className="bg-white border border-stone-100 rounded-xl px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-stone-500 font-bold">
              Catálogo aberto
            </p>
            <p className="text-2xl font-bold text-stone-800 mt-1">
              {catalogCourses.length}
            </p>
          </div>
        </div>

        {activeEnrolledCourses.length > 0 ? (
          <CourseCollection items={activeEnrolledCourses.map(course => ({
            id: course.id,
            title: course.title,
            completed: course.enrollment?.status === "completed",
            lastAccess: String(course.enrollment?.lastAccessAt ?? course.enrollment?.lastAccessedAt ?? ""),
            card: <CourseCard key={course.id} course={course} enrollment={course.enrollment} />,
          }))} />
        ) : (
          <EmptyState
            icon={<BookOpen size={40} strokeWidth={1.5} />}
            title="Sua Prateleira está Vazia"
            description="Nenhum curso com acesso liberado no momento. Confira suas inscrições em andamento ou explore o catálogo."
            action={
              <Link href="/portal/courses#catalog">
                <Button variant="primary">Ver Catálogo</Button>
              </Link>
            }
            className="py-16"
          />
        )}

        {pendingEnrolledCourses.length > 0 && (
          <div className="space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="font-serif text-2xl text-stone-800">
                Matrículas em andamento
              </h2>
              <p className="text-sm text-stone-500">
                Acompanhe aprovações e atualizações de acesso.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {pendingEnrolledCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrollment={course.enrollment}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section: Catalog */}
      {catalogCourses.length > 0 && (
        <section id="catalog" className="space-y-6">
          <header className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <Library className="text-stone-500" />
            <div>
              <h2 className="font-serif text-2xl text-stone-800">
                Catálogo Disponível
              </h2>
              <p className="text-stone-500 text-sm">
                Novos conhecimentos esperando por você.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {catalogCourses.map((course) => (
              <CourseCard key={course.id} course={course} isCatalog={true} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
