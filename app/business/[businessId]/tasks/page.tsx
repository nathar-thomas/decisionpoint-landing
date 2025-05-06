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

  return <CashflowAnalyzer />
}
