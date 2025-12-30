import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const ALLOWED_EMAILS = [
    'richardsangi@figuraviva.com',
    'liliangusmao@figuraviva.com',
    ...(process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
];

export const authService = {
    async login(email, password) {
        if (!ALLOWED_EMAILS.length) {
            console.warn("⚠️ NEXT_PUBLIC_ADMIN_EMAILS is empty. No one can login!");
        }

        if (!ALLOWED_EMAILS.includes(email)) {
            console.error(`❌ Access denied for email: ${email}`);
            throw new Error('Acesso restrito: Este email não tem permissão administrativa.');
        }

        console.log(`🔐 Attempting login for: ${email}`);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("❌ Supabase Login Error:", error.message);
            throw new Error(error.message);
        }

        console.log("✅ Login successful");
        return data;
    },

    async logout() {
        await supabase.auth.signOut();
    },

    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    onAuthStateChanged(callback) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            callback(session?.user || null);
        });
        return () => subscription.unsubscribe();
    }
};
