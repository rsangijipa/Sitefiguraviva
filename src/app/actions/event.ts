"use server";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { verifySession } from "@/lib/auth/server";
import { checkInEvent as checkInEventRepository } from "@/features/events/infrastructure/supabaseEventRepository.server";

export async function checkInEvent(checkInCode: string) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");
  return checkInEventRepository(
    checkInCode,
    session.uid,
    createSupabaseServiceClient() as any,
  );
}
