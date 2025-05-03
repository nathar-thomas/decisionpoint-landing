"use client"

import { useEffect, useState } from "react"

interface CashflowRecord {
  id: string
  amount: number
  year: number
  confidence_score: number | null
  category: {
    name: string
    type: string
  }
}

interface FileInfo {
  id: string
  filename: string
  created_at: string
  processed_at: string
}

interface Summary {
  total_records: number
  years: number[]
  income_sum: number
  expense_sum: number
  debt_sum: number
}

export function CashflowRecordsTable({ fileId }: { fileId: string }) {
  const [records, setRecords] = useState<CashflowRecord[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecords() {
      try {
        const res = await fetch(`/api/cashflow-records/${fileId}`)
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || "Failed to fetch records")

        setRecords(data.records || [])
        setSummary(data.summary || null)
        setFileInfo(data.file || null)
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
    <div className="space-y-6">
      {summary && (
        <div className="border p-4 rounded bg-muted/20">
          <p className="font-medium text-sm">Summary</p>
          <ul className="text-sm mt-2 space-y-1">
            <li>Total Records: {summary.total_records}</li>
            <li>Years Covered: {summary.years.join(", ")}</li>
            <li>Income: ${summary.income_sum.toLocaleString()}</li>
            <li>Expenses: ${summary.expense_sum.toLocaleString()}</li>
            <li>Debt: ${summary.debt_sum.toLocaleString()}</li>
          </ul>
        </div>
      )}

      <div className="border rounded-lg overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50 text-left font-medium">
            <tr>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Year</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-t">
                <td className="px-4 py-2">{record.category?.name || "-"}</td>
                <td className="px-4 py-2 capitalize">{record.category?.type || "-"}</td>
                <td className="px-4 py-2">{record.year}</td>
                <td className="px-4 py-2">${record.amount.toLocaleString()}</td>
                <td className="px-4 py-2">
                  {record.confidence_score != null
                    ? `${(record.confidence_score * 100).toFixed(0)}%`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
