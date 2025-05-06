"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, BarChart2, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react"
import { EmptyTableState } from "@/components/empty-table-state"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DocumentActionsMenu } from "@/components/document-actions-menu"
import { useToast } from "@/hooks/use-toast"

type UploadedFile = {
  id: string
  filename: string
  status: string
  created_at: string
  processed_at: string | null
}

interface DocumentsListProps {
  businessId: string
}

export function DocumentsList({ businessId }: DocumentsListProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  // Fetch uploaded files
  useEffect(() => {
    fetchFiles()
  }, [supabase])

  // Replace the fetchFiles function with this simplified version that uses client-side filtering

  const fetchFiles = async () => {
    try {
      setIsLoading(true)
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) return

      console.log("[Supabase] Fetching files for user:", userData.user.id)

      // Step 1: Baseline query - minimal select to confirm table access
      const { data: allData, error: basicError } = await supabase.from("uploaded_files").select("*")

      if (basicError) {
        console.error("[Supabase] Error with baseline query:", basicError)
        throw basicError
      }

      console.log(`[Supabase] Baseline query successful - retrieved ${allData?.length || 0} total documents`)

      // Log sample rows to inspect is_deleted values
      console.log("[Supabase] Sample document rows:", allData?.slice(0, 3))

      // Step 2: Query with user filter
      const { data, error } = await supabase.from("uploaded_files").select("*").eq("user_id", userData.user.id)

      if (error) {
        console.error("[Supabase] Error fetching user's uploaded files:", error)
        throw error
      }

      console.log(`[Supabase] Retrieved ${data?.length || 0} documents for user`)

      // Step 3: Apply client-side filtering for is_deleted
      const filteredData = data?.filter((file) => file.is_deleted === false || file.is_deleted === null)

      console.log(`[Supabase] After client-side filtering: ${filteredData?.length || 0} non-deleted documents`)

      setUploadedFiles(filteredData || [])
    } catch (err) {
      console.error("[Supabase] Error in fetchFiles:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Navigate to analysis for a specific file
  const handleViewAnalysis = (fileId: string) => {
    router.push(`/business/${businessId}/analysis/${fileId}`)
  }

  // Navigate to tasks page
  const handleUploadAction = () => {
    router.push(`/business/${businessId}/tasks`)
  }

  // Soft delete a document
  const handleDeleteDocument = async (fileId: string) => {
    try {
      console.log(`Soft deleting document: ${fileId}`)

      // Update the document with is_deleted=true
      const { error } = await supabase.from("uploaded_files").update({ is_deleted: true }).eq("id", fileId)

      if (error) throw error

      // Update local state to remove the document
      setUploadedFiles(uploadedFiles.filter((file) => file.id !== fileId))

      // Show success toast
      toast({
        variant: "success",
        title: "Document deleted",
        description: "The document has been removed from your profile.",
      })

      console.log("Document soft deleted successfully")
    } catch (err) {
      console.error("Error deleting document:", err)
      toast({
        variant: "destructive",
        title: "Error deleting document",
        description: "There was a problem deleting the document. Please try again.",
      })
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get status badge based on file status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Processed
          </span>
        )
      case "uploading":
      case "parsing":
        return (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </span>
        )
      case "error":
        return (
          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </span>
        )
      default:
        return (
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        )
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Uploaded Documents
          </CardTitle>
          <CardDescription>View and manage your uploaded files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Loading documents...</span>
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
            <FileText className="h-5 w-5 mr-2" />
            Uploaded Documents
          </CardTitle>
          <CardDescription>View and manage your uploaded files</CardDescription>
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
          <FileText className="h-5 w-5 mr-2" />
          Uploaded Documents
        </CardTitle>
        <CardDescription>View and manage your uploaded files</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md divide-y">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-3 text-blue-500" />
                <div>
                  <p className="font-medium">{file.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded on {formatDate(file.created_at)}
                    {file.processed_at && ` • Processed on ${formatDate(file.processed_at)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(file.status)}

                {file.status === "processed" ? (
                  <Button size="sm" variant="outline" onClick={() => handleViewAnalysis(file.id)}>
                    <BarChart2 className="h-4 w-4 mr-2" />
                    View Analysis
                  </Button>
                ) : file.status === "error" ? (
                  <Button size="sm" variant="outline" className="text-red-600" onClick={handleUploadAction}>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Retry Upload
                  </Button>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button size="sm" variant="outline" disabled>
                            <BarChart2 className="h-4 w-4 mr-2" />
                            View Analysis
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>File is still being processed</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Document Actions Menu */}
                <DocumentActionsMenu
                  documentId={file.id}
                  documentName={file.filename}
                  onDelete={handleDeleteDocument}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
