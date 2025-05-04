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
  user_id: string
  entity_id: string
}

interface CategoryInfo {
  id: string
  name: string
  type: string
}

export default function ParsedCashflowTable({ fileId }: { fileId: string }) {
  const [records, setRecords] = useState<CashflowRecord[]>([])
  const [categories, setCategories] = useState<Record<string, CategoryInfo>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
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

  // Fetch records for the file
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true)
        console.log("🔍 Fetching records for file ID:", fileId)

        const res = await fetch(`/api/cashflow-records/${fileId}`)
        if (!res.ok) {
          const errorText = await res.text()
          console.error("API error response:", errorText)
          throw new Error(`Failed to load cashflow data: ${res.status}`)
        }

        const json = await res.json()
        console.log("📥 Raw API response:", json)

        const { records } = json

        if (records && Array.isArray(records)) {
          setRecords(records)
          console.log("✅ Set records:", records.length)
        } else {
          console.warn("⚠️ No records array in response:", json)
          setRecords([])
        }
      } catch (err: any) {
        setError(err.message || "Unexpected error")
        console.error("Error fetching records:", err)
      } finally {
        setLoading(false)
      }
    }

    if (fileId) {
      fetchRecords()
    }
  }, [fileId])

  // If we have no records but have the fileId, try a direct query
  useEffect(() => {
    const fetchDirectRecords = async () => {
      if (records.length === 0 && !loading && !error) {
        try {
          console.log("🔍 Attempting direct query for file:", fileId)

          const { data, error } = await supabase.from("cashflow_records").select("*").eq("source_file_id", fileId)

          if (error) throw error

          if (data && data.length > 0) {
            console.log("✅ Direct query found records:", data.length)
            setRecords(data)
          } else {
            console.log("⚠️ No records found in direct query")
          }
        } catch (err: any) {
          console.error("Error in direct query:", err)
        }
      }
    }

    fetchDirectRecords()
  }, [records.length, loading, error, fileId, supabase])

  if (loading) return <p className="text-gray-500">Loading records…</p>
  if (error) return <p className="text-red-500">⚠️ {error}</p>
  if (records.length === 0) return <p className="text-gray-400">No parsed data found.</p>

  return (
    <div className="overflow-x-auto border rounded-lg mt-4">
      <table className="min-w-full table-auto text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Year</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Recurring?</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{categories[r.category_id]?.name || r.category_id || "—"}</td>
              <td className="px-4 py-2 capitalize">{categories[r.category_id]?.type || "—"}</td>
              <td className="px-4 py-2">{r.year}</td>
              <td className="px-4 py-2">${r.amount?.toLocaleString()}</td>
              <td className="px-4 py-2">{r.is_recurring ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
