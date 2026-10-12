import { redirect } from "next/navigation";

export default function EnrollmentsPage() {
  redirect("/admin/users?tab=enrollments");
}
