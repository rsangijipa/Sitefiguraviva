import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseKey)) {
    console.warn('⚠️ Supabase environment variables are missing on the client. Database calls will fail.');
}


export const createClient = () =>
    createBrowserClient(
        supabaseUrl!,
        supabaseKey!,
    );
