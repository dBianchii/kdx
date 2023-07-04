import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.json({
    message: "Hello from the middleware!",
    city: request.geo?.city,
    ip: request.ip,
    url: request.url,
  });
}
