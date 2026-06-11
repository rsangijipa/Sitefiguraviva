import { redirect } from "next/navigation";

export default async function CreateCoursePage() {
  redirect("/admin/courses?action=create");
}
