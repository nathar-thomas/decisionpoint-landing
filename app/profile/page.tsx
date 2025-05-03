import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium">Email</h2>
            <p>{user?.email}</p>
          </div>
          <div>
            <h2 className="text-lg font-medium">User ID</h2>
            <p className="font-mono text-sm">{user?.id}</p>
          </div>
          <div>
            <h2 className="text-lg font-medium">Last Sign In</h2>
            <p>{new Date(user?.last_sign_in_at || "").toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
