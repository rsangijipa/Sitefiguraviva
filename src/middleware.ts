import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname, search, searchParams } = request.nextUrl;

    // 1. Redirect Legacy Routes to /auth
    if (pathname.startsWith('/login') || pathname.startsWith('/auth/login')) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth';
        return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/signup') || pathname.startsWith('/auth/signup')) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth';
        url.searchParams.set('mode', 'signup');
        return NextResponse.redirect(url);
    }

    // 2. Anti Open-Redirect Guardrail for 'next' param
    if (searchParams.has('next')) {
        const next = searchParams.get('next');
        // Validate: Must start with "/" and NOT start with "//" (protocol relative)
        if (next && (!next.startsWith('/') || next.startsWith('//'))) {
            const url = request.nextUrl.clone();
            url.searchParams.delete('next'); // Remove unsafe redirect
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - assets (public folder assets)
         * - favicon.ico (favicon file)
         * - extension files (png, jpg, etc)
         */
        "/((?!api|_next/static|_next/image|assets|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
