"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface CashflowRecord {
  id: string
  year: number
  amount: number
  category: {
    id: string
    name: string
    type: string
  }
}

interface CashflowRecordsTableProps {
  fileId: string
}

export function CashflowRecordsTable({ fileId }: CashflowRecordsTableProps) {
  const [records, setRecords] = useState<CashflowRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchRecords() {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from("cashflow_records")
          .select(`
            id, 
            year, 
            amount, 
            category_id,
            category:cashflow_categories(id, name, type)
          `)
          .eq("source_file_id", fileId)
          .order("year", { ascending: true })

        if (error) throw error

        setRecords(data || [])
      } catch (err) {
        console.error("Error fetching records:", err)
        setError(err instanceof Error ? err.message : "Failed to load records")
      } finally {
        setLoading(false)
      }
    }

    if (fileId) {
      fetchRecords()
    }
  }, [fileId, supabase])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "text-green-600"
      case "expense":
        return "text-red-600"
      case "debt":
        return "text-orange-600"
      default:
        return ""
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>Error loading records: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>No records found for this file.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group records by year for better display
  const recordsByYear = records.reduce(
    (acc, record) => {
      if (!acc[record.year]) {
        acc[record.year] = []
      }
      acc[record.year].push(record)
      return acc
    },
    {} as Record<number, CashflowRecord[]>,
  )

  const years = Object.keys(recordsByYear).map(Number).sort()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Records</CardTitle>
        <CardDescription>Showing {records.length} records from the uploaded file</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              {years.map((year) => (
                <TableHead key={year} className="text-right">
                  {year}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {records
              .filter((record, index, self) => index === self.findIndex((r) => r.category.id === record.category.id))
              .map((record) => (
                <TableRow key={record.category.id}>
                  <TableCell className="font-medium">{record.category.name}</TableCell>
                  <TableCell className={getTypeColor(record.category.type)}>
                    {record.category.type.charAt(0).toUpperCase() + record.category.type.slice(1)}
                  </TableCell>
                  {years.map((year) => {
                    const yearRecord = records.find((r) => r.category.id === record.category.id && r.year === year)
                    return (
                      <TableCell key={year} className="text-right">
                        {yearRecord ? formatCurrency(yearRecord.amount) : "-"}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
