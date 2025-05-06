"use client"

import { useEffect } from "react"
import { DocumentsList } from "@/components/documents-list"

export default function DocumentsPage() {
  useEffect(() => {
    console.log("🔍 [DocumentsPage] Mounted")
  }, [])

  return (
    <div>
      <DocumentsList businessId="mock-business-1" />
    </div>
  )
}
