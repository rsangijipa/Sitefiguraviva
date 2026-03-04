"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";
import { assertIsTutorOrAdmin } from "@/lib/auth/authoring-gate";

import { z } from "zod";

const createCourseSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  subtitle: z.string().optional(),
  instructor: z.string().optional(),
  category: z.string().optional(),
  duration: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
});

export async function createCourseAction(data: any) {
  try {
    await assertIsTutorOrAdmin();
    const validatedData = createCourseSchema.parse(data);
    console.log(
      "===== [SERVER ACTION] Creating course with data:",
      validatedData,
    );

    const docRef = await adminDb.collection("courses").add({
      title: validatedData.title,
      subtitle: validatedData.subtitle || "",
      instructor: validatedData.instructor || "",
      category: validatedData.category || "",
      duration: validatedData.duration || "",
      level: validatedData.level,
      status: "draft",
      isPublished: false,
      coverImage: "",
      image: "",
      description: "",
      contentRevision: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        lessonsCount: 0,
        studentsCount: 0,
      },
    });

    console.log("[SERVER ACTION] Course created successfully! ID:", docRef.id);

    // Revalidate the courses page to show the new course
    revalidatePath("/admin/courses");
    console.log("[SERVER ACTION] Cache revalidated for /admin/courses");

    const response = {
      success: true,
      id: docRef.id,
    };
    console.log("[SERVER ACTION] Returning success:", response);
    return response;
  } catch (error: any) {
    console.error("===== [SERVER ACTION] Error creating course:", error);
    const errorResponse = {
      success: false,
      error: error.message || "Erro ao criar curso",
    };
    console.log("[SERVER ACTION] Returning error:", errorResponse);
    return errorResponse;
  }
}
