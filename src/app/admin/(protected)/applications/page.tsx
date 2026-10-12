import { redirect } from "next/navigation";

export default function ApplicationsPage() {
  redirect("/admin/users?tab=applications");
}
