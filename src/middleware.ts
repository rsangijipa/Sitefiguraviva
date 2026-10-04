import { type NextRequest, NextResponse } from "next/server";
import { protectedContentSecurityPolicy } from "@/lib/security-policy";

export async function middleware(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;

  // 1. Redirect Legacy Routes to /auth
  if (pathname.startsWith("/login") || pathname.startsWith("/auth/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/signup") || pathname.startsWith("/auth/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("mode", "signup");
    return NextResponse.redirect(url);
  }

  // 2. Anti Open-Redirect Guardrail for 'next' param
  if (searchParams.has("next")) {
    const next = searchParams.get("next");
    // Validate: Must start with "/" and NOT start with "//" (protocol relative)
    if (next && (!next.startsWith("/") || next.startsWith("//"))) {
      const url = request.nextUrl.clone();
      url.searchParams.delete("next"); // Remove unsafe redirect
      return NextResponse.redirect(url);
    }
  }

  // 3. Multi-tenant Context Extraction (v3)
  const tenantId = "viva";

  // Inject tenantId header for downstream services
  const protectedPage =
    /^(?:\/auth(?:\/|$)|\/admin(?:\/|$)|\/portal(?:\/|$)|\/inscricao(?:\/|$))/.test(
      pathname,
    );
  const nonce = btoa(crypto.randomUUID());
  const policy = protectedPage
    ? protectedContentSecurityPolicy(
        nonce,
        process.env.NODE_ENV !== "production",
      )
    : null;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-nonce");
  if (policy) {
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", policy);
  }
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (policy) response.headers.set("Content-Security-Policy", policy);
  response.headers.set("x-tenant-id", tenantId);

  // 4. Protected Routes Guard (Edge filtering)
  if (pathname.startsWith("/portal") || pathname.startsWith("/admin")) {
    const session = request.cookies.get("session")?.value;
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    // Deep session verification happens in layouts and server actions through Supabase.
  }

  return response;
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
