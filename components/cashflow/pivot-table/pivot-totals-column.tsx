import { formatCurrency } from "@/utils/format-currency"
import { cn } from "@/lib/utils"

interface PivotTotalsColumnProps {
  total: number
  categoryType?: string
  className?: string
}

export function PivotTotalsColumn({ total, categoryType, className }: PivotTotalsColumnProps) {
  // Format the total as currency
  const formattedTotal = formatCurrency(total)

  // Determine styling based on category type
  const getCellStyle = () => {
    if (categoryType === "income") return "font-medium"
    if (categoryType === "expense") return "font-medium"
    if (categoryType === "debt") return "font-medium"
    return "font-medium"
  }

  return (
    <td
      className={cn("py-4 px-6 text-sm border-b font-medium", getCellStyle(), className)}
      aria-label={`Total: ${formattedTotal}`}
    >
      {formattedTotal}
    </td>
  )
}
