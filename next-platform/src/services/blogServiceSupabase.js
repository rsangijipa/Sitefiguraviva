import { createClient } from '@/utils/supabase/client';

const supabase = createClient();
const TABLE_NAME = 'posts';

const generateSlug = (title) => {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
};

export const blogService = {
    getAll: async () => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error("Error fetching posts:", error);
            throw error;
        }
        return data || [];
    },
    getBySlug: async (slug) => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error("Error fetching post by slug:", error);
            return null;
        }
        return data;
    },
    getById: async (id) => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Error fetching post by id:", error);
            return null;
        }
        return data;
    },
    create: async (postData) => {
        const slug = generateSlug(postData.title);
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([{ ...postData, slug }])
            .select()
            .single();

        if (error) {
            console.error("Error creating post:", error);
            throw error;
        }
        return data;
    },
    update: async (id, postData) => {
        const updates = { ...postData };
        if (updates.title) {
            updates.slug = generateSlug(updates.title);
        }
        
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error("Error updating post:", error);
            throw error;
        }
        return data;
    },
    delete: async (id) => {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
        return true;
    }
};
