"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function Signout() {
  const supabase = createClient()
  const router = useRouter()
  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <button type="submit" onClick={signOut}>サインアウト</button>
  )
}
