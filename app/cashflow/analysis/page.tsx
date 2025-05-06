"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { BusinessHeader } from "@/components/business-header"
import { EmptyTableState } from "@/components/empty-table-state"

export default function AnalysisPage() {
  const router = useRouter()

  useEffect(() => {
    console.log("🔍 [AnalysisPage] Mounted - No fileId provided")
    console.log("📊 [Analysis] Data state: Empty (no fileId)")
  }, [])

  const handleUploadAction = () => {
    console.log("🧭 [Navigation] Redirecting to tasks for file upload")
    router.push("/cashflow/tasks")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <BusinessHeader
        businessId="mock-business-1"
        title="Analysis"
        description="View financial analysis and insights."
        className="mb-8"
      />

      <div className="border rounded-lg">
        <div className="p-4 border-b bg-muted/10">
          <h2 className="text-lg font-medium">Cash Flow Analysis</h2>
        </div>

        <EmptyTableState
          message="No financial data available"
          actionLabel="Upload File"
          onAction={handleUploadAction}
        />
      </div>
    </div>
  )
}
