"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { TaskItem } from "./task-item"
import { Loader2 } from "lucide-react"

interface Task {
  task_id: string
  task_name: string
  description: string
  task_type: string
  category: string | null
  seller_id: string
}

interface UploadedFile {
  id: string
  task_id: string
  status: string
}

interface TaskCategory {
  name: string
  tasks: (Task & { isComplete: boolean })[]
  isComplete: boolean
}

export function TasksCategoryView({ businessId }: { businessId: string }) {
  const [categories, setCategories] = useState<TaskCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchTasksAndFiles() {
      try {
        setIsLoading(true)
        console.log("Fetching tasks and files for business:", businessId)

        // Fetch tasks for this business
        const { data: tasks, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("seller_id", businessId)
          .order("task_name")

        if (tasksError) {
          console.error("Error fetching tasks:", tasksError)
          throw new Error(`Failed to fetch tasks: ${tasksError.message}`)
        }

        console.log(`Retrieved ${tasks?.length || 0} tasks`)

        // Fetch uploaded files for this business
        const { data: files, error: filesError } = await supabase
          .from("uploaded_files")
          .select("id, task_id, status")
          .eq("business_id", businessId)

        if (filesError) {
          console.error("Error fetching files:", filesError)
          throw new Error(`Failed to fetch files: ${filesError.message}`)
        }

        console.log(`Retrieved ${files?.length || 0} files`)

        // Group tasks by category
        const tasksByCategory: Record<string, (Task & { isComplete: boolean })[]> = {}

        tasks?.forEach((task: Task) => {
          // Determine if task is complete (has at least one processed file)
          const isComplete =
            files?.some((file) => file.task_id === task.task_id && file.status === "processed") || false

          // Use "Uncategorized" for null categories
          const category = task.category || "Uncategorized"

          if (!tasksByCategory[category]) {
            tasksByCategory[category] = []
          }

          tasksByCategory[category].push({
            ...task,
            isComplete,
          })
        })

        // Convert to array and sort categories
        const categoriesArray = Object.entries(tasksByCategory).map(([name, tasks]) => ({
          name,
          tasks,
          isComplete: tasks.every((task) => task.isComplete),
        }))

        // Sort categories alphabetically, but keep "Uncategorized" at the end
        categoriesArray.sort((a, b) => {
          if (a.name === "Uncategorized") return 1
          if (b.name === "Uncategorized") return -1
          return a.name.localeCompare(b.name)
        })

        setCategories(categoriesArray)
      } catch (err) {
        console.error("Error in fetchTasksAndFiles:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasksAndFiles()
  }, [supabase, businessId])

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
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.isComplete ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {category.isComplete ? "✅ Complete" : "❗ Incomplete"}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mt-2 space-y-3">
                {category.tasks.map((task) => (
                  <TaskItem key={task.task_id} task={task} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
