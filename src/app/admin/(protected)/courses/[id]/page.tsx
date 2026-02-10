import { adminDb } from "@/lib/firebase/admin";
import CourseEditorClient from "./CourseEditorClient";
import { deepSafeSerialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCourseEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("===== [SERVER] Loading course editor for ID:", id);

  let course;

  try {
    // Fetch directly using Admin SDK to bypass security rules on server-side
    console.log("[SERVER] Fetching course from Firestore...");
    const docRef = adminDb.collection("courses").doc(id);
    const snap = await docRef.get();

    console.log("[SERVER] Firestore response - exists:", snap.exists);

    if (!snap.exists) {
      console.error("[SERVER] Course NOT FOUND in Firestore:", id);
      return (
        <div className="p-12 text-center text-stone-500">
          Curso não encontrado.
        </div>
      );
    }

    console.log("[SERVER] Course found! Data:", snap.data());
    course = { id: snap.id, ...snap.data() };
  } catch (e: any) {
    console.error("===== [SERVER] Admin Fetch Error:", e);
    console.error("[SERVER] Course ID:", id);
    console.error("[SERVER] Error details:", {
      message: e.message,
      code: e.code,
      stack: e.stack,
    });
    return (
      <div className="p-12 text-center text-red-500">
        <h3 className="font-bold">Erro ao carregar curso</h3>
        <p className="text-sm mt-2">{e.message}</p>
        <p className="text-xs text-stone-400 mt-4">ID do curso: {id}</p>
        <p className="text-xs text-stone-400">
          Verifique os logs do servidor para detalhes.
        </p>
      </div>
    );
  }

  // Convert timestamps to serializable
  const serializedCourse = deepSafeSerialize(course);
  console.log("[SERVER] Course serialized successfully, rendering editor");

  return <CourseEditorClient initialCourse={serializedCourse} />;
}
