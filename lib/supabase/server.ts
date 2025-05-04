import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export const createServerSupabaseClient = () => {
  return createRouteHandlerClient({ cookies })
}
