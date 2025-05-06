"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { CashflowAnalyzer } from "@/components/cashflow-analyzer"

export default function BusinessTasksPage() {
  const params = useParams()
  const businessId = params.businessId as string

  useEffect(() => {
    console.log("🔍 [BusinessTasks] Mounted with businessId:", businessId)
  }, [businessId])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">
          Upload required financial documents to begin analysis and fulfill broker requirements.
        </p>
      </div>

      <CashflowAnalyzer />
    </div>
  )
}
