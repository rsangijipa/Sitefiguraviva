import { createClient } from '@/utils/supabase/client';

const supabase = createClient();
const TABLE_NAME = 'gallery';

export const galleryService = {
    getAll: async () => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching gallery:", error);
            throw error;
        }
        return data || [];
    },
    create: async (item) => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([item])
            .select()
            .single();

        if (error) throw error;
        return data;
    },
    update: async (id, item) => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(item)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
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
