"use client"

import { CheckCircle, AlertCircle } from "lucide-react"
import { useEffect } from "react"
import { UploadButton } from "@/components/tasks/upload-button"

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
  console.log("[TaskItem] Rendering task:", {
    name: task.task_name,
    id: task.task_id,
    type: typeof task.task_id,
    businessId,
    businessIdType: typeof businessId,
  })

  console.log(`[TaskItem] Rendering task: ${task.task_name}, isComplete: ${task.isComplete}, type: ${task.task_type}`)

  useEffect(() => {
    console.log(`[TaskItem] Mounted task: ${task.task_name}, id: ${task.task_id}, complete: ${task.isComplete}`)
  }, [task])

  return (
    <div className="p-3 border rounded-lg bg-white">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="font-medium">{task.task_name}</h4>
          {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              task.isComplete ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
            }`}
          >
            {task.isComplete ? (
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
          {task.task_type === "document-upload" && <UploadButton taskId={task.task_id} businessId={businessId} />}
        </div>
      </div>
    </div>
  )
}
