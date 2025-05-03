import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { cookies, headers } from "next/headers"

export function createServerSupabaseClient({ req }: { req?: Request } = {}) {
  return createServerComponentSupabaseClient({
    headers: () => headers(),
    cookies: () => cookies(),
  })
}
