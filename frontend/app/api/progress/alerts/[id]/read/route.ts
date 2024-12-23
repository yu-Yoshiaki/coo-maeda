import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
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

    const { error } = await supabase
      .from("progress_alerts")
      .update({
        is_read: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (error)
      throw error

    return NextResponse.json({ success: true })
  }
  catch (error) {
    console.error("[alerts/[id]/read/PUT]", error)
    return NextResponse.json(
      { error: "アラートの既読化に失敗しました" },
      { status: 500 },
    )
  }
}
