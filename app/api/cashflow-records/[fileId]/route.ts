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

  console.log("📄 Found file:", file.filename, "ID:", file.id)

  // 3. Fetch matching cashflow records - CRITICAL FIX: Use file.id instead of params.fileId
  const { data: records, error: recordError } = await supabase
    .from("cashflow_records")
    .select("*")
    .eq("source_file_id", file.id)
    .order("year", { ascending: true })

  if (recordError) {
    console.error("❌ Error fetching records:", recordError)
    return NextResponse.json({ error: recordError.message }, { status: 500 })
  }

  console.log("📊 Retrieved records:", records?.length || 0)

  // If no records found, try a direct query without any filters to debug
  if (!records || records.length === 0) {
    console.log("⚠️ No records found with file ID filter, trying direct query")

    // Try a direct query to see if any records exist for this user
    const { data: directRecords, error: directError } = await supabase
      .from("cashflow_records")
      .select("id, source_file_id, year, amount")
      .eq("user_id", user.id)
      .limit(10)

    if (directError) {
      console.error("❌ Error in direct query:", directError)
    } else {
      console.log("📊 Direct query found records:", directRecords?.length || 0)
      if (directRecords && directRecords.length > 0) {
        console.log("📊 Sample direct records:", directRecords)

        // Check if any of these records match our file ID
        const matchingRecords = directRecords.filter((r) => r.source_file_id === file.id)
        console.log("📊 Matching records from direct query:", matchingRecords.length)

        if (matchingRecords.length > 0) {
          // If we found matching records this way, use them
          return NextResponse.json({ records: matchingRecords })
        }
      }
    }
  }

  return NextResponse.json({ records })
}
