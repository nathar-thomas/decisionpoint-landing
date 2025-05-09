"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface Field {
  id: string
  label: string
  required?: boolean
}

interface MultiInputResponseProps {
  taskId: string
  businessId: string
  userId: string
  taskTitle: string
  taskDescription?: string
  fields: Field[]
}

export default function MultiInputResponse({
  taskId,
  businessId,
  userId,
  taskTitle,
  taskDescription,
  fields,
}: MultiInputResponseProps) {
  const [values, setValues] = useState<Record<string, string>>({})
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

        if (data && data.length > 0 && data[0].responses) {
          setValues(data[0].responses)
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

  const handleInputChange = (fieldId: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  const handleSave = async () => {
    // Validate required fields
    const missingRequiredFields = fields
      .filter((field) => field.required && !values[field.id]?.trim())
      .map((field) => field.label)

    if (missingRequiredFields.length > 0) {
      toast({
        title: "Required fields missing",
        description: `Please fill in the following fields: ${missingRequiredFields.join(", ")}`,
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
          value: JSON.stringify(values),
          responseData: values,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save response")
      }

      setIsSaved(true)
      toast({
        title: "Response saved",
        description: "Your responses have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving response:", error)
      toast({
        title: "Error",
        description: "Failed to save your responses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div>
        <h3 className="text-lg font-medium">{taskTitle}</h3>
        {taskDescription && <p className="text-sm text-gray-500 mt-1">{taskDescription}</p>}
      </div>

      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.id} className="space-y-1">
            <label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type="text"
              value={values[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : isSaved ? "Update" : "Save"}
        </Button>

        {isSaved && <span className="text-sm text-green-600">Last saved: {new Date().toLocaleString()}</span>}
      </div>
    </div>
  )
}
