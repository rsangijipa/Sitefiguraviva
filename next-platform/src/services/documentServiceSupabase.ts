import { createClient } from '@/utils/supabase/client';

const supabase = createClient();
const TABLE_NAME = 'documents';

export const documentService = {
    /**
     * List all documents
     */
    getAll: async () => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching documents:', error);
            return [];
        }
        return data || [];
    },

    /**
     * Get filtered documents (e.g., by category)
     */
    getByCategory: async (category: string) => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('category', category)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching documents by category:', error);
            return [];
        }
        return data || [];
    },

    /**
     * Create (Upload metadata)
     */
    create: async (doc: { title: string, category: string, file_url: string, file_size?: string, file_type?: string }) => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([doc])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete document
     */
    delete: async (id: string) => {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
