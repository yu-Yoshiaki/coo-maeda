import { createClient } from "@/lib/supabase/server"

import { redirect } from "next/navigation"
import Signout from "./Signout"

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/")
  }

  return (
    <div>
      <div className="flex justify-end">
        <Signout />
      </div>
      <div className="flex justify-center">
        <h1 className="text-2xl font-bold">COO前田くんAI</h1>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-screen-md">
          {children}
        </div>
      </div>
    </div>
  )
}
