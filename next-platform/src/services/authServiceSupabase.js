import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const ALLOWED_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim())
    .filter(Boolean);

export const authService = {
    async login(email, password) {
        if (!ALLOWED_EMAILS.includes(email)) {
            throw new Error('Acesso restrito: Este email não tem permissão administrativa.');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Supabase Login Error:", error);
            throw new Error(error.message);
        }

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
