import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ CRITICAL: Supabase environment variables are missing in Middleware!');
    }
}

export const updateSession = async (request: NextRequest) => {
    // Create an unmodified response
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    if (!supabaseUrl || !supabaseKey) {
        // Silent fail in middleware if env is missing to avoid crashing the whole site
        return supabaseResponse;
    }

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            },
        );

        // This is necessary to refresh the session
        const { data: { user }, error } = await supabase.auth.getUser();

        // Protected Routes Logic
        const path = request.nextUrl.pathname;
        if (path.startsWith('/admin') && path !== '/admin/login') {
            if (error || !user) {
                const url = request.nextUrl.clone();
                url.pathname = '/admin/login';
                return NextResponse.redirect(url);
            }
        }

        return supabaseResponse;
    } catch (e) {
        console.error("Middleware Supabase Error:", e);
        return supabaseResponse;
    }
};
