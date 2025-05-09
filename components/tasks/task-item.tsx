"use client"

import { CheckCircle, Info } from "lucide-react"
import { useEffect, useState } from "react"
import { UploadButton } from "@/components/tasks/upload-button"
import { TaskUploads } from "@/components/tasks/task-uploads"
import { cn } from "@/lib/utils"

interface TaskItemProps {
  task: {
    task_id: string
    task_name: string
    description: string
    isComplete: boolean
    task_type: string
  }
  businessId: string
}

export function TaskItem({ task, businessId }: TaskItemProps) {
  const [isComplete, setIsComplete] = useState(task.isComplete)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  console.log("[TaskItem] Rendering task:", {
    name: task.task_name,
    id: task.task_id,
    type: typeof task.task_id,
    businessId,
    businessIdType: typeof businessId,
  })

  useEffect(() => {
    console.log(`[TaskItem] Mounted task: ${task.task_name}, id: ${task.task_id}, complete: ${isComplete}`)
  }, [task, isComplete])

  const handleUploadSuccess = () => {
    // Mark the task as complete after successful upload
    setIsComplete(true)

    // Trigger a refresh of the file list
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="p-3 border rounded-lg bg-white">
      <div className="flex items-center justify-between gap-4">
        {/* Task title and description */}
        <div className="space-y-1 flex-grow">
          <h4 className="font-medium">{task.task_name}</h4>
          {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
        </div>

        {/* Status indicator - vertically centered and left-aligned */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isComplete ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Info className="h-4 w-4 text-amber-500" />
          )}
          <span className={cn("text-xs font-medium", isComplete ? "text-green-600" : "text-amber-600")}>
            {isComplete ? "Complete" : "Needed"}
          </span>
        </div>

        {/* Upload button or file metadata */}
        <div className="flex-shrink-0">
          {task.task_type === "document-upload" && !isComplete && (
            <UploadButton taskId={task.task_id} businessId={businessId} onSuccess={handleUploadSuccess} />
          )}
        </div>
      </div>

      {/* Show uploaded files for this task with refresh trigger */}
      <TaskUploads taskId={task.task_id} businessId={businessId} refreshTrigger={refreshTrigger} />
    </div>
  )
}
