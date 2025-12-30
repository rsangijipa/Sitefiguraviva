import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const env = {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        publishable_key: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    };

    try {
        const supabase = await createClient();

        // Test basic fetch
        const { data, error } = await supabase.from('posts').select('id').limit(1);

        return NextResponse.json({
            env,
            success: !error,
            error: error ? { message: error.message, details: error.details, code: error.code } : null,
            count: data?.length || 0,
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
