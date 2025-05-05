"use client"

import { useState } from "react"
import { PivotTable } from "@/components/cashflow/pivot-table/pivot-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { generateDefaultYears, DEFAULT_CATEGORIES } from "@/types/pivot-table"

export default function PivotTableTestPage() {
  // State for toggle options
  const [debugEmpty, setDebugEmpty] = useState(true)
  const [hasData, setHasData] = useState(false)

  // Mock data for testing
  const mockData = hasData
    ? {
        years: generateDefaultYears(),
        categoryNames: DEFAULT_CATEGORIES.map((c) => c.name),
        byCategory: DEFAULT_CATEGORIES.reduce(
          (acc, category) => {
            const yearData = generateDefaultYears().reduce(
              (yearAcc, year) => {
                yearAcc[year] = Math.round(Math.random() * 10000) / 100
                return yearAcc
              },
              {} as Record<number, number>,
            )

            acc[category.name] = yearData
            return acc
          },
          {} as Record<string, Record<number, number>>,
        ),
        categories: DEFAULT_CATEGORIES.reduce(
          (acc, cat, index) => {
            acc[`cat-${index}`] = {
              id: `cat-${index}`,
              name: cat.name,
              type: cat.type,
            }
            return acc
          },
          {} as Record<string, { id: string; name: string; type: string }>,
        ),
      }
    : undefined

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pivot Table Test (Sprint 2A)</CardTitle>
          <CardDescription>Testing the core table structure and empty state rendering</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <Switch id="debug-empty" checked={debugEmpty} onCheckedChange={setDebugEmpty} />
              <Label htmlFor="debug-empty">Force Empty State</Label>
            </div>

            <div className="flex items-center space-x-4">
              <Switch id="mock-data" checked={hasData} onCheckedChange={setHasData} disabled={debugEmpty} />
              <Label htmlFor="mock-data" className={debugEmpty ? "text-muted-foreground" : ""}>
                Toggle Mock Data
              </Label>
            </div>

            <Button
              variant="outline"
              onClick={() => console.log("Current PivotTable state:", { debugEmpty, hasData, mockData })}
            >
              Log State
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="border rounded-lg p-6 bg-white">
        <PivotTable data={mockData} debugEmpty={debugEmpty} />
      </div>

      <div className="mt-8 text-sm text-muted-foreground">
        <h3 className="font-medium text-foreground mb-2">Component Notes:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>The empty state shows placeholder years and categories</li>
          <li>Categories are color-coded based on type (income, expense, debt)</li>
          <li>The table has a responsive design with a sticky first column</li>
          <li>Toggle "Force Empty State" to always show the empty state</li>
          <li>Toggle "Mock Data" to simulate having data (will be fully implemented in Sprint 2B)</li>
        </ul>
      </div>
    </div>
  )
}
