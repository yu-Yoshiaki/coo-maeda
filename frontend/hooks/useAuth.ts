import type { AuthError, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import { useCallback, useState } from "react"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error)
        throw error
      return data
    }
    catch (err) {
      setError(err as AuthError)
      return null
    }
    finally {
      setLoading(false)
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error)
        throw error
      setUser(data.user)
      return data
    }
    catch (err) {
      setError(err as AuthError)
      return null
    }
    finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error)
        throw error
      setUser(null)
    }
    catch (err) {
      setError(err as AuthError)
    }
    finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  }
}
