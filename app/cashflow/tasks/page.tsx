"use client"

import { useEffect } from "react"
import { CashflowAnalyzer } from "@/components/cashflow-analyzer"
import { BusinessHeader } from "@/components/business-header"

export default function TasksPage() {
  useEffect(() => {
    console.log("🔍 [TasksPage] Mounted")
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <BusinessHeader
        businessId="mock-business-1"
        title="Tasks"
        description="Upload and complete required documentation."
        className="mb-8"
      />

      <CashflowAnalyzer />
    </div>
  )
}
