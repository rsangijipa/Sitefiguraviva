import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { PauseRoomEditorClient } from "../components/PauseRoomEditorClient";

const VALID_IDS = [
  "breathing",
  "observing",
  "listening",
  "movement",
  "slowing",
];

export default async function PauseRoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  const id = resolved.id;

  if (!VALID_IDS.includes(id)) {
    notFound();
  }

  // Server-side: fetch practice data via API
  let practice: any = null;
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/admin/pause-practices`,
      {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      },
    );
    if (res.ok) {
      const data = await res.json();
      practice = (data.practices ?? []).find((p: any) => p.id === id);
    }
  } catch {
    // Silently fail — client will load via useEffect
  }

  return <PauseRoomEditorClient practice={practice} practiceId={id} />;
}
