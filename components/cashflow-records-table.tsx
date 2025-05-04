"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface CashflowRecord {
  id: string
  year: number
  amount: number
  is_recurring: boolean
  source_file_id: string
  category_id: string
}

interface CategoryInfo {
  id: string
  name: string
  type: string
}

export function CashflowRecordsTable({ fileId }: { fileId: string }) {
  const [records, setRecords] = useState<CashflowRecord[]>([])
  const [categories, setCategories] = useState<Record<string, CategoryInfo>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Fetch category information
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from("cashflow_categories").select("*")

        if (error) throw error

        // Create a lookup map of category_id -> category info
        const categoryMap: Record<string, CategoryInfo> = {}
        data?.forEach((cat) => {
          categoryMap[cat.id] = {
            id: cat.id,
            name: cat.name || "Unknown",
            type: cat.type || "unknown",
          }
        })

        setCategories(categoryMap)
      } catch (err: any) {
        console.error("Error fetching categories:", err)
      }
    }

    fetchCategories()
  }, [supabase])

  // CRITICAL FIX: Directly query Supabase instead of using the API
  useEffect(() => {
    const fetchRecords = async () => {
      if (!fileId) return

      try {
        setLoading(true)
        console.log("🔍 Directly querying Supabase for file ID:", fileId)

        // Direct Supabase query
        const { data, error } = await supabase
          .from("cashflow_records")
          .select("*")
          .eq("source_file_id", fileId)
          .order("year", { ascending: true })

        if (error) throw error

        console.log("📊 Retrieved records:", data?.length || 0)
        setRecords(data || [])
      } catch (err: any) {
        setError(err.message || "Failed to load records")
        console.error("Error fetching records:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [fileId, supabase])

  if (loading) return <p className="text-sm text-muted-foreground">Loading records…</p>
  if (error) return <p className="text-sm text-red-500">Error: {error}</p>
  if (records.length === 0) return <p className="text-sm text-muted-foreground">No records found for this file.</p>

  return (
    <div className="border rounded-lg overflow-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50 text-left font-medium">
          <tr>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Year</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Recurring?</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-t">
              <td className="px-4 py-2">{categories[record.category_id]?.name || "—"}</td>
              <td className="px-4 py-2 capitalize">{categories[record.category_id]?.type || "—"}</td>
              <td className="px-4 py-2">{record.year}</td>
              <td className="px-4 py-2">${record.amount?.toLocaleString()}</td>
              <td className="px-4 py-2">{record.is_recurring ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
