// Keep V0 from deleting this: /api/parse-file/[fileId]

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { Readable } from "stream";

// Helper to clean numbers
function cleanNumericValue(value: string): number {
  if (!value) return NaN;
  return parseFloat(value.replace(/[^0-9.-]/g, ""));
}

// Guess category type (simplified)
function guessCategoryType(name: string): "income" | "expense" | "debt" {
  const lower = name.toLowerCase();
  if (lower.includes("tax") || lower.includes("expense")) return "expense";
  if (lower.includes("wage") || lower.includes("income") || lower.includes("dividend")) return "income";
  if (lower.includes("loan") || lower.includes("debt")) return "debt";
  return "expense";
}

export async function POST(
  req: Request,
  { params }: { params: { fileId: string } }
) {
  const supabase = createServerSupabaseClient({ req });
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get file info
  const { data: file } = await supabase
    .from("uploaded_files")
    .select("*")
    .eq("id", params.fileId)
    .single();

  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const filePath = file.file_path;

  // Download file from Supabase Storage
  const { data: fileBlob, error: fileError } = await supabase.storage
    .from("cashflow-files")
    .download(filePath);

  if (fileError || !fileBlob)
    return NextResponse.json({ error: "File download failed" }, { status: 500 });

  const csvText = await fileBlob.text();
  const rows = parse(csvText, { skip_empty_lines: true });

  const headers = rows[0];
  const categoryCol = 0;

  // Detect year columns
  const yearColumns: Record<number, number> = {};
  headers.forEach((col: string, index: number) => {
    const match = col.match(/\b(20\d{2})\b/);
    if (match) yearColumns[index] = parseInt(match[1]);
  });

  if (Object.keys(yearColumns).length === 0) {
    return NextResponse.json({ error: "No year columns found." }, { status: 400 });
  }

  const normalizedRecords: any[] = [];
  const errorRecords: any[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const categoryName = row[categoryCol]?.trim();

    if (!categoryName) {
      errorRecords.push({
        row_number: i,
        column_name: headers[categoryCol],
        error_type: "empty_cell",
        error_message: "Missing category name",
        raw_value: "",
      });
      continue;
    }

    // Lookup or create category
    let { data: category } = await supabase
      .from("cashflow_categories")
      .select("*")
      .ilike("name", categoryName)
      .maybeSingle();

    if (!category) {
      const newType = guessCategoryType(categoryName);
      const { data: created } = await supabase
        .from("cashflow_categories")
        .insert({ name: categoryName, type: newType, is_system: false })
        .select()
        .single();
      category = created;
    }

    for (const colIndex in yearColumns) {
      const rawValue = row[colIndex];
      const cleanedValue = cleanNumericValue(rawValue);
      const year = yearColumns[colIndex];

      if (isNaN(cleanedValue)) {
        errorRecords.push({
          row_number: i,
          column_name: headers[colIndex],
          error_type: "invalid_number",
          error_message: `Could not convert value: "${rawValue}"`,
          raw_value: rawValue,
        });
        continue;
      }

      normalizedRecords.push({
        user_id: user.id,
        entity_id: file.entity_id || null,
        category_id: category.id,
        year,
        amount: cleanedValue,
        source_file_id: file.id,
        is_recurring: true,
      });
    }
  }

  // Insert valid rows
  if (normalizedRecords.length > 0) {
    await supabase.from("cashflow_records").insert(normalizedRecords);
  }

  // Insert error logs
  if (errorRecords.length > 0) {
    const enrichedErrors = errorRecords.map((e) => ({
      ...e,
      file_id: file.id,
      user_id: user.id,
    }));
    await supabase.from("parser_errors").insert(enrichedErrors);
  }

  // Update status of file
  await supabase
    .from("uploaded_files")
    .update({ status: "processed", processed_at: new Date().toISOString() })
    .eq("id", file.id);

  return NextResponse.json({
    message: "Parsed successfully",
    rows_inserted: normalizedRecords.length,
    rows_failed: errorRecords.length,
  });
}
