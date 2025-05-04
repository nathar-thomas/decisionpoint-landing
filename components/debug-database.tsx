"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugDatabase() {
  const [isVisible, setIsVisible] = useState(false)
  const [files, setFiles] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch files
      const { data: filesData } = await supabase
        .from("uploaded_files")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      setFiles(filesData || [])

      // Fetch records
      const { data: recordsData } = await supabase
        .from("cashflow_records")
        .select("*")
        .order("id", { ascending: false })
        .limit(20)

      setRecords(recordsData || [])

      // Fetch categories
      const { data: categoriesData } = await supabase.from("cashflow_categories").select("*").limit(20)

      setCategories(categoriesData || [])
    } catch (error) {
      console.error("Error fetching debug data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 border-t pt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setIsVisible(!isVisible)
          if (!isVisible) fetchData()
        }}
      >
        {isVisible ? "Hide Debug Info" : "Show Debug Info"}
      </Button>

      {isVisible && (
        <div className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Files ({files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : files.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="px-2 py-1 text-left">ID</th>
                        <th className="px-2 py-1 text-left">Filename</th>
                        <th className="px-2 py-1 text-left">Status</th>
                        <th className="px-2 py-1 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((file) => (
                        <tr key={file.id} className="border-b">
                          <td className="px-2 py-1 font-mono">{file.id.substring(0, 8)}...</td>
                          <td className="px-2 py-1">{file.filename}</td>
                          <td className="px-2 py-1">{file.status}</td>
                          <td className="px-2 py-1">{new Date(file.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No files found</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Records ({records.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : records.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="px-2 py-1 text-left">ID</th>
                        <th className="px-2 py-1 text-left">File ID</th>
                        <th className="px-2 py-1 text-left">Category ID</th>
                        <th className="px-2 py-1 text-left">Year</th>
                        <th className="px-2 py-1 text-left">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record.id} className="border-b">
                          <td className="px-2 py-1 font-mono">{record.id.substring(0, 8)}...</td>
                          <td className="px-2 py-1 font-mono">{record.source_file_id?.substring(0, 8)}...</td>
                          <td className="px-2 py-1 font-mono">{record.category_id?.substring(0, 8)}...</td>
                          <td className="px-2 py-1">{record.year}</td>
                          <td className="px-2 py-1">${record.amount?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No records found</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
