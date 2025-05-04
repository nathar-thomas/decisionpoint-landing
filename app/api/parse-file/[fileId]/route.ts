// app/api/parse-file/[fileId]/route.ts

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { parse } from "csv-parse/sync"

function cleanNumericValue(value: string): number {
  if (!value) return Number.NaN
  return Number.parseFloat(value.replace(/[^0-9.-]/g, ""))
}

function guessCategoryType(name: string): "income" | "expense" | "debt" {
  const lower = name.toLowerCase()
  if (lower.includes("tax") || lower.includes("expense")) return "expense"
  if (lower.includes("wage") || lower.includes("income") || lower.includes("dividend")) return "income"
  if (lower.includes("loan") || lower.includes("debt")) return "debt"
  return "expense"
}

export async function POST(req: Request, { params }: { params: { fileId: string } }) {
  const supabase = createServerSupabaseClient()
  console.log("🔍 Starting parse for file ID:", params.fileId)

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

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

  console.log("📄 Found file:", file.filename, "Path:", file.file_path)

  const { data: fileBlob, error: fileDownloadError } = await supabase.storage
    .from("cashflow-files")
    .download(file.file_path)

  if (fileDownloadError || !fileBlob) {
    console.error("❌ File download failed:", fileDownloadError)
    return NextResponse.json({ error: "File download failed" }, { status: 500 })
  }

  console.log("✅ File downloaded successfully")

  // ⬇️ fallback entity logic
  let fallbackEntityId = file.entity_id
  if (!fallbackEntityId) {
    const { data: fallbackEntity, error: fallbackError } = await supabase
      .from("entities")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", "Unassigned Entity")
      .maybeSingle()

    if (fallbackError) {
      console.error("❌ Error checking fallback entity:", fallbackError)
      return NextResponse.json({ error: "Entity lookup failed" }, { status: 500 })
    }

    if (fallbackEntity) {
      fallbackEntityId = fallbackEntity.id
      console.log("🏢 Using existing fallback entity:", fallbackEntityId)
    } else {
      const { data: createdEntity, error: insertEntityError } = await supabase
        .from("entities")
        .insert({
          name: "Unassigned Entity",
          type: "business",
          user_id: user.id,
          metadata: {},
        })
        .select()
        .single()

      if (insertEntityError) {
        console.error("❌ Error inserting fallback entity:", insertEntityError)
        return NextResponse.json({ error: "Entity insert failed" }, { status: 500 })
      }

      fallbackEntityId = createdEntity.id
      console.log("🏢 Created new fallback entity:", fallbackEntityId)
    }
  }

  try {
    const csvText = await fileBlob.text()
    console.log("📊 CSV content sample:", csvText.substring(0, 200) + "...")

    const rows = parse(csvText, { skip_empty_lines: true })
    const headers = rows[0]
    const categoryCol = 0

    const yearColumns: Record<number, number> = {}
    headers.forEach((col: string, i: number) => {
      const match = col.match(/\b(20\d{2})\b/)
      if (match) yearColumns[i] = Number.parseInt(match[1])
    })

    console.log("📊 CSV Headers:", headers)
    console.log("📊 Year columns detected:", yearColumns)
    console.log("📊 Total data rows:", rows.length - 1)

    if (Object.keys(yearColumns).length === 0) {
      console.error("❌ No year columns found.")
      return NextResponse.json({ error: "No year columns found." }, { status: 400 })
    }

    const normalizedRecords: any[] = []
    const errorRecords: any[] = []

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      console.log("🔍 Row", i, "→", row)

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
        console.log("🏷️ Creating new category:", categoryName, "Type:", newType)

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
        console.log("✅ Created category:", category.id)
      }

      for (const colIndex in yearColumns) {
        const rawValue = row[colIndex]
        const cleanedValue = cleanNumericValue(rawValue)
        const year = yearColumns[colIndex]

        console.log("🔢 Processing value:", rawValue, "→", cleanedValue, "(year:", year + ")")

        if (isNaN(cleanedValue)) {
          errorRecords.push({
            row_number: i,
            column_name: headers[colIndex],
            error_type: "invalid_number",
            error_message: `Could not convert value: "${rawValue}"`,
            raw_value: rawValue,
          })
          continue
        }

        normalizedRecords.push({
          user_id: user.id,
          entity_id: fallbackEntityId,
          category_id: category.id,
          year,
          amount: cleanedValue,
          source_file_id: file.id,
          is_recurring: true,
        })
      }
    }

    console.log("✅ Normalized rows to insert:", normalizedRecords.length)
    console.log("⚠️ Errors to log:", errorRecords.length)

    if (normalizedRecords.length > 0) {
      console.log("💾 Inserting records sample:", normalizedRecords.slice(0, 2))

      const { data: insertedData, error: insertError } = await supabase
        .from("cashflow_records")
        .insert(normalizedRecords)
        .select()

      if (insertError) {
        console.error("❌ Error inserting records:", insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      console.log(`✅ Successfully inserted ${insertedData?.length || 0} records`)
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

    return NextResponse.json({
      message: "Parsed successfully",
      rows_inserted: normalizedRecords.length,
      rows_failed: errorRecords.length,
    })
  } catch (error) {
    console.error("❌ Unexpected error during parsing:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown parsing error",
      },
      { status: 500 },
    )
  }
}
