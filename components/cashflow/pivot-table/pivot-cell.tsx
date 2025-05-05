import { formatCurrency } from "@/utils/format-currency"
import { cn } from "@/lib/utils"

interface PivotCellProps {
  value: number | undefined | null
  categoryType?: string
  isTotal?: boolean
  className?: string
}

export function PivotCell({ value, categoryType, isTotal = false, className }: PivotCellProps) {
  // Format the value as currency
  const formattedValue = formatCurrency(value)

  // For Sprint 2B, we're not implementing color coding yet
  // This will be added in a future sprint

  return <td className={cn("py-4 px-6 text-sm border-b", isTotal && "font-medium", className)}>{formattedValue}</td>
}
