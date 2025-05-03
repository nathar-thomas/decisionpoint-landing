// app/api/cashflow-records/[fileId]/route.ts

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { fileId: string } }) {
  const supabase = createServerSupabaseClient({ req })

  try {
    // Get the authenticated user
    const { data: userData, error: authError } = await supabase.auth.getUser()
    const user = userData?.user

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the file exists and belongs to the user
    const { data: file, error: fileError } = await supabase
      .from("uploaded_files")
      .select("*")
      .eq("id", params.fileId)
      .eq("user_id", user.id)
      .single()

    if (fileError || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Fetch cashflow records with their categories
    const { data: records, error: recordsError } = await supabase
      .from("cashflow_records")
      .select(`
        id,
        year,
        amount,
        is_recurring,
        confidence_score,
        category:cashflow_categories(id, name, type)
      `)
      .eq("source_file_id", params.fileId)
      .eq("user_id", user.id)
      .order("year", { ascending: true })

    if (recordsError) {
      return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
    }

    // Calculate summary statistics
    const years = [...new Set(records.map((record) => record.year))].sort()

    const summary = {
      total_records: records.length,
      years: years,
      income_sum: records
        .filter((record) => record.category.type === "income")
        .reduce((sum, record) => sum + Number.parseFloat(record.amount), 0),
      expense_sum: records
        .filter((record) => record.category.type === "expense")
        .reduce((sum, record) => sum + Number.parseFloat(record.amount), 0),
      debt_sum: records
        .filter((record) => record.category.type === "debt")
        .reduce((sum, record) => sum + Number.parseFloat(record.amount), 0),
    }

    return NextResponse.json({
      records,
      summary,
      file: {
        id: file.id,
        filename: file.filename,
        created_at: file.created_at,
        processed_at: file.processed_at,
      },
    })
  } catch (err: any) {
    console.error("❌ API error in GET /cashflow-records/[fileId]", err)
    return NextResponse.json({ error: "Unexpected error", details: err.message }, { status: 500 })
  }
}
