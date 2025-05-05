import { formatCurrency } from "@/utils/format-currency"
import { cn } from "@/lib/utils"

interface PivotTotalsRowProps {
  years: number[]
  columnTotals: Record<number, number>
  grandTotal: number
  className?: string
}

export function PivotTotalsRow({ years, columnTotals, grandTotal, className }: PivotTotalsRowProps) {
  return (
    <tr className={cn("bg-muted/50", className)}>
      <th
        scope="row"
        className="py-4 px-4 text-sm font-medium sticky left-0 bg-muted/50 border-b"
        aria-label="Total for all categories"
      >
        Total
      </th>

      {years.map((year) => (
        <td
          key={year}
          className="py-4 px-6 text-sm font-medium text-muted-foreground border-b"
          aria-label={`Total for year ${year}: ${formatCurrency(columnTotals[year])}`}
        >
          {formatCurrency(columnTotals[year])}
        </td>
      ))}

      <td
        className="py-4 px-6 text-sm font-bold text-muted-foreground border-b"
        aria-label={`Grand total: ${formatCurrency(grandTotal)}`}
      >
        {formatCurrency(grandTotal)}
      </td>
    </tr>
  )
}
