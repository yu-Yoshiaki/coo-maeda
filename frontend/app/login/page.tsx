import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { login, signup } from "./actions"

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // すでにログイン済みの場合は/business-plansにリダイレクト
  if (user) {
    redirect("/business-plans")
  }

  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      <button type="submit" formAction={login}>Log in</button>
      <button type="submit" formAction={signup}>Sign up</button>
    </form>
  )
}
