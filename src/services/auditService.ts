
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const auditService = {
    log: async (action: string, resource: string, resourceId: string, details?: any) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return; // Only log authenticated actions

            await supabase
                .from('audit_logs')
                .insert([{
                    user_id: user.id,
                    action,
                    resource,
                    resource_id: resourceId,
                    details: details || {}
                }]);
        } catch (error) {
            console.error("Failed to write audit log", error);
            // Non-blocking error
        }
    }
}
