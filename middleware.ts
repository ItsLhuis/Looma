import { getSessionCookie } from "better-auth/cookies"
import { NextResponse, type NextRequest } from "next/server"

const publicRoutes = ["/", "/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const sessionCookie = getSessionCookie(request)

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    if (sessionCookie && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"]
}
