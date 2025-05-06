"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useParams, useRouter } from "next/navigation"
import { CashflowAnalyzer } from "@/components/cashflow-analyzer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CheckCircle2, FileText, Clock, BarChart2 } from "lucide-react"

type UploadedFile = {
  id: string
  filename: string
  status: string
  created_at: string
  processed_at: string | null
}

export function TasksDocuments() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const businessId = params.businessId as string
  const supabase = createClientComponentClient()

  // Fetch uploaded files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setIsLoading(true)
        const { data: userData } = await supabase.auth.getUser()

        if (!userData.user) return

        const { data, error } = await supabase
          .from("uploaded_files")
          .select("*")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        setUploadedFiles(data || [])
      } catch (err) {
        console.error("Error fetching uploaded files:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFiles()
  }, [supabase])

  // Navigate to analysis for a specific file
  const handleViewAnalysis = (fileId: string) => {
    router.push(`/business/${businessId}/analysis/${fileId}`)
  }

  // Count completed documents
  const completedCount = uploadedFiles.filter((file) => file.status === "processed").length

  return (
    <div className="space-y-8">
      {/* Required Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Required Documents
          </CardTitle>
          <CardDescription>Upload the following documents to complete your business profile</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="financial">
            <TabsList className="mb-4">
              <TabsTrigger value="financial">Financial Documents</TabsTrigger>
              <TabsTrigger value="business">Business Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="financial" className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start p-4 border rounded-md bg-muted/10">
                  <div className="mr-4 mt-1">
                    {completedCount > 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">Cash Flow Statement</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload a CSV or Excel file with your annual cash flow data.
                    </p>
                    {completedCount > 0 && (
                      <div className="mt-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewAnalysis(uploadedFiles[0].id)}>
                          <BarChart2 className="h-4 w-4 mr-2" />
                          View Analysis
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="business" className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start p-4 border rounded-md bg-muted/10">
                  <div className="mr-4 mt-1">
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Business Plan</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload your business plan document (coming soon).
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* File Uploader */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Financial Data</CardTitle>
          <CardDescription>Upload a CSV or Excel file with your annual cash flow data</CardDescription>
        </CardHeader>
        <CardContent>
          <CashflowAnalyzer
            onFileProcessed={(fileId) => {
              // Refresh the file list after a new file is processed
              supabase
                .from("uploaded_files")
                .select("*")
                .eq("id", fileId)
                .single()
                .then(({ data }) => {
                  if (data) {
                    setUploadedFiles([data, ...uploadedFiles])
                  }
                })
            }}
          />
        </CardContent>
      </Card>

      {/* Completed Documents Section */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Completed Documents
            </CardTitle>
            <CardDescription>Documents you have already uploaded and processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md divide-y">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-3 text-blue-500" />
                    <div>
                      <p className="font-medium">{file.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded on {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === "processed" ? (
                      <>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Processed</span>
                        <Button size="sm" variant="outline" onClick={() => handleViewAnalysis(file.id)}>
                          <BarChart2 className="h-4 w-4 mr-2" />
                          View Analysis
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        {file.status === "uploaded" ? "Pending" : file.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
