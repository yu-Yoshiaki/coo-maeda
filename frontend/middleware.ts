import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set({
              name,
              value,
              ...options,
            })
          })
        },
      },
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 認証が必要なページのパスを定義
  const protectedPaths = ["/dashboard", "/profile", "/settings"]
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // 認証ページにいる場合、既にログインしていればダッシュボードにリダイレクト
  if (request.nextUrl.pathname === "/auth") {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return res
  }

  // 保護されたページにアクセスしようとしている場合
  if (isProtectedPath) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth", request.url))
    }
    return res
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
