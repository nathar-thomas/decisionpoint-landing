// app/api/cashflow-records/[fileId]/route.ts

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { fileId: string } }
) {
  const supabase = createServerSupabaseClient({ req })
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("cashflow_records")
    .select("id, amount, year, confidence_score, cashflow_categories(name)")
    .eq("user_id", user.id)
    .eq("source_file_id", params.fileId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
