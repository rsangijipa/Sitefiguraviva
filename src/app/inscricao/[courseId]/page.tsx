import { verifySession } from "@/lib/auth/server";
import EnrollmentStepper from "./EnrollmentStepper";
import PageShell from "@/components/ui/PageShell";
import { getCourseById } from "@/data/courses";
import { findEnrollmentBySupabaseUser } from "@/features/enrollments/infrastructure/supabaseEnrollmentRepository.server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

export default async function EnrollmentPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await verifySession();
  const uid = session?.isActive ? session.uid : null;

  // 1. Fetch Course Data
  const courseData = await getCourseById(courseId);
  if (!courseData) {
    return (
      <div className="p-10 text-center text-error">Curso não encontrado.</div>
    );
  }
  const course = courseData as any;

  // Check availability (new: status==open; legacy: isPublished==true)
  const isAvailable = course.status === "open" || course.isPublished === true;
  if (!isAvailable) {
    return (
      <div className="p-10 text-center text-text/75">
        Inscrições encerradas ou curso não disponível.
      </div>
    );
  }

  // 2. Fetch Enrollment (Root) & Application in parallel if user logged in
  let enrollmentData = null;
  let applicationData = null;

  if (uid) {
    const enrollmentId = `${uid}_${courseId}`;
    const supabase = createSupabaseServiceClient();
    const [enrollment, application] = await Promise.all([
      findEnrollmentBySupabaseUser(uid, courseId),
      supabase
        .from("applications")
        .select("*")
        .eq("id", enrollmentId)
        .maybeSingle(),
    ]);

    enrollmentData = enrollment;
    if (application.error) throw application.error;
    applicationData = application.data;
  }

  // Serialize for Client Component
  const initialData = {
    course: JSON.parse(JSON.stringify(course)),
    enrollment: enrollmentData
      ? JSON.parse(JSON.stringify(enrollmentData))
      : null,
    application: applicationData
      ? JSON.parse(JSON.stringify(applicationData))
      : null,
    uid,
  };
  return (
    <PageShell variant="default" className="px-4 py-12">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <aside className="order-2 lg:order-1 lg:sticky lg:top-32">
          <span className="fv-eyebrow mb-4">Inscrição</span>
          <h2 className="font-serif text-3xl font-semibold leading-tight text-primary">
            {course.title}
          </h2>
          {course.subtitle && (
            <p className="mt-2 font-serif text-lg italic text-text/75">
              {course.subtitle}
            </p>
          )}
          {(course.description || course.details?.intro) && (
            <p className="fv-lead mt-6">
              {course.description || course.details?.intro}
            </p>
          )}
          <dl className="mt-8 space-y-4 border-t border-border pt-8 text-sm">
            {course.date && (
              <div className="flex justify-between gap-6">
                <dt className="font-bold uppercase tracking-wider text-terra">
                  Início
                </dt>
                <dd className="text-right text-text/80">{course.date}</dd>
              </div>
            )}
            {course.duration && (
              <div className="flex justify-between gap-6">
                <dt className="font-bold uppercase tracking-wider text-terra">
                  Duração
                </dt>
                <dd className="text-right text-text/80">{course.duration}</dd>
              </div>
            )}
            {course.modality && (
              <div className="flex justify-between gap-6">
                <dt className="font-bold uppercase tracking-wider text-terra">
                  Modalidade
                </dt>
                <dd className="text-right text-text/80">{course.modality}</dd>
              </div>
            )}
          </dl>
        </aside>

        <div className="order-1 lg:order-2">
          <EnrollmentStepper courseId={courseId} initialData={initialData} />
        </div>
      </div>
    </PageShell>
  );
}
