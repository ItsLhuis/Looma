import { NextResponse, type NextRequest } from "next/server"

import { getSessionCookie } from "better-auth/cookies"

export async function middleware(request: NextRequest) {
  const session = getSessionCookie(request)
  const apiAuthPrefix = "/api/auth"

  if (request.nextUrl.pathname.startsWith(apiAuthPrefix)) {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/auth/:path*", "/login"]
}
