"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { BusinessHeader } from "@/components/business-header"

export default function BusinessOverviewPage() {
  const params = useParams()
  const businessId = params.businessId as string

  useEffect(() => {
    console.log("🔍 [BusinessOverview] Mounted with businessId:", businessId)
  }, [businessId])

  return (
    <div className="space-y-8">
      <BusinessHeader
        businessId={businessId}
        title="Business Profile"
        description="Manage this business's readiness, analysis, and documents."
      />

      <div className="p-8 border rounded-lg bg-muted/10">
        <h2 className="text-xl font-medium mb-4">Overview</h2>
        <p className="text-muted-foreground">
          Welcome to the business profile overview. Select a tab above to manage tasks, view analysis, or access
          documents.
        </p>
      </div>
    </div>
  )
}
