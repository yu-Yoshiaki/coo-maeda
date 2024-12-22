import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// 環境変数の型安全な取得
function getEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

// 必要な環境変数を取得
const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL")
const supabaseKey = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY")

export async function auth() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const { data: { session } } = await supabase.auth.getSession()
  return session
}
