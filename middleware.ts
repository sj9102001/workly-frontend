import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper function to check if a route requires authentication
function isProtectedRoute(pathname: string): boolean {
    const protectedPaths = [
        '/dashboard',
        '/organizations',
        '/profile',
    ];

    return protectedPaths.some(path => pathname.startsWith(path));
}

export async function middleware(request: NextRequest) {
    // Get the jwt cookie
    const jwt = request.cookies.get('jwt');
    const { pathname } = request.nextUrl;

    // If no JWT and trying to access protected route, redirect to login
    if (!jwt && isProtectedRoute(pathname)) {
        const redirectUrl = new URL('/', request.url);
        // Store the attempted URL to redirect back after login
        redirectUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // If JWT exists and trying to access login page (/), redirect to organizations
    if (jwt && pathname === '/') {
        return NextResponse.redirect(new URL('/organizations', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/dashboard/:path*',
        '/organizations/:path*',
        '/profile/:path*',
    ],
}; 