import { NextResponse, type NextRequest } from "next/server"

import { auth } from "@/lib/auth"

const publicRoutes = ["/"]

const authRoutes = ["/sign-in"]

function isPublicRoute(pathname: string): boolean {
  if (publicRoutes.includes(pathname)) return true
  return false
}

function isAuthRoute(pathname: string): boolean {
  return authRoutes.some((route) => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  const session = await auth.api.getSession({
    headers: request.headers
  })

  if (session && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  if (isAuthRoute(pathname)) {
    return NextResponse.next()
  }

  if (!session) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"]
}
