import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Trigger this middleware to run on the `/secret-page` route
export const config = {
  matcher: "/testMiddleware",
};

export function middleware(request: NextRequest) {
  // Extract country. Default to BR if not found.
  const country = (request.geo && request.geo.country) || "BR";
  request.nextUrl.pathname = "/signIn";

  console.log(`Visitor from ${country}`);
  // Rewrite to URL
  return NextResponse.redirect(request.nextUrl);
}
