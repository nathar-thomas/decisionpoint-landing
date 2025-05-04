"use client"

import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type {
  CashflowRecord,
  Category,
  PivotedCashflow,
  CashflowSummary,
  UseCashflowAnalysisReturn,
  UploadedFile,
} from "@/types/cashflow"

/**
 * Hook to fetch and transform cashflow data for analysis
 * @param fileId - The ID of the uploaded file to analyze
 * @returns Object containing the transformed data, loading state, error state, and refresh function
 */
export function useCashflowAnalysis(fileId: string): UseCashflowAnalysisReturn {
  const [data, setData] = useState<PivotedCashflow | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClientComponentClient()

  const fetchData = useCallback(async () => {
    if (!fileId) {
      setError(new Error("File ID is required"))
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      console.time("Cashflow data fetch")

      // Fetch file details
      const { data: fileData, error: fileError } = await supabase
        .from("uploaded_files")
        .select("*")
        .eq("id", fileId)
        .single()

      if (fileError) {
        throw new Error(`Error fetching file: ${fileError.message}`)
      }

      // Fetch all cashflow records for this file
      const { data: records, error: recordsError } = await supabase
        .from("cashflow_records")
        .select("*")
        .eq("source_file_id", fileId)
        .order("year", { ascending: true })

      if (recordsError) {
        throw new Error(`Error fetching records: ${recordsError.message}`)
      }

      console.log("📊 Raw cashflow records:", records)

      // Fetch all categories
      const { data: categories, error: categoriesError } = await supabase.from("cashflow_categories").select("*")

      if (categoriesError) {
        throw new Error(`Error fetching categories: ${categoriesError.message}`)
      }

      console.log("🏷️ Categories:", categories)

      // Transform the data
      const transformedData = transformCashflowData(records, categories, fileData)
      console.log("🔄 Transformed data:", transformedData)

      setData(transformedData)
      console.timeEnd("Cashflow data fetch")
    } catch (err) {
      console.error("❌ Error in useCashflowAnalysis:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }, [fileId, supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
  }
}

/**
 * Transform raw cashflow records into a pivoted format for analysis
 */
function transformCashflowData(
  records: CashflowRecord[],
  categories: Category[],
  file: UploadedFile | null,
): PivotedCashflow {
  console.time("Data transformation")

  // Create a lookup map for categories
  const categoryMap: Record<string, Category> = {}
  categories.forEach((category) => {
    categoryMap[category.id] = category
  })

  // Extract unique years
  const years = [...new Set(records.map((record) => record.year))].sort()

  // Initialize data structures
  const byCategory: Record<string, Record<number, number>> = {}
  const byYear: Record<number, Record<string, number>> = {}
  const categoryNames = new Set<string>()

  // Initialize year records
  years.forEach((year) => {
    byYear[year] = {}
  })

  // Process each record
  records.forEach((record) => {
    const category = categoryMap[record.category_id]
    if (!category) {
      console.warn(`⚠️ Category not found for ID: ${record.category_id}`)
      return
    }

    const categoryName = category.name
    categoryNames.add(categoryName)

    // Initialize category if needed
    if (!byCategory[categoryName]) {
      byCategory[categoryName] = {}
    }

    // Sum amounts for the same category and year
    if (byCategory[categoryName][record.year]) {
      byCategory[categoryName][record.year] += record.amount
    } else {
      byCategory[categoryName][record.year] = record.amount
    }

    // Also store in byYear structure
    if (byYear[record.year][categoryName]) {
      byYear[record.year][categoryName] += record.amount
    } else {
      byYear[record.year][categoryName] = record.amount
    }
  })

  // Calculate summary metrics
  const summary = calculateSummary(records, categoryMap, years)

  console.timeEnd("Data transformation")

  return {
    byCategory,
    byYear,
    categories: categoryMap,
    years,
    categoryNames: [...categoryNames].sort(),
    summary,
    records,
    file,
  }
}

/**
 * Calculate summary metrics from cashflow records
 */
function calculateSummary(
  records: CashflowRecord[],
  categories: Record<string, Category>,
  years: number[],
): CashflowSummary {
  // Initialize summary objects
  const incomeByYear: Record<number, number> = {}
  const expensesByYear: Record<number, number> = {}
  const netByYear: Record<number, number> = {}

  years.forEach((year) => {
    incomeByYear[year] = 0
    expensesByYear[year] = 0
    netByYear[year] = 0
  })

  let totalIncome = 0
  let totalExpenses = 0

  // Process each record
  records.forEach((record) => {
    const category = categories[record.category_id]
    if (!category) return

    const { year, amount } = record

    if (category.type === "income") {
      incomeByYear[year] = (incomeByYear[year] || 0) + amount
      totalIncome += amount
    } else if (category.type === "expense") {
      expensesByYear[year] = (expensesByYear[year] || 0) + amount
      totalExpenses += amount
    }
    // Note: 'debt' and other types are not included in income/expense calculations
  })

  // Calculate net for each year
  years.forEach((year) => {
    netByYear[year] = incomeByYear[year] - expensesByYear[year]
  })

  return {
    incomeByYear,
    expensesByYear,
    netByYear,
    totalIncome,
    totalExpenses,
    totalNet: totalIncome - totalExpenses,
  }
}
