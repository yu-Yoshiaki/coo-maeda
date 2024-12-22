import type { ProgressAlert } from "@/features/progress/types"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

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
