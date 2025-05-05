"use client"

import { DEFAULT_CATEGORIES, generateDefaultYears, type PivotEmptyStateProps } from "@/types/pivot-table"
import { cn } from "@/lib/utils"

export function PivotEmptyState({
  yearCount = 3,
  categoryCount = 5,
  showMessage = true,
  message = "Upload a file to begin analyzing cash flow",
  className,
}: PivotEmptyStateProps) {
  // Generate placeholder years and categories
  const years = generateDefaultYears().slice(0, yearCount)
  const categories = DEFAULT_CATEGORIES.slice(0, categoryCount)

  console.log("📦 PivotEmptyState rendering", { years, categories })

  return (
    <div className={cn("space-y-4", className)}>
      {showMessage && (
        <div className="bg-muted/50 text-muted-foreground p-4 rounded-md text-center text-sm">{message}</div>
      )}

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
            {categories.map((category, index) => (
              <tr key={index} className="hover:bg-muted/50">
                <th
                  scope="row"
                  className={cn(
                    "py-4 px-4 text-sm font-medium sticky left-0 bg-background border-b",
                    category.type === "income" && "text-green-700",
                    category.type === "expense" && "text-red-700",
                    category.type === "debt" && "text-amber-700",
                  )}
                >
                  {category.name}
                </th>
                {years.map((year) => (
                  <td key={year} className="py-4 px-6 text-sm text-muted-foreground border-b">
                    --
                  </td>
                ))}
                <td className="py-4 px-6 text-sm font-medium text-muted-foreground border-b">--</td>
              </tr>
            ))}
            <tr className="bg-muted/50">
              <th scope="row" className="py-4 px-4 text-sm font-medium sticky left-0 bg-muted/50 border-b">
                Total
              </th>
              {years.map((year) => (
                <td key={year} className="py-4 px-6 text-sm font-medium text-muted-foreground border-b">
                  --
                </td>
              ))}
              <td className="py-4 px-6 text-sm font-medium text-muted-foreground border-b">--</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
