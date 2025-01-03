/* eslint-disable node/prefer-global/process */
import { type CookieOptions, createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options?: CookieOptions) {
          try {
            if (name === "sb-access-token" || name === "sb-refresh-token") {
              options = {
                ...options,
                maxAge: 60 * 60 * 24, // 24時間
                secure: true,
                sameSite: "lax",
                path: "/",
                httpOnly: true,
              }
            }
            cookieStore.set(name, value, options)
          }
          catch {
            // サーバーコンポーネントからの呼び出しは無視
            // ミドルウェアでセッションをリフレッシュする場合は問題なし
          }
        },
        remove(name: string, options?: CookieOptions) {
          cookieStore.set(name, "", { ...options, maxAge: -1 })
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    },
  )
}
