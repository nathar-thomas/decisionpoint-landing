"use client"

import { useState, useEffect } from "react"
import { PivotEmptyState } from "./pivot-empty-state"
import { PivotCell } from "./pivot-cell"
import type { PivotTableProps } from "@/types/pivot-table"
import { cn } from "@/lib/utils"

export function PivotTable({ data, debugEmpty = false, showHeaders = true, className }: PivotTableProps) {
  // Track if we have real data to display
  const [hasData, setHasData] = useState(false)

  // Check if we have data to display
  useEffect(() => {
    const hasValidData =
      data && data.years && data.years.length > 0 && data.categoryNames && data.categoryNames.length > 0

    console.log("📊 PivotTable data check", {
      hasValidData,
      yearCount: data?.years?.length || 0,
      categoryCount: data?.categoryNames?.length || 0,
    })

    setHasData(hasValidData)
  }, [data])

  // For debugging, allow forcing empty state
  const showEmptyState = debugEmpty || !hasData

  console.log("📊 PivotTable rendering", {
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

  // Now we're rendering real data
  const { years, categoryNames, byCategory, categories } = data!

  // Log the data we're working with
  console.log("📊 PivotTable rendering with data", {
    years,
    categoryCount: categoryNames.length,
    sampleCategory: categoryNames[0],
    sampleData: byCategory[categoryNames[0]],
  })

  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse" role="table">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3 px-4 text-left text-sm font-medium text-muted-foreground sticky left-0 bg-background border-b"
              >
                Category
              </th>
              {years.map((year) => (
                <th
                  key={year}
                  scope="col"
                  className="py-3 px-6 text-left text-sm font-medium text-muted-foreground border-b"
                >
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categoryNames.map((categoryName) => {
              // Find the category type if available
              const categoryId = Object.keys(categories || {}).find((id) => categories?.[id]?.name === categoryName)
              const categoryType = categoryId ? categories?.[categoryId]?.type : undefined

              console.log(`📊 Rendering row for category: ${categoryName}`, {
                categoryType,
                yearData: byCategory[categoryName],
              })

              return (
                <tr key={categoryName} className="hover:bg-muted/50">
                  <th scope="row" className={cn("py-4 px-4 text-sm font-medium sticky left-0 bg-background border-b")}>
                    {categoryName}
                  </th>
                  {years.map((year) => {
                    const value = byCategory[categoryName]?.[year]
                    console.log(`📊 Cell value for ${categoryName}, ${year}:`, value)

                    return <PivotCell key={`${categoryName}-${year}`} value={value} categoryType={categoryType} />
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
