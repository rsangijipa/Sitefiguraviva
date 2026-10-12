import { redirect } from "next/navigation";

export default function GamificationPage() {
  redirect("/admin/users?tab=gamification");
}
