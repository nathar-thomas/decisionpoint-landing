"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"

export default function BusinessDocumentsPage() {
  const params = useParams()
  const businessId = params.businessId as string

  useEffect(() => {
    console.log("🔍 [BusinessDocuments] Mounted with businessId:", businessId)
  }, [businessId])

  return (
    <div className="p-8 border rounded-lg bg-muted/10 text-center">
      <p className="text-muted-foreground">Document management features will be available soon.</p>
    </div>
  )
}
