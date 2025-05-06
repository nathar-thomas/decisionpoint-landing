import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function Dashboard() {
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

  // Mock business ID for initial implementation
  const mockBusinessId = "mock-business-1"

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="mb-2">
          Welcome, <span className="font-medium">{user?.email}</span>!
        </p>
        <p className="text-muted-foreground">You are now signed in.</p>
        <div className="mt-4">
          <Link href={`/business/profile/${mockBusinessId}`} className="text-primary hover:underline">
            Business Profile
          </Link>
        </div>
      </div>
    </div>
  )
}
