// Types for raw database records
export interface CashflowRecord {
  id: string
  user_id: string
  entity_id: string
  category_id: string
  year: number
  amount: number
  source_file_id: string
  is_recurring: boolean
  notes?: string // For future implementation
}

export interface Category {
  id: string
  name: string
  type: string // 'income', 'expense', 'debt', etc.
  is_system: boolean
}

export interface UploadedFile {
  id: string
  user_id: string
  filename: string
  file_path: string
  file_type: string
  status: string
  created_at: string
  processed_at: string | null
  entity_id: string | null
}

// Types for transformed/pivoted data
export interface PivotedCashflow {
  // Category name -> Year -> Amount
  byCategory: Record<string, Record<number, number>>
  // Year -> Category name -> Amount
  byYear: Record<number, Record<string, number>>
  // Category ID -> Category details
  categories: Record<string, Category>
  // List of all years in the data
  years: number[]
  // List of all category names
  categoryNames: string[]
  // Summary metrics
  summary: CashflowSummary
  // Raw records
  records: CashflowRecord[]
  // File details
  file: UploadedFile | null
}

export interface CashflowSummary {
  // Total income by year
  incomeByYear: Record<number, number>
  // Total expenses by year
  expensesByYear: Record<number, number>
  // Net cashflow by year (income - expenses)
  netByYear: Record<number, number>
  // Totals across all years
  totalIncome: number
  totalExpenses: number
  totalNet: number
}

// Hook return type
export interface UseCashflowAnalysisReturn {
  data: PivotedCashflow | null
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
}
