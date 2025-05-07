"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { TasksCategoryView } from "@/components/tasks/tasks-category-view"

export default function BusinessTasksPage() {
  const params = useParams()
  const businessId = params.businessId as string

  // Add UUID validation function
  const isValidUUID = (uuid: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)

  useEffect(() => {
    // Log validation steps at the page level
    console.log("[BusinessTasks] Mounted with businessId:", businessId)
    console.log("[BusinessTasks] UUID is valid:", isValidUUID(businessId))

    // Add debug flag for conditional visual logging
    const isDebugMode =
      process.env.NODE_ENV === "development" ||
      (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "true")

    if (isDebugMode) {
      console.log("[BusinessTasks] Debug mode enabled")
    }

    return () => {
      console.log("[BusinessTasks] Unmounting component")
    }
  }, [businessId])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">Complete the required tasks to prepare your business for listing.</p>
      </div>

      <TasksCategoryView businessId={businessId} />
    </div>
  )
}
