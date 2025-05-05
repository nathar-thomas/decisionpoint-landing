"use client"

import { useCashflowAnalysis } from "@/hooks/use-cashflow-analysis"
import { PivotTable } from "@/components/cashflow/pivot-table/pivot-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function CashflowAnalysisPage({
  params,
}: {
  params: { fileId: string }
}) {
  const { data, isLoading, error } = useCashflowAnalysis(params.fileId)

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cashflow Analysis</CardTitle>
          <CardDescription>
            {data?.file?.filename ? `File: ${data.file.filename}` : "Analyzing cashflow data"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span>Loading cashflow data...</span>
            </div>
          ) : error ? (
            <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
              <h3 className="font-bold">Error loading cashflow data</h3>
              <p>{error.message}</p>
            </div>
          ) : (
            <PivotTable
              data={{
                years: data?.years || [],
                categoryNames: data?.categoryNames || [],
                byCategory: data?.byCategory || {},
                categories: data?.categories || {},
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
