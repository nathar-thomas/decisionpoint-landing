"use client"

import { useEffect, useState } from "react"

interface CashflowRecord {
  id: string
  year: number
  amount: number
  is_recurring: boolean
  category_id: string
  user_id: string
  entity_id: string
  source_file_id: string
  created_at?: string
  updated_at?: string
  confidence_score?: number
  notes?: string
}

export default function ParsedCashflowTable({ fileId }: { fileId: string }) {
  const [records, setRecords] = useState<CashflowRecord[]>([])
  const [categories, setCategories] = useState<Record<string, { name: string; type: string }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true)
        console.log(`🔍 Fetching records for fileId: ${fileId}`)

        const res = await fetch(`/api/cashflow-records/${fileId}`)
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Failed to load cashflow data: ${errorText}`)
        }

        const json = await res.json()
        console.log("📥 Raw API response:", json)

        const { records } = json

        if (!records || !Array.isArray(records)) {
          throw new Error("Invalid response format: records not found or not an array")
        }

        setRecords(records)

        // Fetch categories for the category_ids
        const categoryIds = [...new Set(records.map((r) => r.category_id))]
        if (categoryIds.length > 0) {
          await fetchCategories(categoryIds)
        }
      } catch (err: any) {
        console.error("❌ Error in ParsedCashflowTable:", err)
        setError(err.message || "Unexpected error")
      } finally {
        setLoading(false)
      }
    }

    const fetchCategories = async (categoryIds: string[]) => {
      try {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: categoryIds }),
        })

        if (!res.ok) throw new Error("Failed to fetch categories")

        const { categories } = await res.json()
        const categoryMap: Record<string, { name: string; type: string }> = {}

        categories.forEach((cat: any) => {
          categoryMap[cat.id] = { name: cat.name, type: cat.type }
        })

        setCategories(categoryMap)
      } catch (err) {
        console.error("Failed to fetch categories:", err)
      }
    }

    if (fileId) {
      fetchRecords()
    }
  }, [fileId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) return <p className="text-gray-500">Loading records…</p>
  if (error) return <p className="text-red-500">⚠️ {error}</p>
  if (records.length === 0) return <p className="text-gray-400">No parsed data found.</p>

  return (
    <div className="overflow-x-auto border rounded-lg mt-4">
      <table className="min-w-full table-auto text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Year</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Recurring?</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">
                {categories[r.category_id]?.name || `Category ${r.category_id.slice(0, 4)}...`}
              </td>
              <td className="px-4 py-2">{r.year}</td>
              <td className="px-4 py-2">{formatCurrency(r.amount)}</td>
              <td className="px-4 py-2">{r.is_recurring ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
