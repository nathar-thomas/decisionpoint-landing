import { formatCurrency } from "@/utils/format-currency"
import { cn } from "@/lib/utils"
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, TrendingUp, TrendingDown } from "lucide-react"

interface PivotSummaryCardsProps {
  totalIncome: number
  totalExpenses: number
  netCashflow: number
  className?: string
  showIcons?: boolean
  showTrends?: boolean
}

export function PivotSummaryCards({
  totalIncome,
  totalExpenses,
  netCashflow,
  className,
  showIcons = true,
  showTrends = false,
}: PivotSummaryCardsProps) {
  // Calculate percentage of expenses to income
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0

  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-3 mb-6", className)}>
      {/* Income Card */}
      <div className="bg-green-50 border border-green-100 rounded-lg p-4">
        <div className="flex justify-between items-center mb-1">
          <div className="text-sm text-green-800 font-medium">Total Income</div>
          {showIcons && <TrendingUp className="h-4 w-4 text-green-600" />}
        </div>
        <div className="text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</div>
        {showTrends && <div className="text-xs text-green-600 mt-2">Primary source of funds</div>}
      </div>

      {/* Expenses Card */}
      <div className="bg-red-50 border border-red-100 rounded-lg p-4">
        <div className="flex justify-between items-center mb-1">
          <div className="text-sm text-red-800 font-medium">Total Expenses</div>
          {showIcons && <TrendingDown className="h-4 w-4 text-red-600" />}
        </div>
        <div className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</div>
        {showTrends && <div className="text-xs text-red-600 mt-2">{expenseRatio.toFixed(1)}% of income</div>}
      </div>

      {/* Net Cashflow Card */}
      <div
        className={cn(
          "border rounded-lg p-4",
          netCashflow >= 0 ? "bg-blue-50 border-blue-100" : "bg-amber-50 border-amber-100",
        )}
      >
        <div
          className={cn(
            "flex justify-between items-center mb-1",
            netCashflow >= 0 ? "text-blue-800" : "text-amber-800",
          )}
        >
          <div className="text-sm font-medium">Net Cashflow</div>
          {showIcons && (
            <div>
              {netCashflow > 0 && <ArrowUpIcon className="h-4 w-4 text-green-600" />}
              {netCashflow < 0 && <ArrowDownIcon className="h-4 w-4 text-red-600" />}
              {netCashflow === 0 && <MinusIcon className="h-4 w-4 text-gray-600" />}
            </div>
          )}
        </div>
        <div className={cn("text-2xl font-bold", netCashflow >= 0 ? "text-blue-700" : "text-amber-700")}>
          {formatCurrency(netCashflow)}
        </div>
        {showTrends && (
          <div className={cn("text-xs mt-2", netCashflow >= 0 ? "text-blue-600" : "text-amber-600")}>
            {netCashflow >= 0 ? "Positive cash flow" : "Negative cash flow"}
          </div>
        )}
      </div>
    </div>
  )
}
