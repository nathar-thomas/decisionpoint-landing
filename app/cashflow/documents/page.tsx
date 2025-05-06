"use client"

import { useEffect } from "react"

export default function DocumentsPage() {
  useEffect(() => {
    console.log("🔍 [DocumentsPage] Mounted")
  }, [])

  return (
    <div className="p-8 border rounded-lg bg-muted/10 text-center">
      <p className="text-muted-foreground">Document management features will be available soon.</p>
    </div>
  )
}
