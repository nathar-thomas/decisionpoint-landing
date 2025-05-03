"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"

export function GetUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [supabase])

  if (loading) {
    return <div>Loading user...</div>
  }

  if (!user) {
    return <div>Not logged in</div>
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-2">Current User</h2>
      <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}
