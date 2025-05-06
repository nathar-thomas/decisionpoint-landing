"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { DocumentsList } from "@/components/documents-list"

export default function BusinessDocumentsPage() {
  const params = useParams()
  const businessId = params.businessId as string

  useEffect(() => {
    console.log("🔍 [BusinessDocuments] Mounted with businessId:", businessId)
  }, [businessId])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">Organize and view uploaded business files.</p>
      </div>

      <DocumentsList />
    </div>
  )
}
