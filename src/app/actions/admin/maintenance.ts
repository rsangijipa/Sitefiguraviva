"use server";

import { migrateEnrollmentIds } from "@/scripts/migrate-enrollments";
import { backfillUserProfiles } from "@/scripts/backfill-users";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) throw new Error("Unauthenticated");
  const token = await adminAuth.verifySessionCookie(sessionCookie, true);
  if (!token.admin && token.role !== "admin") throw new Error("Forbidden");
  return token;
}

export async function runEnrollmentMigration() {
  await assertAdmin();

  try {
    const result = await migrateEnrollmentIds();
    revalidatePath("/admin");
    return { success: true, ...result };
  } catch (error: any) {
    console.error("Migration error:", error);
    return { success: false, error: error.message };
  }
}

export async function runUserBackfill(dryRun: boolean = true) {
  await assertAdmin();

  try {
    const result = await backfillUserProfiles({ dryRun });
    revalidatePath("/admin/users");
    return { success: true, ...result };
  } catch (error: any) {
    console.error("User backfill error:", error);
    return { success: false, error: error.message };
  }
}
