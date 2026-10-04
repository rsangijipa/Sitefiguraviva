"use server";

import { migrateEnrollmentIds } from "@/scripts/migrate-enrollments";
import { backfillUserProfiles } from "@/scripts/backfill-users";
import { revalidatePath } from "next/cache";
import { requireAdmin as assertAdmin } from "@/lib/auth/server";

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
