import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { fileId: string } }) {
  console.log("🔍 Fetching cashflow records for file ID:", params.fileId)

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

  console.log("📄 Found file:", file.filename, "Status:", file.status)

  // Direct query to check if any records exist for this file
  const { count, error: countError } = await supabase
    .from("cashflow_records")
    .select("*", { count: "exact", head: true })
    .eq("source_file_id", params.fileId)

  if (countError) {
    console.error("❌ Error counting records:", countError)
  } else {
    console.log(`📊 Record count for file: ${count}`)
  }

  // 3. Fetch matching cashflow records
  const { data: records, error: recordError } = await supabase
    .from("cashflow_records")
    .select("*") // flat select with no joins
    .eq("source_file_id", params.fileId)
    .order("year", { ascending: true })

  if (recordError) {
    console.error("❌ Error fetching records:", recordError)
    return NextResponse.json({ error: recordError.message }, { status: 500 })
  }

  // Add console.log to help debug
  console.log("📊 Retrieved records:", records?.length || 0)

  if (records && records.length > 0) {
    console.log("📊 First record sample:", records[0])
  } else {
    // Try a broader query to see if any records exist at all
    const { data: anyRecords, error: anyError } = await supabase
      .from("cashflow_records")
      .select("id, source_file_id")
      .limit(5)

    console.log("🔍 Checking for any records in the table:", anyRecords?.length || 0)
    if (anyRecords && anyRecords.length > 0) {
      console.log("📊 Sample records:", anyRecords)
    }
  }

  return NextResponse.json({ records })
}
