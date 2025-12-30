import { createClient } from "@/utils/supabase/server";

const isConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && (!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

export async function getCourses() {
  if (!isConfigured) {
    console.warn('Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
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
  if (!isConfigured) return [];
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
  if (!isConfigured) return [];
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
