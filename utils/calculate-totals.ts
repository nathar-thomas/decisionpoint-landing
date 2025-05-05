import type { Category } from "@/types/cashflow"

/**
 * Calculate row totals (sum across years for each category)
 * @param byCategory Data organized by category and year
 * @returns Object with category names as keys and total amounts as values
 */
export function calculateRowTotals(byCategory: Record<string, Record<number, number>>): Record<string, number> {
  const rowTotals: Record<string, number> = {}

  Object.entries(byCategory).forEach(([category, yearData]) => {
    rowTotals[category] = Object.values(yearData).reduce((sum, amount) => sum + (amount || 0), 0)
  })

  console.log("🧮 Row totals:", rowTotals)
  return rowTotals
}

/**
 * Calculate column totals (sum across categories for each year)
 * @param byCategory Data organized by category and year
 * @param years Array of years to calculate totals for
 * @returns Object with years as keys and total amounts as values
 */
export function calculateColumnTotals(
  byCategory: Record<string, Record<number, number>>,
  years: number[],
): Record<number, number> {
  const columnTotals: Record<number, number> = {}

  // Initialize totals for each year
  years.forEach((year) => {
    columnTotals[year] = 0
  })

  // Sum up values for each year across all categories
  Object.values(byCategory).forEach((yearData) => {
    years.forEach((year) => {
      columnTotals[year] += yearData[year] || 0
    })
  })

  console.log("📊 Column totals:", columnTotals)
  return columnTotals
}

/**
 * Calculate grand total (sum of all values)
 * @param rowTotals Object with category names as keys and total amounts as values
 * @returns Grand total amount
 */
export function calculateGrandTotal(rowTotals: Record<string, number>): number {
  const grandTotal = Object.values(rowTotals).reduce((sum, amount) => sum + (amount || 0), 0)
  console.log("🏁 Grand total:", grandTotal)
  return grandTotal
}

/**
 * Calculate financial summary (income, expenses, net cashflow)
 * @param byCategory Data organized by category and year
 * @param categories Category metadata including type information
 * @returns Object with summary metrics
 */
export function calculateFinancialSummary(
  byCategory: Record<string, Record<number, number>>,
  categories: Record<string, Category>,
): {
  totalIncome: number
  totalExpenses: number
  netCashflow: number
  incomeByYear: Record<number, number>
  expensesByYear: Record<number, number>
  netByYear: Record<number, number>
} {
  // Initialize summary objects
  const incomeByYear: Record<number, number> = {}
  const expensesByYear: Record<number, number> = {}
  const netByYear: Record<number, number> = {}

  let totalIncome = 0
  let totalExpenses = 0

  // Create a map of category names to types
  const categoryTypeMap: Record<string, string> = {}
  Object.values(categories).forEach((category) => {
    categoryTypeMap[category.name] = category.type
  })

  // Process each category
  Object.entries(byCategory).forEach(([categoryName, yearData]) => {
    const categoryType = categoryTypeMap[categoryName]

    // Sum up values for each year
    Object.entries(yearData).forEach(([yearStr, amount]) => {
      const year = Number.parseInt(yearStr)

      // Initialize year records if needed
      if (!incomeByYear[year]) incomeByYear[year] = 0
      if (!expensesByYear[year]) expensesByYear[year] = 0
      if (!netByYear[year]) netByYear[year] = 0

      // Add to appropriate total based on category type
      if (categoryType === "income") {
        incomeByYear[year] += amount || 0
        totalIncome += amount || 0
      } else if (categoryType === "expense") {
        expensesByYear[year] += amount || 0
        totalExpenses += amount || 0
      }

      // Note: 'debt' and other types are not included in income/expense calculations
    })
  })

  // Calculate net for each year
  Object.keys(incomeByYear).forEach((yearStr) => {
    const year = Number.parseInt(yearStr)
    netByYear[year] = incomeByYear[year] - expensesByYear[year]
  })

  const netCashflow = totalIncome - totalExpenses

  console.log("✅ Summary breakdown:", {
    totalIncome,
    totalExpenses,
    netCashflow,
    incomeByYear,
    expensesByYear,
    netByYear,
  })

  return {
    totalIncome,
    totalExpenses,
    netCashflow,
    incomeByYear,
    expensesByYear,
    netByYear,
  }
}

/**
 * Determine the category type based on name or metadata
 * @param categoryName The name of the category
 * @param categories Category metadata
 * @returns The category type (income, expense, debt, or unknown)
 */
export function getCategoryType(categoryName: string, categories: Record<string, Category>): string {
  // Try to find the category in the metadata
  const category = Object.values(categories).find((cat) => cat.name === categoryName)
  if (category) {
    return category.type
  }

  // Fallback: guess based on name
  const lowerName = categoryName.toLowerCase()
  if (
    lowerName.includes("income") ||
    lowerName.includes("revenue") ||
    lowerName.includes("sales") ||
    lowerName.includes("wage")
  ) {
    return "income"
  }
  if (
    lowerName.includes("expense") ||
    lowerName.includes("cost") ||
    lowerName.includes("rent") ||
    lowerName.includes("utility")
  ) {
    return "expense"
  }
  if (lowerName.includes("loan") || lowerName.includes("debt") || lowerName.includes("mortgage")) {
    return "debt"
  }

  return "unknown"
}
