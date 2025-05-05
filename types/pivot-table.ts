// Types for Pivot Table component

export interface PivotTableProps {
  // Data props (will be populated later in Sprint 2B)
  data?: {
    years: number[]
    categoryNames: string[]
    byCategory: Record<string, Record<number, number>>
    categories: Record<string, { id: string; name: string; type: string }>
  }
  // Debug props
  debugEmpty?: boolean
  // Display options
  showHeaders?: boolean
  className?: string
}

export interface PivotEmptyStateProps {
  yearCount?: number // Default: 3
  categoryCount?: number // Default: 5
  showMessage?: boolean // Default: true
  message?: string // Default: "Upload a file to begin analyzing cash flow"
  className?: string
}

// Default categories for empty state
export const DEFAULT_CATEGORIES = [
  { name: "Wages", type: "income" },
  { name: "Sales", type: "income" },
  { name: "Rent", type: "expense" },
  { name: "Utilities", type: "expense" },
  { name: "Loan Payment", type: "debt" },
  { name: "Investments", type: "income" },
]

// Generate default years (current year and 2 previous)
export const generateDefaultYears = (): number[] => {
  const currentYear = new Date().getFullYear()
  return [currentYear - 2, currentYear - 1, currentYear]
}
