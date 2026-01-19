import { type NextRequest, NextResponse } from "next/server";

// Middleware removed as it was only for Supabase Auth. 
// Firebase Auth handling is done client-side or via specific server routes if needed.
// For now, we pass through.
export async function middleware(request: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder assets
         */
        "/((?!api|_next/static|_next/image|assets|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
