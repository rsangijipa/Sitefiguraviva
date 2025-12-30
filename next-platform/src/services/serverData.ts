import { createClient } from "@/utils/supabase/server";

export async function getCourses() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching courses:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('💥 Crash in getCourses:', err);
    return [];
  }
}

export async function getBlogPosts() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ Error fetching blog posts:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('💥 Crash in getBlogPosts:', err);
    return [];
  }
}

export async function getGallery() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching gallery:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('💥 Crash in getGallery:', err);
    return [];
  }
}
