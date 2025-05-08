"use client"

import { CheckCircle, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { UploadButton } from "@/components/tasks/upload-button"
import { TaskUploads } from "@/components/tasks/task-uploads"

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
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="font-medium">{task.task_name}</h4>
          {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}

          {/* Show uploaded files for this task with refresh trigger */}
          <TaskUploads taskId={task.task_id} businessId={businessId} refreshTrigger={refreshTrigger} />
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isComplete ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
            }`}
          >
            {isComplete ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>Complete</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                <span>Info Needed</span>
              </>
            )}
          </div>

          {/* Only show upload button for document-upload tasks */}
          {task.task_type === "document-upload" && (
            <UploadButton
              taskId={task.task_id}
              businessId={businessId}
              disabled={isComplete}
              onSuccess={handleUploadSuccess}
            />
          )}
        </div>
      </div>
    </div>
  )
}
