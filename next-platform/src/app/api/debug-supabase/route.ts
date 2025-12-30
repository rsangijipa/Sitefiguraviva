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

        // Real count and list for courses
        const { data: coursesData, error: coursesError, count: coursesTotal } = await supabase
            .from('courses')
            .select('id, title', { count: 'exact' });

        // Real count for gallery
        const { data: galleryData, error: galleryError, count: galleryTotal } = await supabase
            .from('gallery')
            .select('id', { count: 'exact' });

        // Real count for posts
        const { data: postsData, error: postsError, count: postsTotal } = await supabase
            .from('posts')
            .select('id', { count: 'exact' });

        return NextResponse.json({
            env,
            url_preview,
            results: {
                courses: {
                    success: !coursesError,
                    total: coursesTotal,
                    items: coursesData?.map(c => c.title),
                    error: coursesError?.message
                },
                gallery: {
                    success: !galleryError,
                    total: galleryTotal,
                    error: galleryError?.message
                },
                posts: {
                    success: !postsError,
                    total: postsTotal,
                    error: postsError?.message
                }
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
