import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const protectedPaths = ["/bookings"];
        const { pathname } = req.nextUrl;

        if (protectedPaths.some((path) => pathname.startsWith(path))) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/bookings/:path*", "/barbershop/:path*/booking/:path*"],
};
