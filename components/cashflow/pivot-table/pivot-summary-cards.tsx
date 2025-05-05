import { formatCurrency } from "@/utils/format-currency"
import { cn } from "@/lib/utils"
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react"

interface PivotSummaryCardsProps {
  totalIncome: number
  totalExpenses: number
  netCashflow: number
  className?: string
}

export function PivotSummaryCards({ totalIncome, totalExpenses, netCashflow, className }: PivotSummaryCardsProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-3 mb-6", className)}>
      {/* Income Card */}
      <div className="bg-green-50 border border-green-100 rounded-lg p-4">
        <div className="text-sm text-green-800 font-medium mb-1">Total Income</div>
        <div className="text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</div>
      </div>

      {/* Expenses Card */}
      <div className="bg-red-50 border border-red-100 rounded-lg p-4">
        <div className="text-sm text-red-800 font-medium mb-1">Total Expenses</div>
        <div className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</div>
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
            "text-sm font-medium mb-1 flex items-center",
            netCashflow >= 0 ? "text-blue-800" : "text-amber-800",
          )}
        >
          Net Cashflow
          {netCashflow > 0 && <ArrowUpIcon className="h-4 w-4 ml-1 text-green-600" />}
          {netCashflow < 0 && <ArrowDownIcon className="h-4 w-4 ml-1 text-red-600" />}
          {netCashflow === 0 && <MinusIcon className="h-4 w-4 ml-1 text-gray-600" />}
        </div>
        <div className={cn("text-2xl font-bold", netCashflow >= 0 ? "text-blue-700" : "text-amber-700")}>
          {formatCurrency(netCashflow)}
        </div>
      </div>
    </div>
  )
}
