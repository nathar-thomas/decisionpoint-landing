"use client"

import { useEffect } from "react"
import { CashflowAnalyzer } from "@/components/cashflow-analyzer"

export default function TasksPage() {
  useEffect(() => {
    console.log("🔍 [TasksPage] Mounted")
  }, [])

  return (
    <div>
      <CashflowAnalyzer />
    </div>
  )
}
