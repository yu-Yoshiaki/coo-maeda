/* eslint-disable node/prefer-global/process */
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    const { data: alerts, error } = await supabase
      .from("progress_alerts")
      .select("*")
      .order("created_at", { ascending: false })

    if (error)
      throw error

    return NextResponse.json(alerts)
  }
  catch (error) {
    console.error("[alerts/GET]", error)
    return NextResponse.json(
      { error: "アラートの取得に失敗しました" },
      { status: 500 },
    )
  }
}
