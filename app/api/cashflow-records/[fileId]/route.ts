import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { fileId: string } }) {
  const supabase = createServerSupabaseClient({ req })
  const { data: userData, error: authError } = await supabase.auth.getUser()
  const user = userData?.user

  if (authError || !user) {
    console.error("❌ Auth error:", authError)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch the file to verify it exists and belongs to the user
    const { data: file, error: fileError } = await supabase
      .from("uploaded_files")
      .select("*")
      .eq("id", params.fileId)
      .eq("user_id", user.id)
      .single()

    if (fileError || !file) {
      console.error("❌ File fetch error:", fileError)
      return NextResponse.json({ error: "File not found or access denied" }, { status: 404 })
    }

    // Fetch cashflow records with their categories
    const { data: records, error: recordsError } = await supabase
      .from("cashflow_records")
      .select(`
        id,
        year,
        amount,
        is_recurring,
        notes,
        category:cashflow_categories(id, name, type)
      `)
      .eq("source_file_id", params.fileId)
      .eq("user_id", user.id)
      .order("year", { ascending: true })

    if (recordsError) {
      console.error("❌ Records fetch error:", recordsError)
      return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
    }

    // Get summary statistics
    const summary = {
      total_records: records.length,
      years: [...new Set(records.map((record) => record.year))].sort(),
      by_type: {
        income: {
          count: records.filter((r) => r.category.type === "income").length,
          sum: records
            .filter((r) => r.category.type === "income")
            .reduce((sum, r) => sum + Number.parseFloat(r.amount), 0),
        },
        expense: {
          count: records.filter((r) => r.category.type === "expense").length,
          sum: records
            .filter((r) => r.category.type === "expense")
            .reduce((sum, r) => sum + Number.parseFloat(r.amount), 0),
        },
        debt: {
          count: records.filter((r) => r.category.type === "debt").length,
          sum: records
            .filter((r) => r.category.type === "debt")
            .reduce((sum, r) => sum + Number.parseFloat(r.amount), 0),
        },
      },
    }

    return NextResponse.json({
      records,
      summary,
      file: {
        id: file.id,
        filename: file.filename,
        status: file.status,
        created_at: file.created_at,
        processed_at: file.processed_at,
      },
    })
  } catch (error) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
