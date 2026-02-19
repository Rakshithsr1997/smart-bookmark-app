'use client'

import { supabase } from '@/lib/supabaseClient'

export default function LoginButton() {

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      })

      if (error) {
        console.error('Login error:', error.message)
      }

    } catch (err) {
      console.error('Unexpected error:', err)
    }
  }

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
    >
      Sign in with Google
    </button>
  )
}