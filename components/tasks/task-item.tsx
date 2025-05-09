"use client"

import { useEffect, useState } from "react"
import { UploadButton } from "@/components/tasks/upload-button"
import { TaskUploads } from "@/components/tasks/task-uploads"
import { TaskResponseModal } from "./task-response-modal"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

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
      {/* Document upload tasks */}
      {task.task_type === "document-upload" && (
        <div className="grid grid-cols-[2fr,5fr,auto] items-center gap-4 py-2 px-4">
          {/* 1️⃣ Left column: title/description */}
          <div className="text-gray-900">
            <h4 className="font-medium">{task.task_name}</h4>
            {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
          </div>

          {/* 2️⃣ Middle column: status */}
          <div className="text-gray-800 text-left flex items-center h-full">
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

          {/* 3️⃣ Right column: Upload button */}
          <div className="justify-self-end">
            <UploadButton
              taskId={task.task_id}
              businessId={businessId}
              onSuccess={handleUploadSuccess}
              alwaysEnabled={true}
            />
          </div>
        </div>
      )}

      {/* Input tasks */}
      {task.task_type === "input" && task.input_config && (
        <div className="grid grid-cols-[2fr,5fr,auto] items-center gap-4 py-2 px-4">
          {/* 1️⃣ Left column: title/description */}
          <div className="text-gray-900">
            <h4 className="font-medium">{task.task_name}</h4>
            {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
          </div>

          {/* 2️⃣ Middle column: response text or status */}
          <div className="flex items-center h-full">
            {responseValue ? (
              <div
                className="text-gray-800 text-left text-xs overflow-hidden max-w-[90%]"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {responseValue}
              </div>
            ) : (
              <span className="text-xs font-medium text-amber-600">Info Needed</span>
            )}
          </div>

          {/* 3️⃣ Right column: Edit/Add Info link */}
          <div className="flex justify-end">
            <span
              className="text-blue-600 hover:underline cursor-pointer text-sm"
              onClick={() => {
                setIsModalOpen(true)
                console.log("[TaskItem] ▶️", task.task_id, responseValue ? "Edit link clicked" : "Add Info link clicked")
              }}
            >
              {responseValue ? "Edit" : "Add Info"}
            </span>
          </div>
        </div>
      )}

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
