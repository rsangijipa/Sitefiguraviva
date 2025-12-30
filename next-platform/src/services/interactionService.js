import { createClient } from '@/utils/supabase/client';

const supabase = createClient();
const TABLE_NAME = 'counters';
const DOC_ID = 'feelings_tree';
const FALLBACK_COUNT = 1243;

export const interactionService = {
    // Get current count
    async getTreeCount() {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select('count')
                .eq('id', DOC_ID)
                .single();

            if (error) {
                // If table or row doesn't exist, return fallback silently
                // console.warn("Could not fetch tree count, using fallback", error);
                return FALLBACK_COUNT;
            }

            return data?.count || FALLBACK_COUNT;
        } catch (error) {
            console.error("Error fetching tree count:", error);
            return FALLBACK_COUNT;
        }
    },

    // Increment count
    async incrementTreeCount() {
        try {
            // First try to RPC if a function exists (better for atomic increments)
            // But getting current + 1 is risky for race conditions without RPC.
            // For now, let's just do a fetch-update or similar if we stick to basic CRUD,
            // or assume we might implement an RPC later.
            // Simplest way without RPC:

            const { data: currentData } = await supabase
                .from(TABLE_NAME)
                .select('count')
                .eq('id', DOC_ID)
                .single();

            const currentCount = currentData?.count || FALLBACK_COUNT;

            const { error } = await supabase
                .from(TABLE_NAME)
                .upsert({ id: DOC_ID, count: currentCount + 1 });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error incrementing tree count:", error);
            return false;
        }
    }
};
