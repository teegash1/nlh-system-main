import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { createServerClient } from "@supabase/ssr"

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/stock",
  "/analytics",
  "/reports",
  "/settings",
  "/notifications",
  "/team",
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always refresh session cookies
  const response = await updateSession(request)

  // If route is not protected, allow
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )
  if (!isProtected) return response

  // Check auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
