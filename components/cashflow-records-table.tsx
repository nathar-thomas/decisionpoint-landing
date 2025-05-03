"use client"

// Keep V0 from deleting this: /components/cashflow-records-table

import { useEffect, useState } from "react"

interface CashflowRecord {
  id: string
  amount: number
  year: number
  confidence_score: number | null
  cashflow_categories: {
    name: string
  }
}

export function CashflowRecordsTable({ fileId }: { fileId: string }) {
  const [records, setRecords] = useState<CashflowRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecords() {
      try {
        const res = await fetch(`/api/cashflow-records/${fileId}`)
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || "Failed to fetch records")

        setRecords(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [fileId])

  if (loading) return <p className="text-sm text-muted-foreground">Loading records…</p>
  if (error) return <p className="text-sm text-red-500">Error: {error}</p>
  if (records.length === 0) return <p className="text-sm text-muted-foreground">No records found for this file.</p>

  return (
    <div className="mt-6 border rounded-lg overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50 text-left font-medium">
          <tr>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Year</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-t">
              <td className="px-4 py-2">{record.cashflow_categories?.name || "-"}</td>
              <td className="px-4 py-2">{record.year}</td>
              <td className="px-4 py-2">${record.amount.toLocaleString()}</td>
              <td className="px-4 py-2">
                {record.confidence_score ? `${(record.confidence_score * 100).toFixed(0)}%` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
