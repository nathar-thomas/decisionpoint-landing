"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { UploadButton } from "@/components/tasks/upload-button"
import { TaskUploads } from "@/components/tasks/task-uploads"
import { TaskResponseModal } from "./task-response-modal"
import { Loader2 } from "lucide-react"

interface Task {
  task_id: string
  task_name: string
  description: string
  task_type: string
  category: string | null
  seller_id: string
  isComplete?: boolean
  response?: string | null
  input_config?: {
    type: "text" | "textarea" | "dropdown"
    options?: string[]
    placeholder?: string
  }
}

interface TaskCategory {
  name: string
  tasks: Task[]
  isComplete: boolean
}

export function TasksTable({ businessId }: { businessId: string }) {
  const [categories, setCategories] = useState<TaskCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = createClientComponentClient()

  // Fetch tasks and files
  useEffect(() => {
    const fetchTasksAndFiles = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch tasks
        const { data: tasks, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("seller_id", businessId)
          .order("task_name")

        if (tasksError) {
          throw new Error(`Failed to fetch tasks: ${tasksError.message}`)
        }

        // Fetch uploaded files
        const { data: files, error: filesError } = await supabase
          .from("uploaded_files")
          .select("id, task_id, status")
          .eq("business_id", businessId)

        if (filesError) {
          throw new Error(`Failed to fetch files: ${filesError.message}`)
        }

        // Add this code to fetch responses
        console.log("[fetchTasksAndFiles] ▶️ Fetching saved responses")
        const { data: responses, error: respErr } = await supabase
          .from("survey_responses")
          .select("task_id, value")
          .eq("business_id", businessId)

        if (respErr) {
          console.error("[fetchTasksAndFiles] ❌ responses error:", respErr)
        } else {
          console.log("[fetchTasksAndFiles] ✅ responses:", responses)
        }

        // Process tasks with files and responses
        console.log("[fetchTasksAndFiles] 🧩 Merging responses into tasks")
        const processedTasks = tasks.map((task) => {
          const hasFile = files?.some((file) => file.task_id === task.task_id && file.status === "processed")
          const response = responses?.find((r) => r.task_id === task.task_id)

          return {
            ...task,
            isComplete: hasFile || !!response?.value,
            response: response?.value || null,
          }
        })
        console.log("[fetchTasksAndFiles] ✅ processedTasks:", processedTasks)

        // Group by category
        const tasksByCategory: Record<string, Task[]> = {}
        processedTasks.forEach((task) => {
          const category = task.category || "Uncategorized"
          if (!tasksByCategory[category]) {
            tasksByCategory[category] = []
          }
          tasksByCategory[category].push(task)
        })

        // Convert to array and sort categories
        const categoriesArray = Object.entries(tasksByCategory).map(([name, tasks]) => ({
          name,
          tasks,
          isComplete: tasks.every((task) => task.isComplete),
        }))

        // Sort categories
        categoriesArray.sort((a, b) => {
          if (a.name === "Uncategorized") return 1
          if (b.name === "Uncategorized") return -1
          return a.name.localeCompare(b.name)
        })

        setCategories(categoriesArray)
      } catch (err) {
        console.error("Error fetching tasks:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasksAndFiles()
  }, [supabase, businessId, refreshTrigger])

  const handleUploadSuccess = (taskId: string) => {
    // Update the task status locally
    setCategories((prevCategories) =>
      prevCategories.map((category) => ({
        ...category,
        tasks: category.tasks.map((task) => (task.task_id === taskId ? { ...task, isComplete: true } : task)),
        isComplete: category.tasks.every((task) => (task.task_id === taskId ? true : task.isComplete)),
      })),
    )

    // Trigger a refresh
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleResponseSuccess = (taskId: string, newValue: string) => {
    // Update the task response locally
    setCategories((prevCategories) =>
      prevCategories.map((category) => ({
        ...category,
        tasks: category.tasks.map((task) =>
          task.task_id === taskId ? { ...task, isComplete: true, response: newValue } : task,
        ),
        isComplete: category.tasks.every((task) => (task.task_id === taskId ? true : task.isComplete)),
      })),
    )

    // Close the modal
    setIsModalOpen(false)
    setActiveTask(null)

    // Trigger a refresh
    setRefreshTrigger((prev) => prev + 1)
  }

  const openResponseModal = (task: Task) => {
    setActiveTask(task)
    setIsModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Loading tasks...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold">Error loading tasks</h3>
        <p>{error}</p>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="p-6 text-center border rounded-xl bg-muted/50 shadow-sm">
        <p className="text-muted-foreground">No tasks found for this business.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={categories.map((c) => c.name)} className="space-y-4">
        {categories.map((category) => (
          <AccordionItem
            key={category.name}
            value={category.name}
            className="border rounded-xl bg-muted/50 p-4 shadow-sm"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <h3 className="text-lg font-medium text-left">{category.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100/50 text-amber-800">
                  {category.isComplete ? "Complete" : "Incomplete"}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mt-4 space-y-3">
                {category.tasks.map((task) => (
                  <div key={task.task_id} className="p-3 border rounded-lg bg-white">
                    <div className="grid grid-cols-[2fr,5fr,auto] items-center gap-4">
                      {/* Cell 1: Title and Description */}
                      <div className="py-2">
                        <h4 className="font-medium text-gray-900">{task.task_name}</h4>
                        {task.description && <p className="text-xs text-muted-foreground mt-1">{task.description}</p>}
                      </div>

                      {/* Cell 2: Status or Response */}
                      <div className="py-2">
                        {task.task_type === "document-upload" ? (
                          // Document upload task status
                          task.isComplete ? (
                            <TaskUploads
                              taskId={task.task_id}
                              businessId={businessId}
                              refreshTrigger={refreshTrigger}
                              showAsInline={true}
                            />
                          ) : (
                            <div className="flex items-center h-full">
                              <span className="text-xs font-medium text-amber-600">Info Needed</span>
                            </div>
                          )
                        ) : // Input task response or status
                        task.response ? (
                          <div className="text-gray-800 text-sm line-clamp-3 overflow-ellipsis">{task.response}</div>
                        ) : (
                          <div className="flex items-center h-full">
                            <span className="text-xs font-medium text-amber-600">Info Needed</span>
                          </div>
                        )}
                      </div>

                      {/* Cell 3: Action Button/Link */}
                      <div className="py-2 text-right">
                        {task.task_type === "document-upload" ? (
                          <UploadButton
                            taskId={task.task_id}
                            businessId={businessId}
                            onSuccess={() => handleUploadSuccess(task.task_id)}
                            alwaysEnabled={true}
                          />
                        ) : (
                          <span
                            className="text-blue-600 hover:underline cursor-pointer text-sm"
                            onClick={() => openResponseModal(task)}
                          >
                            {task.response ? "Edit" : "Add Info"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Response Modal */}
      {activeTask && (
        <TaskResponseModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setActiveTask(null)
          }}
          task={activeTask as any}
          businessId={businessId}
          initialValue={activeTask.response || ""}
          onSuccess={(value) => handleResponseSuccess(activeTask.task_id, value)}
        />
      )}
    </div>
  )
}
