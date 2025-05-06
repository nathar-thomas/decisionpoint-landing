"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { EmptyTableState } from "@/components/empty-table-state"

export default function BusinessAnalysisPage() {
  const router = useRouter()
  const params = useParams()
  const businessId = params.businessId as string

  useEffect(() => {
    console.log("🔍 [BusinessAnalysis] Mounted with businessId:", businessId)
    console.log("📊 [Analysis] Data state: Empty (no fileId)")
  }, [businessId])

  const handleUploadAction = () => {
    console.log("🧭 [Navigation] Redirecting to tasks for file upload")
    router.push(`/business/${businessId}/tasks`)
  }

  return (
    <div className="border rounded-lg">
      <div className="p-4 border-b bg-muted/10">
        <h2 className="text-lg font-medium">Cash Flow Analysis</h2>
      </div>

      <EmptyTableState message="No financial data available" actionLabel="Upload File" onAction={handleUploadAction} />
    </div>
  )
}
