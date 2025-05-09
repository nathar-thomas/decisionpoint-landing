"use client"

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
      <div className="grid grid-cols-[1fr,1fr,auto] gap-4 items-center">
        {/* Task title on the left */}
        <div className="flex-shrink-0">
          <h4 className="font-medium">{task.task_name}</h4>
          {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
        </div>

        {/* Status or file info in the center, left-aligned */}
        <div className="flex items-center">
          {/* Show "Info Needed" status when no file is uploaded */}
          {!isComplete && (
            <div className="flex items-center">
              <span className="text-xs font-medium text-amber-600">Info Needed</span>
            </div>
          )}

          {/* Show uploaded files for this task with refresh trigger */}
          <TaskUploads
            taskId={task.task_id}
            businessId={businessId}
            refreshTrigger={refreshTrigger}
            showAsInline={true}
          />
        </div>

        {/* Upload button on the right */}
        {task.task_type === "document-upload" && (
          <div className="flex-shrink-0 justify-self-end">
            <UploadButton
              taskId={task.task_id}
              businessId={businessId}
              onSuccess={handleUploadSuccess}
              alwaysEnabled={true}
            />
          </div>
        )}
      </div>
    </div>
  )
}
