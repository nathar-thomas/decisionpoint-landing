"use client"

import { useEffect, useState } from "react"
import { UploadButton } from "@/components/tasks/upload-button"
import { TaskUploads } from "@/components/tasks/task-uploads"
import { TaskResponseModal } from "./task-response-modal"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { CheckCircle2 } from "lucide-react"

interface TaskItemProps {
  task: {
    task_id: string
    task_name: string
    description: string
    isComplete: boolean
    task_type: string
    response?: string | null
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
  const [responseValue, setResponseValue] = useState<string | null>(task.response || null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  console.log("[TaskItem] ▶️", task.task_id, "complete?", isComplete, "response:", responseValue || task.response)
  console.log("[TaskItem] ▶️ Aligned row:", task.task_id, "complete?", isComplete)

  useEffect(() => {
    console.log(
      `[TaskItem] Mounted task: ${task.task_name}, id: ${task.task_id}, complete: ${isComplete}, response: ${task.response}`,
    )

    // Set response value from task.response if available
    if (task.task_type === "input" && task.response) {
      setResponseValue(task.response)
      setIsComplete(true)
    }
    // Only fetch from API if we don't already have a response
    else if (task.task_type === "input" && !task.response) {
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

  const handleResponseSuccess = (newValue: string) => {
    console.log("[TaskItem] ▶️ Response saved successfully:", newValue)

    // Update local state immediately
    setResponseValue(newValue)
    setIsComplete(true)

    // Trigger a refresh
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="p-3 border rounded-lg bg-white">
      <div className="grid grid-cols-[1fr,auto] gap-4 items-center">
        {/* Task title on the left */}
        <div className="flex-shrink-0">
          <h4 className="font-medium">{task.task_name}</h4>
          {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
        </div>

        {/* Right side: Status/files/response and action button */}
        <div className="flex items-center justify-end space-x-4">
          {/* Document upload tasks */}
          {task.task_type === "document-upload" && (
            <>
              <div className="flex items-center">
                {isComplete ? (
                  <TaskUploads
                    taskId={task.task_id}
                    businessId={businessId}
                    refreshTrigger={refreshTrigger}
                    showAsInline={true}
                  />
                ) : (
                  <span className="text-xs font-medium text-amber-600">Info Needed</span>
                )}
              </div>
              <UploadButton
                taskId={task.task_id}
                businessId={businessId}
                onSuccess={handleUploadSuccess}
                alwaysEnabled={true}
              />
            </>
          )}

          {/* Input tasks */}
          {task.task_type === "input" && task.input_config && (
            <div className="flex items-center justify-between py-2">
              {responseValue ? (
                <>
                  {/* Left side: icon + response text */}
                  <div className="flex items-center space-x-2 mr-4">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-800 text-xs truncate max-w-[180px]" title={responseValue}>
                      {responseValue}
                    </span>
                  </div>
                  {/* Right side: Edit link */}
                  <span
                    className="text-blue-600 hover:underline cursor-pointer text-sm"
                    onClick={() => {
                      setIsModalOpen(true)
                      console.log("[TaskItem] ▶️", task.task_id, "Edit link clicked")
                    }}
                  >
                    Edit
                  </span>
                </>
              ) : (
                <>
                  {/* Left side: Info Needed text */}
                  <span className="text-xs font-medium text-amber-600 mr-4">Info Needed</span>
                  {/* Right side: Add Info link */}
                  <span
                    className="text-blue-600 hover:underline cursor-pointer text-sm"
                    onClick={() => {
                      setIsModalOpen(true)
                      console.log("[TaskItem] ▶️", task.task_id, "Add Info link clicked")
                    }}
                  >
                    Add Info
                  </span>
                </>
              )}
            </div>
          )}
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
