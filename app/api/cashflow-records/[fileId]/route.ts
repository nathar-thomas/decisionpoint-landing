// /app/api/cashflow-records/[fileId]/route.ts

import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { fileId: string } }) {
  const supabase = createServerSupabaseClient({ cookies })

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: file, error: fileError } = await supabase
    .from("uploaded_files")
    .select("*")
    .eq("id", params.fileId)
    .eq("user_id", user.id)
    .single()

  if (fileError || !file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

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

  const years = [...new Set(records.map((r) => r.year))].sort()

  const summary = {
    total_records: records.length,
    years,
    income_sum: records
      .filter((r) => r.category.type === "income")
      .reduce((sum, r) => sum + Number(r.amount), 0),
    expense_sum: records
      .filter((r) => r.category.type === "expense")
      .reduce((sum, r) => sum + Number(r.amount), 0),
    debt_sum: records
      .filter((r) => r.category.type === "debt")
      .reduce((sum, r) => sum + Number(r.amount), 0),
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
}
