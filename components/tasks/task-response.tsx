"use client"

import { CheckCircle2 } from "lucide-react"

interface TaskResponseProps {
  value: string
  type: "text" | "textarea" | "dropdown"
}

export function TaskResponse({ value, type }: TaskResponseProps) {
  // Format the response based on type
  const formatResponse = () => {
    switch (type) {
      case "textarea":
        // For textarea, show first line or truncate
        const firstLine = value.split("\n")[0]
        return firstLine.length > 60 ? firstLine.substring(0, 60) + "..." : firstLine

      case "text":
      case "dropdown":
      default:
        // For text and dropdown, truncate if too long
        return value.length > 60 ? value.substring(0, 60) + "..." : value
    }
  }

  return (
    <div className="flex items-center text-xs">
      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-500 flex-shrink-0" />
      <span className="truncate max-w-[180px]" title={value}>
        {formatResponse()}
      </span>
    </div>
  )
}
