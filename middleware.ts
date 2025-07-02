import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If user is authenticated and tries to access auth pages, redirect to dashboard
    if (token && (pathname === "/signin" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If user is not authenticated and tries to access protected pages, redirect to signin
    if (!token && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    // Allow all other requests to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Always allow access to auth pages and API routes
        if (
          pathname === "/signin" ||
          pathname === "/signup" ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/auth/signup")
        ) {
          return true;
        }

        // For dashboard and other protected routes, require authentication
        if (pathname.startsWith("/dashboard")) {
          return !!token;
        }

        // Allow access to public pages
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Match all paths except static files and API routes (except auth)
    "/((?!_next/static|_next/image|favicon.ico|api/(?!auth)).*)",
    // Always run middleware on these specific paths
    "/dashboard/:path*",
    "/signin",
    "/signup",
  ],
};
