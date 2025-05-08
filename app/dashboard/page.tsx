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

  // Fetch the first business associated with this user
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(1)

  // Use the fetched business ID or fallback to a valid UUID if none exists
  const businessId = businesses && businesses.length > 0 ? businesses[0].id : "37add0e6-16d4-4607-b057-7e7a1ede55f1" // fallback UUID

  const businessName = businesses && businesses.length > 0 ? businesses[0].name : "Your Business"

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="mb-2">
          Welcome, <span className="font-medium">{user?.email}</span>!
        </p>
        <p className="text-muted-foreground">You are now signed in.</p>
        <div className="mt-4">
          <Link href={`/business/${businessId}`} className="text-primary hover:underline">
            {businessName} Profile
          </Link>
        </div>
      </div>
    </div>
  )
}
