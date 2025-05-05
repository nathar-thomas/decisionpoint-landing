"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCashflowAnalysis } from "@/hooks/use-cashflow-analysis"
import { PivotTable } from "@/components/cashflow/pivot-table/pivot-table"
import { PivotSummaryCards } from "@/components/cashflow/pivot-table/pivot-summary-cards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, FileText, AlertCircle } from "lucide-react"

// View mode enum
enum ViewMode {
  BASIC = "basic",
  DETAILED = "detailed",
}

export default function CashflowAnalysisPage({
  params,
}: {
  params: { fileId: string }
}) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DETAILED)
  const { data, isLoading, error } = useCashflowAnalysis(params.fileId)

  // Check if we're in debug mode (via URL parameter)
  const isDebugMode =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "true"

  // Log categories when data changes
  useEffect(() => {
    if (data?.categoryNames) {
      console.log(`📊 Rendering ${data.categoryNames.length} categories:`, data.categoryNames)
    }
  }, [data?.categoryNames])

  // Handle view mode toggle
  const handleViewModeToggle = (newMode: string) => {
    console.log(`🔄 View mode toggled: ${viewMode} → ${newMode}`)
    setViewMode(newMode as ViewMode)
  }

  // Handle back to upload
  const handleBackToUpload = () => {
    console.log("⬅️ Navigating back to upload page")
    router.push("/cashflow")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button */}
      <Button variant="ghost" onClick={handleBackToUpload} className="mb-4 hover:bg-slate-100">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Upload
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cashflow Analysis</CardTitle>
          <CardDescription>
            {data?.file?.filename ? (
              <>
                File: <span className="font-medium">{data.file.filename}</span>
              </>
            ) : (
              "Analyzing cashflow data"
            )}
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
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="font-bold">Error loading cashflow data</h3>
                  <p>{error.message}</p>
                </div>
              </div>
            </div>
          ) : data ? (
            <Tabs defaultValue={viewMode} onValueChange={handleViewModeToggle}>
              <TabsList className="mb-4">
                <TabsTrigger value={ViewMode.BASIC}>Basic View</TabsTrigger>
                <TabsTrigger value={ViewMode.DETAILED}>Detailed View</TabsTrigger>
              </TabsList>

              <TabsContent value={ViewMode.BASIC}>
                {/* Summary cards only */}
                <PivotSummaryCards
                  totalIncome={data.summary.totalIncome}
                  totalExpenses={data.summary.totalExpenses}
                  netCashflow={data.summary.totalNet}
                />

                <div className="text-center text-sm text-muted-foreground mt-8">
                  <p>Switch to Detailed View to see the complete breakdown by category and year.</p>
                </div>
              </TabsContent>

              <TabsContent value={ViewMode.DETAILED}>
                {/* Full pivot table with summary cards */}
                <PivotTable
                  data={{
                    years: data.years || [],
                    categoryNames: data.categoryNames || [],
                    byCategory: data.byCategory || {},
                    categories: data.categories || {},
                  }}
                  showSummaryCards={true}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="p-4 border border-amber-300 bg-amber-50 text-amber-800 rounded-md">
              No data available for this file.
            </div>
          )}

          {/* Debug panel - only shown in debug mode */}
          {isDebugMode && data && (
            <div className="mt-8 border p-4 rounded-md bg-slate-50">
              <div className="flex items-center mb-2">
                <FileText className="h-4 w-4 mr-2" />
                <h3 className="text-sm font-medium">Raw Data (Debug Mode)</h3>
              </div>
              <pre className="text-xs overflow-auto max-h-[300px] bg-white p-2 rounded border">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
