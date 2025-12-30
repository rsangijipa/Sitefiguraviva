import { createClient } from "@/utils/supabase/server";

const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE;
  return { url, key, isConfigured: !!url && !!key };
};

export async function getCourses() {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    console.error('❌ Supabase is NOT configured in getCourses');
    return [];
  }

  try {
    const supabase = await createClient();
    console.log(`🌐 Fetching courses from: ${config.url?.substring(0, 20)}...`);

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching courses:', error.message, error.details);
      return [];
    }

    console.log(`✅ Fetched ${data?.length || 0} courses`);
    return data || [];
  } catch (err) {
    console.error('💥 Crash in getCourses:', err);
    return [];
  }
}

export async function getBlogPosts() {
  const config = getSupabaseConfig();
  if (!config.isConfigured) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ Error fetching blog posts:', error.message, error.details);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('💥 Crash in getBlogPosts:', err);
    return [];
  }
}

export async function getGallery() {
  const config = getSupabaseConfig();
  if (!config.isConfigured) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching gallery:', error.message, error.details);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('💥 Crash in getGallery:', err);
    return [];
  }
}
