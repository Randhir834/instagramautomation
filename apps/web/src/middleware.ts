import { type NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'access_token';

/**
 * Redirects visitors without an auth cookie away from dashboard routes.
 * This is only a UX shortcut: the API verifies the JWT on every request.
 */
export function middleware(req: NextRequest): NextResponse {
  if (req.cookies.has(AUTH_COOKIE)) return NextResponse.next();
  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('next', req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/accounts/:path*',
    '/automations/:path*',
    '/contacts/:path*',
    '/store/:path*',
    '/bookings/:path*',
    '/invoices/:path*',
    '/billing/:path*',
  ],
};
