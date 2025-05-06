"use client"

import { FileX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyTableStateProps {
  message?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyTableState({
  message = "No data available",
  actionLabel,
  onAction,
  className,
}: EmptyTableStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="rounded-full bg-muted p-3 mb-4">
        <FileX className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">{message}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        Upload and process a file to see your financial data analysis.
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
