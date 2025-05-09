"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface TaskInputResponseProps {
  taskId: string
  businessId: string
  userId: string
  taskTitle: string
  taskDescription?: string
  multiline?: boolean
  required?: boolean
}

export default function TaskInputResponse({
  taskId,
  businessId,
  userId,
  taskTitle,
  taskDescription,
  multiline = false,
  required = false,
}: TaskInputResponseProps) {
  const [value, setValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const { toast } = useToast()

  // Fetch existing response if available
  useEffect(() => {
    const fetchExistingResponse = async () => {
      try {
        const response = await fetch(`/api/survey-responses?taskId=${taskId}&businessId=${businessId}&userId=${userId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch existing response")
        }

        const { data } = await response.json()

        if (data && data.length > 0) {
          setValue(data[0].value || "")
          setIsSaved(true)
        }
      } catch (error) {
        console.error("Error fetching existing response:", error)
      }
    }

    if (taskId && businessId && userId) {
      fetchExistingResponse()
    }
  }, [taskId, businessId, userId])

  const handleSave = async () => {
    if (required && !value.trim()) {
      toast({
        title: "Required field",
        description: "Please provide a response before saving.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/survey-responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          businessId,
          userId,
          value,
          responseData: { text: value },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save response")
      }

      setIsSaved(true)
      toast({
        title: "Response saved",
        description: "Your response has been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving response:", error)
      toast({
        title: "Error",
        description: "Failed to save your response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div>
        <h3 className="text-lg font-medium">
          {taskTitle}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {taskDescription && <p className="text-sm text-gray-500 mt-1">{taskDescription}</p>}
      </div>

      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter your response..."
          rows={5}
          className="w-full"
        />
      ) : (
        <Input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter your response..."
          className="w-full"
        />
      )}

      <div className="flex items-center justify-between">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : isSaved ? "Update" : "Save"}
        </Button>

        {isSaved && <span className="text-sm text-green-600">Last saved: {new Date().toLocaleString()}</span>}
      </div>
    </div>
  )
}
