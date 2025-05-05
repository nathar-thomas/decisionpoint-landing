"use client"

import { useCashflowAnalysis } from "@/hooks/use-cashflow-analysis"
import { PivotTable } from "@/components/cashflow/pivot-table/pivot-table"
import { CashflowDebug } from "@/components/cashflow-debug"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CashflowAnalysisDebugPage({
  params,
}: {
  params: { fileId: string }
}) {
  const { data, isLoading, error } = useCashflowAnalysis(params.fileId)
  const [debugEmpty, setDebugEmpty] = useState(false)

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cashflow Analysis Debug</CardTitle>
          <CardDescription>
            {data?.file?.filename ? `File: ${data.file.filename}` : "Analyzing cashflow data"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Switch id="debug-empty" checked={debugEmpty} onCheckedChange={setDebugEmpty} />
            <Label htmlFor="debug-empty">Force Empty State</Label>

            <Button variant="outline" size="sm" className="ml-auto" onClick={() => console.log("Current data:", data)}>
              Log Data
            </Button>
          </div>

          <Tabs defaultValue="table">
            <TabsList>
              <TabsTrigger value="table">Pivot Table</TabsTrigger>
              <TabsTrigger value="raw">Raw Data</TabsTrigger>
            </TabsList>
            <TabsContent value="table">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mr-2"></div>
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
                  debugEmpty={debugEmpty}
                />
              )}
            </TabsContent>
            <TabsContent value="raw">
              <CashflowDebug fileId={params.fileId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
