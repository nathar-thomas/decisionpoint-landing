"use client"

import { useEffect, useState } from "react"
import { UploadButton } from "@/components/tasks/upload-button"
import { TaskUploads } from "@/components/tasks/task-uploads"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { TaskResponseModal } from "./task-response-modal"
import { TaskResponse } from "./task-response"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface TaskItemProps {
  task: {
    task_id: string
    task_name: string
    description: string
    isComplete: boolean
    task_type: string
    input_config?: {
      type: "text" | "textarea" | "dropdown"
      options?: string[]
      placeholder?: string
    }
  }
  businessId: string
}

export function TaskItem({ task, businessId }: TaskItemProps) {
  const [isComplete, setIsComplete] = useState(task.isComplete)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [responseValue, setResponseValue] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  console.log("[TaskItem] Rendering task:", {
    name: task.task_name,
    id: task.task_id,
    type: task.task_type,
    businessId,
  })

  useEffect(() => {
    console.log(`[TaskItem] Mounted task: ${task.task_name}, id: ${task.task_id}, complete: ${isComplete}`)

    // Fetch existing response if this is an input task
    if (task.task_type === "input") {
      fetchExistingResponse()
    }
  }, [task, isComplete, refreshTrigger])

  const fetchExistingResponse = async () => {
    try {
      setIsLoading(true)

      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return

      const { data, error } = await supabase
        .from("survey_responses")
        .select("value")
        .eq("task_id", task.task_id)
        .eq("business_id", businessId)
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (error) {
        console.error("Error fetching response:", error)
        return
      }

      if (data && data.length > 0) {
        setResponseValue(data[0].value)
        setIsComplete(true)
      }
    } catch (err) {
      console.error("Error in fetchExistingResponse:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadSuccess = () => {
    // Mark the task as complete after successful upload
    setIsComplete(true)

    // Trigger a refresh of the file list
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleResponseSuccess = () => {
    // Refresh the response data
    fetchExistingResponse()

    // Trigger a refresh
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

        {/* Status or file/response info in the center, left-aligned */}
        <div className="flex items-center">
          {/* Show "Info Needed" status when no file/response is provided */}
          {!isComplete && (
            <div className="flex items-center">
              <span className="text-xs font-medium text-amber-600">Info Needed</span>
            </div>
          )}

          {/* Show uploaded files for document-upload tasks */}
          {task.task_type === "document-upload" && (
            <TaskUploads
              taskId={task.task_id}
              businessId={businessId}
              refreshTrigger={refreshTrigger}
              showAsInline={true}
            />
          )}

          {/* Show response for input tasks */}
          {task.task_type === "input" && responseValue && (
            <TaskResponse value={responseValue} type={task.input_config?.type || "text"} />
          )}
        </div>

        {/* Upload button or Edit button on the right */}
        <div className="flex-shrink-0 justify-self-end">
          {task.task_type === "document-upload" ? (
            <UploadButton
              taskId={task.task_id}
              businessId={businessId}
              onSuccess={handleUploadSuccess}
              alwaysEnabled={true}
            />
          ) : task.task_type === "input" && task.input_config ? (
            <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)} className="h-8">
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              {responseValue ? "Edit" : "Add Info"}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Response Modal */}
      {task.task_type === "input" && task.input_config && (
        <TaskResponseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={task as any}
          businessId={businessId}
          initialValue={responseValue || ""}
          onSuccess={handleResponseSuccess}
        />
      )}
    </div>
  )
}
