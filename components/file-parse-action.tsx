"use client"

import { useState } from "react"
import { FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface FileParseActionProps {
  fileId: string
  fileName: string
  status: string
}

export function FileParseAction({ fileId, fileName, status }: FileParseActionProps) {
  const [parseStatus, setParseStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [parseResult, setParseResult] = useState<{
    message?: string
    rows_inserted?: number
    rows_failed?: number
    error?: string
  }>({})

  const handleParse = async () => {
    try {
      setParseStatus("loading")

      const response = await fetch(`/api/parse-file/${fileId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse file")
      }

      setParseResult({
        message: data.message,
        rows_inserted: data.rows_inserted,
        rows_failed: data.rows_failed,
      })
      setParseStatus("success")
    } catch (error) {
      setParseResult({
        error: error instanceof Error ? error.message : "An unknown error occurred",
      })
      setParseStatus("error")
    }
  }

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-blue-50 p-2">
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{fileName}</h3>
            <p className="text-sm text-muted-foreground">
              Status: <span className="font-medium capitalize">{status}</span>
            </p>

            {parseStatus === "success" && (
              <Alert className="mt-4 bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  {parseResult.message}
                  <div className="mt-2 flex gap-4">
                    <div className="text-sm">
                      <span className="font-medium">{parseResult.rows_inserted}</span> records inserted
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{parseResult.rows_failed}</span> records failed
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {parseStatus === "error" && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{parseResult.error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 px-6 py-4">
        <Button
          onClick={handleParse}
          disabled={parseStatus === "loading" || parseStatus === "success" || status !== "uploaded"}
          className="ml-auto"
        >
          {parseStatus === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Parsing...
            </>
          ) : (
            "Parse File"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
