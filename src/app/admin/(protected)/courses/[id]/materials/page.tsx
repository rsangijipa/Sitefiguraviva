import { redirect } from "next/navigation";
export default async function CourseMaterialsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/courses/${encodeURIComponent(id)}?tab=materials`);
}
