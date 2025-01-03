import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { updateSession } from "./lib/supabase/middleware"

// ユーザー情報を取得する関数
async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error)
    return null
  return user
}

export async function middleware(request: NextRequest) {
  // パス情報をヘッダーに追加
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", request.nextUrl.pathname)

  // Supabaseのセッション更新
  const response = await updateSession(request)

  // プライベートページへのアクセスチェック
  const privatePages = [
    "/business-plans",
    "/schedules",
    "/reports",
    "/settings",
  ]

  const isPrivatePage = privatePages.some(path =>
    request.nextUrl.pathname.startsWith(path),
  )

  if (isPrivatePage) {
    const user = await getUser()
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // レスポンスヘッダーにパス情報を追加
  const responseHeaders = new Headers(response.headers)
  responseHeaders.set("x-pathname", request.nextUrl.pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
    headers: responseHeaders,
  })
}

export const config = {
  matcher: [
    "/(api|auth|business-plans|reports|schedules|settings|)",
    "/_next/data/:path*",
  ],
}
