"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { DynamicFormField } from "./dynamic-form-field"
import { useToast } from "@/hooks/use-toast"

interface TaskResponseModalProps {
  isOpen: boolean
  onClose: () => void
  task: {
    task_id: string
    task_name: string
    description?: string
    input_config: {
      type: "text" | "textarea" | "dropdown"
      options?: string[]
      placeholder?: string
    }
  }
  businessId: string
  initialValue?: string
  onSuccess?: () => void
}

export function TaskResponseModal({
  isOpen,
  onClose,
  task,
  businessId,
  initialValue = "",
  onSuccess,
}: TaskResponseModalProps) {
  const [value, setValue] = useState(initialValue)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!value.trim() && task.input_config.type !== "dropdown") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a response before saving.",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const payload = {
        task_id: task.task_id,
        business_id: businessId,
        response_type: task.input_config.type, // This will be ignored by the API
        response_value: value, // Using response_value as requested
      }

      console.log("[TaskResponseModal] ▶️ handleSubmit", payload)

      const res = await fetch("/api/task-responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      console.log("[TaskResponseModal] 📥 Response:", json)

      if (!res.ok) {
        console.error("[TaskResponseModal] ❌ Error saving:", json.error)
        throw new Error(json.error)
      }

      console.log("[TaskResponseModal] ✅ Save OK")

      toast({
        variant: "success",
        title: "Response saved",
        description: "Your response has been saved successfully.",
      })

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      console.error("[TaskResponseModal] ❌ Error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save your response. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task.task_name}</DialogTitle>
          {task.description && <p className="text-sm text-muted-foreground mt-2">{task.description}</p>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <DynamicFormField
            type={task.input_config.type}
            value={value}
            onChange={setValue}
            options={task.input_config.options}
            placeholder={task.input_config.placeholder}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
