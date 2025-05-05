"use client"

import { useState, useEffect } from "react"
import { PivotEmptyState } from "./pivot-empty-state"
import type { PivotTableProps } from "@/types/pivot-table"
import { cn } from "@/lib/utils"

export function PivotTable({ data, debugEmpty = false, showHeaders = true, className }: PivotTableProps) {
  // Track if we have real data to display
  const [hasData, setHasData] = useState(false)

  // Check if we have data to display
  useEffect(() => {
    const hasValidData =
      data && data.years && data.years.length > 0 && data.categoryNames && data.categoryNames.length > 0

    console.log("📦 PivotTable data check", {
      hasValidData,
      yearCount: data?.years?.length || 0,
      categoryCount: data?.categoryNames?.length || 0,
    })

    setHasData(hasValidData)
  }, [data])

  // For debugging, allow forcing empty state
  const showEmptyState = debugEmpty || !hasData

  console.log("📦 PivotTable rendering", {
    showEmptyState,
    debugEmpty,
    hasData,
    years: data?.years || [],
    categories: data?.categoryNames || [],
  })

  // Render empty state if no data or debug mode is on
  if (showEmptyState) {
    return <PivotEmptyState className={className} />
  }

  // This is a placeholder for the real data rendering that will be implemented in Sprint 2B
  // In Sprint 2A, we're focusing only on the empty state and component structure
  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-x-auto">
        <div className="bg-green-50 text-green-800 p-4 rounded-md text-center text-sm">
          Real data rendering will be implemented in Sprint 2B.
          <br />
          The table has valid data to display, but the rendering is not yet implemented.
        </div>
      </div>
    </div>
  )
}
