// app/api/cashflow-records/[fileId]/route.ts

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { fileId: string } }) {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error("❌ Auth error:", authError)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("cashflow_records")
    .select("*, cashflow_categories(name, type)")
    .eq("source_file_id", params.fileId)
    .order("year", { ascending: true })

  if (error) {
    console.error("❌ Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
  }

  return NextResponse.json(data)
}
