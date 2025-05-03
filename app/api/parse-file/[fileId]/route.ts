import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { parse } from "csv-parse/sync"

function cleanNumericValue(value: string): number {
  if (!value) return NaN
  return parseFloat(value.replace(/[^0-9.-]/g, ""))
}

function guessCategoryType(name: string): "income" | "expense" | "debt" {
  const lower = name.toLowerCase()
  if (lower.includes("tax") || lower.includes("expense")) return "expense"
  if (lower.includes("wage") || lower.includes("income") || lower.includes("dividend")) return "income"
  if (lower.includes("loan") || lower.includes("debt")) return "debt"
  return "expense"
}

export async function POST(req: Request, { params }: { params: { fileId: string } }) {
  const supabase = createServerSupabaseClient({ req, headers: req.headers })

  try {
    const { data: userData, error: authError } = await supabase.auth.getUser()
    if (authError || !userData?.user) {
      console.error("❌ Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = userData.user

    const { data: file, error: fileError } = await supabase
      .from("uploaded_files")
      .select("*")
      .eq("id", params.fileId)
      .eq("user_id", user.id)
      .single()

    if (fileError || !file) {
      console.error("❌ File fetch error:", fileError)
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const { data: fileBlob, error: blobError } = await supabase
      .storage
      .from("cashflow-files")
      .download(file.file_path)

    if (blobError || !fileBlob) {
      console.error("❌ File download failed:", blobError)
      return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
    }

    const csvText = await fileBlob.text()
    const rows = parse(csvText, { skip_empty_lines: true })
    const headers = rows[0]
    const categoryCol = 0

    const yearColumns: Record<number, number> = {}
    headers.forEach((col: string, i: number) => {
      const match = col.match(/\b(20\d{2})\b/)
      if (match) yearColumns[i] = parseInt(match[1])
    })

    if (Object.keys(yearColumns).length === 0) {
      console.error("❌ No year columns found.")
      return NextResponse.json({ error: "No year columns found." }, { status: 400 })
    }

    const normalizedRecords = []
    const errorRecords = []

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const categoryName = row[categoryCol]?.trim()

      if (!categoryName) {
        errorRecords.push({ row_number: i, column_name: headers[categoryCol], error_type: "empty", raw_value: "" })
        continue
      }

      let { data: category } = await supabase
        .from("cashflow_categories")
        .select("*")
        .ilike("name", categoryName)
        .maybeSingle()

      if (!category) {
        const { data: created } = await supabase
          .from("cashflow_categories")
          .insert({
            name: categoryName,
            type: guessCategoryType(categoryName),
            is_system: false,
          })
          .select()
          .single()
        category = created
      }

      for (const colIndex in yearColumns) {
        const rawValue = row[colIndex]
        const cleanedValue = cleanNumericValue(rawValue)
        const year = yearColumns[colIndex]

        if (isNaN(cleanedValue)) {
          errorRecords.push({ row_number: i, column_name: headers[colIndex], error_type: "invalid", raw_value })
          continue
        }

        normalizedRecords.push({
          user_id: user.id,
          entity_id: file.entity_id || null,
          category_id: category.id,
          year,
          amount: cleanedValue,
          source_file_id: file.id,
          is_recurring: true,
        })
      }
    }

    if (normalizedRecords.length > 0) {
      const { error: insertError } = await supabase.from("cashflow_records").insert(normalizedRecords)
      if (insertError) {
        console.error("❌ Error inserting records:", insertError)
        return NextResponse.json({ error: "Insert failed", detail: insertError.message }, { status: 500 })
      }
    }

    if (errorRecords.length > 0) {
      await supabase.from("parser_errors").insert(errorRecords.map((e) => ({
        ...e,
        file_id: file.id,
        user_id: user.id,
      })))
    }

    await supabase
      .from("uploaded_files")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("id", file.id)

    console.log("✅ Parse completed. Inserted:", normalizedRecords.length)

    return NextResponse.json({
      message: "Parsed successfully",
      rows_inserted: normalizedRecords.length,
      rows_failed: errorRecords.length,
    })
  } catch (error: any) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json({ error: "Unexpected error", detail: error.message }, { status: 500 })
  }
}
