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

  // 2. Get or fallback to unassigned entity
  let finalEntityId = file.entity_id
  if (!finalEntityId) {
    const { data: fallback, error: fallbackError } = await supabase
      .from("entities")
      .select("id")
      .eq("name", "Unassigned Entity")
      .eq("user_id", user.id)
      .maybeSingle()

    if (fallbackError || !fallback) {
      console.error("❌ No fallback entity found for user:", fallbackError)
      return NextResponse.json({ error: "No entity assigned" }, { status: 400 })
    }

    finalEntityId = fallback.id
  }

  // 3. Fetch matching cashflow records
  const { data: records, error: recordError } = await supabase
    .from("cashflow_records")
    .select(`
      id,
      year,
      amount,
      is_recurring,
      source_file_id,
      cashflow_categories (
        name
      )
    `)
    .eq("source_file_id", file.id)
    .eq("entity_id", finalEntityId) // ← ✅ Restore this
    .order("year", { ascending: true })

  if (recordError) {
    console.error("❌ Error fetching records:", recordError)
    return NextResponse.json({ error: recordError.message }, { status: 500 })
  }

  return NextResponse.json({ records })
}
