// lib/supabase/server.ts
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { type Database } from "@/types/supabase" // Optional if you generated types

export const createServerSupabaseClient = () => {
  return createRouteHandlerClient<Database>({ cookies })
}
