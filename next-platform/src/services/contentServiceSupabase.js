import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export const contentService = {
    // SITE CONTENT (Founder, Institute, etc.)
    async getContent(key) {
        const { data, error } = await supabase
            .from('site_content')
            .select('content')
            .eq('key', key)
            .single();

        if (error) {
            console.error(`Error fetching content for ${key}:`, error);
            return null;
        }
        return data?.content || null;
    },

    async updateContent(key, newContent) {
        const { data, error } = await supabase
            .from('site_content')
            .upsert({ key, content: newContent })
            .select()
            .single();

        if (error) {
            console.error(`Error checking content for ${key}:`, error);
            throw error;
        }
        return data?.content;
    },

    // TEAM MEMBERS
    async getTeamMembers() {
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error("Error fetching team:", error);
            return [];
        }
        return data || [];
    },

    async addTeamMember(member) {
        const { data, error } = await supabase
            .from('team_members')
            .insert(member)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateTeamMember(id, updates) {
        const { data, error } = await supabase
            .from('team_members')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteTeamMember(id) {
        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
