/* eslint-disable node/prefer-global/process */
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()

  // サインアウト処理
  await supabase.auth.signOut()

  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL))
}
