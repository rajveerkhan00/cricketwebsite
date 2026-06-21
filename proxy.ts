import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin dashboard requires admin role
    if (pathname.startsWith("/admin/dashboard")) {
      if (!token || token.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }

    // Tournaments require any authenticated user
    if (pathname.startsWith("/tournaments")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Let the middleware function above handle the actual authorization logic.
      // Return true to always run the middleware function.
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/admin/dashboard/:path*", "/tournaments/:path*"],
};
