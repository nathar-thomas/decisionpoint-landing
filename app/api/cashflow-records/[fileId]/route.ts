import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { fileId: string } }
) {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error("❌ Auth error:", authError)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 1. Get uploaded file by fileId
  const { data: file, error: fileError } = await supabase
    .from("uploaded_files")
    .select("*")
    .eq("id", params.fileId)
    .single()

  if (fileError || !file) {
    console.error("❌ File fetch error:", fileError)
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  // 2. Fetch matching cashflow records
  const { data: records, error: recordError } = await supabase
    .from("cashflow_records")
    .select("id, year, amount, is_recurring, category: { name: string }, source_file_id")
    .eq("source_file_id", file.id)
    .order("year", { ascending: true })

  if (recordError) {
    console.error("❌ Error fetching records:", recordError)
    return NextResponse.json({ error: recordError.message }, { status: 500 })
  }

  return NextResponse.json({ records })
}
