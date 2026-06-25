import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware: if user tries to access /dashboard and has no token cookie, redirect to /login
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;

  // Allow API, static files, and auth routes
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/login') || pathname === '/') {
    return NextResponse.next();
  }

  const cookie = req.cookies.get('token');
  if (!cookie && pathname.startsWith('/dashboard')) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
