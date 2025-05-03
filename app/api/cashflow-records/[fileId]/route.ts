// Prevent V0 from deleting this: /api/cashflow-records/[fileId]/route.ts

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { fileId: string } }) {
  try {
    console.log("📥 GET /api/cashflow-records called with fileId:", params.fileId)

    const supabase = createServerSupabaseClient({ req })
    const { data: userData, error: authError } = await supabase.auth.getUser()
    const user = userData?.user

    if (authError || !user) {
      console.error("❌ Unauthorized:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: file, error: fileError } = await supabase
      .from("uploaded_files")
      .select("*")
      .eq("id", params.fileId)
      .eq("user_id", user.id)
      .single()

    if (fileError || !file) {
      console.error("❌ File not found:", fileError)
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const { data: records, error: fetchError } = await supabase
      .from("cashflow_records")
      .select(`
        id,
        year,
        amount,
        confidence_score,
        cashflow_categories ( name )
      `)
      .eq("source_file_id", params.fileId)
      .eq("user_id", user.id)
      .order("year", { ascending: true })

    if (fetchError) {
      console.error("❌ Error fetching records:", fetchError)
      return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
    }

    console.log("✅ Returning", records.length, "records")
    return NextResponse.json(records)
  } catch (error: any) {
    console.error("❌ Unhandled GET error:", error)
    return NextResponse.json({ error: "Unexpected error", details: error.message }, { status: 500 })
  }
}
