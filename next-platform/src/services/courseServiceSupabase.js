import { createClient } from '@/utils/supabase/client';

const supabase = createClient();
const TABLE_NAME = 'courses';

export const courseService = {
    getAll: async () => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching courses:", error);
            throw error;
        }
        return data || [];
    },
    getById: async (id) => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Error fetching course by ID:", error);
            return null;
        }
        return data;
    },
    create: async (data) => {
        const { data: inserted, error } = await supabase
            .from(TABLE_NAME)
            .insert([data])
            .select()
            .single();

        if (error) throw error;
        return inserted;
    },
    update: async (id, data) => {
        const { data: updated, error } = await supabase
            .from(TABLE_NAME)
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return updated;
    },
    delete: async (id) => {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
