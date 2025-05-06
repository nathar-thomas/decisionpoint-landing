"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, BarChart2, CheckCircle2 } from "lucide-react"
import { EmptyTableState } from "@/components/empty-table-state"

type UploadedFile = {
  id: string
  filename: string
  status: string
  created_at: string
  processed_at: string | null
}

export function DocumentsList() {
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

  // Navigate to tasks page
  const handleUploadAction = () => {
    router.push(`/business/${businessId}/tasks`)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Completed Documents
          </CardTitle>
          <CardDescription>Documents you have already uploaded and processed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (uploadedFiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Completed Documents
          </CardTitle>
          <CardDescription>Documents you have already uploaded and processed</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyTableState
            message="No documents uploaded yet"
            actionLabel="Upload Document"
            onAction={handleUploadAction}
          />
        </CardContent>
      </Card>
    )
  }

  return (
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
  )
}
