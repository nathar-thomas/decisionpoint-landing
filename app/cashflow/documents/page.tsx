"use client"

import { useEffect } from "react"
import { BusinessHeader } from "@/components/business-header"

export default function DocumentsPage() {
  useEffect(() => {
    console.log("🔍 [DocumentsPage] Mounted")
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <BusinessHeader
        businessId="mock-business-1"
        title="Documents"
        description="Organize and view uploaded business files."
        className="mb-8"
      />

      <div className="p-8 border rounded-lg bg-muted/10 text-center">
        <p className="text-muted-foreground">Document management features will be available soon.</p>
      </div>
    </div>
  )
}
