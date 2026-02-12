import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth, db } from "@/lib/firebase/admin";
import Link from "next/link";
import Image from "next/image";
import { FieldPath } from "firebase-admin/firestore";
import { BookOpen, Library } from "lucide-react";
import { cn, deepSafeSerialize } from "@/lib/utils";
import { Timestamp } from "firebase-admin/firestore";
import { EmptyState } from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

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
  const progress = enrollment?.progressSummary?.percent || 0;
  const lastAccess = enrollment?.lastAccessedAt
    ?.toDate?.()
    .toLocaleDateString();

  const detailsHref = isCatalog
    ? `/curso/${course.slug || course.id}`
    : isPendingApproval
      ? `/inscricao/${course.id}`
      : `/portal/course/${course.id}`;

  const getStatusChip = () => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">
            Ativo
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full">
            Concluído
          </span>
        );
      case "canceled":
        return (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-full">
            Cancelado
          </span>
        );
      case "refunded":
        return (
          <span className="px-2 py-0.5 bg-stone-200 text-stone-700 text-[10px] font-bold uppercase rounded-full">
            Reembolsado
          </span>
        );
      case "pending_approval":
        return (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-full">
            Em análise
          </span>
        );
      case "catalog":
        return (
          <span className="px-2 py-0.5 bg-stone-200 text-stone-700 text-[10px] font-bold uppercase rounded-full">
            Disponível
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-bold uppercase rounded-full">
            Aguardando
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full">
      {/* Cover Image */}
      <div className="h-40 bg-stone-200 relative overflow-hidden">
        {course.image ? (
          <Image
            src={course.image}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
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
              <span className="text-[10px] text-stone-400">
                Último acesso: {lastAccess || "Nunca"}
              </span>
            </div>

            <Link
              href={`/portal/course/${course.id}`}
              className="block w-full py-2 bg-primary text-white text-center text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-stone-800 transition-colors mt-2"
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
                Pagamento confirmado. Sua matrícula aguarda validação da equipe.
              </p>
            ) : (
              <p className="text-xs text-stone-500 italic">
                Acesso restrito ou pendente.
              </p>
            )}

            <Link
              href={detailsHref}
              className={cn(
                "block w-full py-2 border text-center text-xs font-bold uppercase tracking-widest rounded-lg transition-colors mt-3",
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
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) redirect("/auth");

  let uid;
  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    uid = decodedClaims.uid;
  } catch (error) {
    redirect("/auth");
  }

  // 1. Fetch User Enrollments
  const enrollmentsSnap = await db
    .collection("enrollments")
    .where("uid", "==", uid)
    .get();
  const enrollments = enrollmentsSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // 2. Resolve Enrolled Courses
  let enrolledCourses: any[] = [];
  let enrolledCourseIds = new Set<string>();

  if (enrollments.length > 0) {
    const courseIds = enrollments.map((e: any) => e.courseId);
    enrolledCourseIds = new Set(courseIds);

    // Batch fetch (simplified for MVP)
    // Split into chunks of 10
    const chunks = [];
    for (let i = 0; i < courseIds.length; i += 10) {
      chunks.push(courseIds.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      if (chunk.length > 0) {
        const snap = await db
          .collection("courses")
          .where(FieldPath.documentId(), "in", chunk)
          .get();
        const chunkCourses = snap.docs
          .map((doc) => {
            const enrollment = enrollments.find(
              (e: any) => e.courseId === doc.id,
            );
            return { id: doc.id, ...doc.data(), enrollment };
          })
          .filter((c: any) => c.isPublished !== false); // Filter out unpublished courses from "My Courses"
        enrolledCourses.push(...chunkCourses);
      }
    }
  }

  // Ensure serialization
  enrolledCourses = deepSafeSerialize(enrolledCourses);
  const activeEnrolledCourses = enrolledCourses.filter((course: any) =>
    ["active", "completed"].includes(course?.enrollment?.status),
  );
  const pendingEnrolledCourses = enrolledCourses.filter(
    (course: any) =>
      !["active", "completed"].includes(course?.enrollment?.status),
  );

  // 3. Fetch Catalog (Published & Open, limit 10 for MVP)
  // Exclude enrolled? Ideally yes, but Firestore "not-in" has limits.
  // We will fetch widely and filter in memory for this page since catalog size is likely small (<100) for now.
  const catalogSnap = await db
    .collection("courses")
    .where("status", "==", "open")
    .limit(20)
    .get();

  const catalogCourses = deepSafeSerialize(
    (catalogSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[])
      .filter((c) => c.isPublished !== false) // Filter in memory for isPublished !== false
      .filter((c) => !enrolledCourseIds.has(c.id)),
  );

  return (
    <div className="space-y-12 pb-12">
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
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
              Matrículas ativas
            </p>
            <p className="text-2xl font-bold text-stone-800 mt-1">
              {activeEnrolledCourses.length}
            </p>
          </div>
          <div className="bg-white border border-stone-100 rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
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
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
              Catálogo aberto
            </p>
            <p className="text-2xl font-bold text-stone-800 mt-1">
              {catalogCourses.length}
            </p>
          </div>
        </div>

        {activeEnrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeEnrolledCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                enrollment={course.enrollment}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen size={32} />}
            title="Sua Prateleira está Vazia"
            description="Você ainda não se matriculou em nenhuma formação. Descubra novos caminhos no nosso catálogo."
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <Library className="text-stone-400" />
            <div>
              <h2 className="font-serif text-2xl text-stone-800">
                Catálogo Disponível
              </h2>
              <p className="text-stone-500 text-sm">
                Novos conhecimentos esperando por você.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {catalogCourses.map((course) => (
              <CourseCard key={course.id} course={course} isCatalog={true} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
