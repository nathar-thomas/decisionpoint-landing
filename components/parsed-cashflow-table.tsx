"use client"

import { useEffect, useState } from "react"

interface CashflowRecord {
  id: string
  year: number
  amount: number
  is_recurring: boolean
  source_file_id: string
  cashflow_categories: { name: string }
  category_id: string
}

export default function ParsedCashflowTable({ fileId }: { fileId: string }) {
  const [records, setRecords] = useState<CashflowRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/cashflow-records/${fileId}`)
        if (!res.ok) throw new Error("Failed to load cashflow data")

        const json = await res.json()
        console.log("📥 Raw API response:", json)

        const { records } = json
        setRecords(records || [])
      } catch (err: any) {
        setError(err.message || "Unexpected error")
        console.error("Error fetching records:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [fileId])

  if (loading) return <p className="text-gray-500">Loading records…</p>
  if (error) return <p className="text-red-500">⚠️ {error}</p>
  if (records.length === 0) return <p className="text-gray-400">No parsed data found.</p>

  return (
    <div className="overflow-x-auto border rounded-lg mt-4">
      <table className="min-w-full table-auto text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-4 py-2">Category ID</th>
            <th className="px-4 py-2">Year</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Recurring?</th>
          </tr>
        </thead>
        <tbody>
          {records.length > 0 ? (
            records.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{r.category_id || "—"}</td>
                <td className="px-4 py-2">{r.year}</td>
                <td className="px-4 py-2">${r.amount?.toLocaleString()}</td>
                <td className="px-4 py-2">{r.is_recurring ? "Yes" : "No"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-4 py-2 text-center text-gray-500">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
