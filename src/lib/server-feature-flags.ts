import "server-only";

function isEnabled(value: string | undefined): boolean {
  return value === "true" || value === "1" || value === "yes";
}

export const SERVER_FEATURES = {
  supabaseAdminCourses: isEnabled(process.env.FEATURE_SUPABASE_ADMIN_COURSES),
} as const;
