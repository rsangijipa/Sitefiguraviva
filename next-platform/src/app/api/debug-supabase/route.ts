import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const env = {
        NEXT_PUBLIC_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        NEXT_PUBLIC_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
        SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE_KEY || !!process.env.SUPABASE_SERVICE_ROLE,
        NODE_ENV: process.env.NODE_ENV
    };

    try {
        const supabase = await createClient();
        const url_preview = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").substring(0, 20) + "...";

        // Test posts fetch
        const { data: postsData, error: postsError } = await supabase.from('posts').select('id').limit(1);

        // Test courses fetch
        const { data: coursesData, error: coursesError } = await supabase.from('courses').select('id').limit(1);

        // Test gallery fetch
        const { data: galleryData, error: galleryError } = await supabase.from('gallery').select('id').limit(1);

        return NextResponse.json({
            env,
            url_preview,
            tables: {
                posts: { success: !postsError, error: postsError?.message, code: postsError?.code, count: postsData?.length || 0 },
                courses: { success: !coursesError, error: coursesError?.message, code: coursesError?.code, count: coursesData?.length || 0 },
                gallery: { success: !galleryError, error: galleryError?.message, code: galleryError?.code, count: galleryData?.length || 0 },
            },
            timestamp: new Date().toISOString()
        });
    } catch (err: any) {
        return NextResponse.json({
            env,
            success: false,
            crash: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
