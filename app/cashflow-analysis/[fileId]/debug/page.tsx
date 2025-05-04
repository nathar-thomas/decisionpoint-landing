"use client"

import { CashflowDebug } from "@/components/cashflow-debug"

export default function CashflowAnalysisDebugPage({
  params,
}: {
  params: { fileId: string }
}) {
  return (
    <div className="container mx-auto py-8 px-4">
      <CashflowDebug fileId={params.fileId} />
    </div>
  )
}
