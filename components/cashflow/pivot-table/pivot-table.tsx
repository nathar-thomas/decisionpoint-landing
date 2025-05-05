"use client"

import { useState, useEffect, useMemo } from "react"
import { PivotEmptyState } from "./pivot-empty-state"
import { PivotCell } from "./pivot-cell"
import { PivotTotalsColumn } from "./pivot-totals-column"
import { PivotTotalsRow } from "./pivot-totals-row"
import { PivotSummaryCards } from "./pivot-summary-cards"
import {
  calculateRowTotals,
  calculateColumnTotals,
  calculateGrandTotal,
  calculateFinancialSummary,
  getCategoryType,
} from "@/utils/calculate-totals"
import type { PivotTableProps } from "@/types/pivot-table"
import { cn } from "@/lib/utils"

export function PivotTable({
  data,
  debugEmpty = false,
  showHeaders = true,
  showSummaryCards = true,
  className,
}: PivotTableProps) {
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

  // Calculate totals using memoization to prevent unnecessary recalculations
  const { rowTotals, columnTotals, grandTotal, financialSummary } = useMemo(() => {
    if (showEmptyState || !data) {
      return {
        rowTotals: {},
        columnTotals: {},
        grandTotal: 0,
        financialSummary: {
          totalIncome: 0,
          totalExpenses: 0,
          netCashflow: 0,
          incomeByYear: {},
          expensesByYear: {},
          netByYear: {},
        },
      }
    }

    const rowTotals = calculateRowTotals(data.byCategory)
    const columnTotals = calculateColumnTotals(data.byCategory, data.years)
    const grandTotal = calculateGrandTotal(rowTotals)
    const financialSummary = calculateFinancialSummary(data.byCategory, data.categories)

    return { rowTotals, columnTotals, grandTotal, financialSummary }
  }, [data, showEmptyState])

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

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary Cards */}
      {showSummaryCards && (
        <PivotSummaryCards
          totalIncome={financialSummary.totalIncome}
          totalExpenses={financialSummary.totalExpenses}
          netCashflow={financialSummary.netCashflow}
        />
      )}

      {/* Pivot Table */}
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
              <th scope="col" className="py-3 px-6 text-left text-sm font-medium text-muted-foreground border-b">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {categoryNames.map((categoryName) => {
              // Find the category type if available
              const categoryId = Object.keys(categories || {}).find((id) => categories?.[id]?.name === categoryName)
              const categoryType = categoryId
                ? categories?.[categoryId]?.type
                : getCategoryType(categoryName, categories)

              console.log(`📊 Rendering row for category: ${categoryName}`, {
                categoryType,
                yearData: byCategory[categoryName],
                rowTotal: rowTotals[categoryName],
              })

              return (
                <tr key={categoryName} className="hover:bg-muted/50">
                  <th
                    scope="row"
                    className={cn(
                      "py-4 px-4 text-sm font-medium sticky left-0 bg-background border-b",
                      categoryType === "income" && "text-green-700",
                      categoryType === "expense" && "text-red-700",
                      categoryType === "debt" && "text-amber-700",
                    )}
                  >
                    {categoryName}
                  </th>
                  {years.map((year) => {
                    const value = byCategory[categoryName]?.[year]
                    return <PivotCell key={`${categoryName}-${year}`} value={value} categoryType={categoryType} />
                  })}
                  <PivotTotalsColumn total={rowTotals[categoryName]} categoryType={categoryType} />
                </tr>
              )
            })}

            {/* Totals Row */}
            <PivotTotalsRow years={years} columnTotals={columnTotals} grandTotal={grandTotal} />
          </tbody>
        </table>
      </div>
    </div>
  )
}
