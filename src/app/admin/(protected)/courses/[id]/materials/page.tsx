import { MaterialManager } from "@/components/admin/courses/MaterialManager";
import { listAdminMaterials } from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";

export default async function CourseMaterialsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const materials = await listAdminMaterials(id);
  return <MaterialManager courseId={id} initialMaterials={materials} />;
}
