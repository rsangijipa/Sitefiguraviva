import "server-only";
import { createSupabaseAnonServerClient } from "@/infrastructure/supabase/server";
import {
  PUBLIC_COURSE_COLUMNS,
  PUBLIC_POST_COLUMNS,
} from "./public-content-columns";
import { mapPublicCourse, mapPublicPost } from "./supabaseContentRepository";

/** A failed request stays undefined so the client retries instead of caching emptiness. */
export async function readHomePreview() {
  try {
    const client = createSupabaseAnonServerClient();
    const [courses, posts] = await Promise.allSettled([
      client
        .from("courses")
        .select(PUBLIC_COURSE_COLUMNS)
        .eq("is_published", true)
        .in("status", ["open", "closed"])
        .order("created_at", { ascending: false })
        .order("id")
        .limit(3),
      client
        .from("posts")
        .select(PUBLIC_POST_COLUMNS)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .order("id")
        .limit(3),
    ]);
    const courseResult =
      courses.status === "fulfilled" && !courses.value.error
        ? (courses.value.data ?? []).map(mapPublicCourse)
        : undefined;
    const postResult =
      posts.status === "fulfilled" && !posts.value.error
        ? (posts.value.data ?? []).map(mapPublicPost)
        : undefined;
    if (!courseResult || !postResult)
      console.error("Home preview temporarily unavailable");
    return { courses: courseResult, posts: postResult, gallery: [] };
  } catch {
    console.error("Home preview temporarily unavailable");
    return { courses: undefined, posts: undefined, gallery: [] };
  }
}
