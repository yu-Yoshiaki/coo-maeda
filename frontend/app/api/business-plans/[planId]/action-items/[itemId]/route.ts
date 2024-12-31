import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: { planId: string, itemId: string } },
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError)
      throw userError
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      )
    }

    // ユーザーが事業計画の所有者であることを確認
    const { data: plan, error: planError } = await supabase
      .from("business_plans")
      .select()
      .eq("id", params.planId)
      .eq("user_id", user.id)
      .single()

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Business plan not found" },
        { status: 404 },
      )
    }

    const { status, resources } = await request.json()

    // アクションアイテムの更新
    const { error: updateError } = await supabase
      .from("action_items")
      .update({
        status,
        resources,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.itemId)
      .eq("business_plan_id", params.planId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  }
  catch (error) {
    console.error("Error updating action item:", error)
    return NextResponse.json(
      { error: "Failed to update action item" },
      { status: 500 },
    )
  }
}
