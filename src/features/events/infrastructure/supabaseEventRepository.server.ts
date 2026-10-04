import { randomUUID } from "crypto";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import type { TableRow } from "@/infrastructure/supabase/database.types";

type EventRow = TableRow<"events">;
type AttendanceRow = TableRow<"event_attendance">;

export interface EventRecord {
  id: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string | null;
  status: "scheduled" | "live" | "ended" | "cancelled";
  isPublic: boolean;
  courseId?: string | null;
  type: "webinar" | "in_person" | "hybrid";
  joinUrl?: string | null;
  location?: string | null;
  coverImage?: string | null;
  checkInCode?: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapEventRow(row: EventRow): EventRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    startsAt: row.starts_at,
    endsAt: row.ends_at || null,
    status: row.status,
    isPublic: row.is_public,
    courseId: row.course_id || null,
    type: row.type,
    joinUrl: row.join_url || null,
    location: row.location || null,
    coverImage: row.cover_image || null,
    checkInCode: row.check_in_code || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function nowIso() {
  return new Date().toISOString();
}

async function listEvents(
  filter: Partial<Pick<EventRow, "course_id">> & { publicOnly?: boolean },
  limitCount?: number,
  supabase = createSupabaseBrowserClient(),
): Promise<EventRecord[]> {
  let query = supabase.from("events").select("*");

  if (filter.course_id) {
    query = query.eq("course_id", filter.course_id);
  }

  if (filter.publicOnly) {
    query = query.eq("is_public", true);
  }

  const { data, error } = await query
    .in("status", ["scheduled", "live"])
    .gte("starts_at", nowIso())
    .order("starts_at", { ascending: true })
    .limit(limitCount ?? 20);

  if (error) throw error;
  return (data ?? []).map(mapEventRow);
}

export async function listUpcomingEvents(
  limitCount = 3,
  supabase = createSupabaseBrowserClient(),
): Promise<EventRecord[]> {
  return listEvents({ publicOnly: true }, limitCount, supabase);
}

export async function listCourseEvents(
  courseId: string,
  limitCount = 20,
  supabase = createSupabaseBrowserClient(),
): Promise<EventRecord[]> {
  return listEvents({ course_id: courseId }, limitCount, supabase);
}

export async function createEvent(
  input: {
    title: string;
    description?: string;
    startsAt: string;
    endsAt?: string | null;
    status?: "scheduled" | "live" | "ended" | "cancelled";
    isPublic?: boolean;
    courseId?: string | null;
    type?: "webinar" | "in_person" | "hybrid";
    joinUrl?: string | null;
    location?: string | null;
    coverImage?: string | null;
    checkInCode?: string | null;
  },
  supabase = createSupabaseBrowserClient(),
): Promise<string> {
  const id = randomUUID();
  const { error } = await supabase.from("events").insert({
    id,
    title: input.title,
    description: input.description || null,
    starts_at: input.startsAt,
    ends_at: input.endsAt || null,
    status: input.status || "scheduled",
    is_public: input.isPublic ?? false,
    course_id: input.courseId || null,
    type: input.type || "webinar",
    join_url: input.joinUrl || null,
    location: input.location || null,
    cover_image: input.coverImage || null,
    check_in_code: input.checkInCode || null,
  });

  if (error) throw error;
  return id;
}

export async function checkInEvent(
  checkInCode: string,
  userId: string,
  supabase = createSupabaseBrowserClient(),
): Promise<
  | {
      success: true;
      message: string;
      alreadyRegistered?: boolean;
      eventTitle?: string;
    }
  | { success: false; message: string }
> {
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("check_in_code", checkInCode)
    .in("status", ["live", "scheduled"])
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!event) {
    return { success: false, message: "Código inválido ou evento expirado." };
  }

  const eventRow = event as EventRow;
  const attendanceQuery = await supabase
    .from("event_attendance")
    .select("*")
    .eq("event_id", eventRow.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (attendanceQuery.error) throw attendanceQuery.error;
  if (attendanceQuery.data) {
    return {
      success: true,
      message: "Presença já confirmada anteriormente.",
      alreadyRegistered: true,
      eventTitle: eventRow.title,
    };
  }

  const attendance: Partial<AttendanceRow> = {
    id: randomUUID(),
    event_id: eventRow.id,
    user_id: userId,
    method: "qr_code",
    timestamp: nowIso(),
  };

  const { error: insertError } = await supabase
    .from("event_attendance")
    .insert(attendance as any);

  if (insertError) throw insertError;

  return {
    success: true,
    message: "Presença confirmada com sucesso!",
    eventTitle: eventRow.title,
  };
}
