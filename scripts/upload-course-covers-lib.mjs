export async function updateCourseCover({ supabase, courseId, publicUrl }) {
  const { data, error } = await supabase
    .from("courses")
    .update({
      cover_image_url: publicUrl,
      image_url: publicUrl,
      thumbnail_url: publicUrl,
    })
    .eq("id", courseId)
    .select("id");

  if (error) {
    throw error;
  }

  const updatedCount = Array.isArray(data) ? data.length : 0;
  if (updatedCount !== 1) {
    throw new Error(
      `Expected exactly one course row update for course=${courseId}; updated=${updatedCount}.`,
    );
  }
}
