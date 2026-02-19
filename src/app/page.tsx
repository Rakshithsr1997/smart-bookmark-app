"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { AuthChangeEvent, Session } from "@supabase/supabase-js"
import LoginButton from "@/components/LoginButton"
import BookmarkManager from "@/components/BookmarkManager"

export default function Home() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for login/logout changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoginButton />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center flex-col gap-4">
      <h1 className="text-2xl font-bold">
        Welcome {user.email}
      </h1>

      <button
        onClick={() => supabase.auth.signOut()}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>

      <BookmarkManager userId={user.id} />

    </main>
  )
}
