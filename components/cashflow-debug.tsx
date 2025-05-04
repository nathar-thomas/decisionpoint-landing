"use client"

import { useCashflowAnalysis } from "@/hooks/use-cashflow-analysis"
import { Loader2 } from "lucide-react"

interface CashflowDebugProps {
  fileId: string
}

export function CashflowDebug({ fileId }: CashflowDebugProps) {
  const { data, isLoading, error } = useCashflowAnalysis(fileId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading cashflow data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold">Error loading cashflow data</h3>
        <p>{error.message}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-4 border border-amber-300 bg-amber-50 text-amber-800 rounded-md">
        No data available for this file.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Cashflow Analysis Debug</h2>
        <p className="text-muted-foreground">File: {data.file?.filename || "Unknown file"}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-md bg-green-50">
            <div className="text-sm text-muted-foreground">Total Income</div>
            <div className="text-2xl font-bold text-green-700">${data.summary.totalIncome.toLocaleString()}</div>
          </div>
          <div className="p-4 border rounded-md bg-red-50">
            <div className="text-sm text-muted-foreground">Total Expenses</div>
            <div className="text-2xl font-bold text-red-700">${data.summary.totalExpenses.toLocaleString()}</div>
          </div>
          <div className="p-4 border rounded-md bg-blue-50">
            <div className="text-sm text-muted-foreground">Net Cashflow</div>
            <div className="text-2xl font-bold text-blue-700">${data.summary.totalNet.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Raw Data Structure</h3>
        <div className="overflow-auto max-h-[500px] border rounded-md p-4 bg-gray-50">
          <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
