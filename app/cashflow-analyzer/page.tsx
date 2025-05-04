// Replace the entire contents with a simpler implementation that uses our unified component
import { CashflowAnalyzer } from "@/components/cashflow-analyzer"

export default function CashflowAnalyzerPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <CashflowAnalyzer />
    </div>
  )
}
