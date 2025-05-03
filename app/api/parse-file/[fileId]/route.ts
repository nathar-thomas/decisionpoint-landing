// app/api/parse-file/[fileId]/route.ts

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
  try {
    const supabase = createServerSupabaseClient({ req })
    const { data: userData, error: authError } = await supabase.auth.getUser()
    const user = userData?.user

    if (authError || !user) {
      console.error("❌ Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: file, error: fileFetchError } = await supabase
      .from("uploaded_files")
      .select("*")
      .eq("id", params.fileId)
      .single()

    if (fileFetchError || !file) {
      console.error("❌ File fetch error:", fileFetchError)
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const { data: fileBlob, error: fileDownloadError } = await supabase.storage
      .from("cashflow-files")
      .download(file.file_path)

    if (fileDownloadError || !fileBlob) {
      console.error("❌ File download failed:", fileDownloadError)
      return NextResponse.json({ error: "File download failed" }, { status: 500 })
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

    const normalizedRecords: any[] = []
    const errorRecords: any[] = []

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const categoryName = row[categoryCol]?.trim()

      if (!categoryName) {
        errorRecords.push({
          row_number: i,
          column_name: headers[categoryCol],
          error_type: "empty_cell",
          error_message: "Missing category name",
          raw_value: "",
        })
        continue
      }

      let { data: category, error: categoryFetchError } = await supabase
        .from("cashflow_categories")
        .select("*")
        .ilike("name", categoryName)
        .maybeSingle()

      if (categoryFetchError) {
        console.error("❌ Error fetching category:", categoryFetchError)
      }

      if (!category) {
        const newType = guessCategoryType(categoryName)
        const { data: created, error: insertError } = await supabase
          .from("cashflow_categories")
          .insert({ name: categoryName, type: newType, is_system: false })
          .select()
          .single()
        if (insertError) {
          console.error("❌ Category insert error:", insertError)
          continue
        }
        category = created
      }

      for (const colIndex in yearColumns) {
        const rawValue = row[colIndex]
        const cleanedValue = cleanNumericValue(rawValue)
        const year = yearColumns[colIndex]

        if (isNaN(cleanedValue)) {
          errorRecords.push({
            row_number: i,
            column_name: headers[colIndex],
            error_type: "invalid_number",
            error_message: `Could not convert value: \"${rawValue}\"`,
            raw_value: rawValue,
          })
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
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    if (errorRecords.length > 0) {
      const enrichedErrors = errorRecords.map((e) => ({
        ...e,
        file_id: file.id,
        user_id: user.id,
      }))
      await supabase.from("parser_errors").insert(enrichedErrors)
    }

    await supabase
      .from("uploaded_files")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("id", file.id)

    console.log("✅ Parser complete. Inserted:", normalizedRecords.length, "Failed:", errorRecords.length)

    return NextResponse.json({
      message: "Parsed successfully",
      rows_inserted: normalizedRecords.length,
      rows_failed: errorRecords.length,
    })
  } catch (error: any) {
    console.error("❌ UNHANDLED ERROR in /parse-file:", error)

    return new Response(
      JSON.stringify({
        error: "Unexpected server error",
        detail: error instanceof Error ? error.message : String(error),
        stack: error?.stack || null,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
