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

const config = getSupabaseConfig();

export async function getCourses() {
  if (!config.isConfigured) {
    console.warn('Supabase is not configured. Check env vars.', config);
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching courses:', error.message, error.details);
    return [];
  }
  return data || [];
}

export async function getBlogPosts() {
  if (!config.isConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error.message, error.details);
    return [];
  }
  return data || [];
}

export async function getGallery() {
  if (!config.isConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching gallery:', error.message, error.details);
    return [];
  }
  return data || [];
}
