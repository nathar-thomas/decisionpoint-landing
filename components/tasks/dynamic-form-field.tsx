"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sparkles, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DynamicFormFieldProps {
  type: "text" | "textarea" | "dropdown"
  value: string
  onChange: (value: string) => void
  options?: string[]
  placeholder?: string
}

export function DynamicFormField({ type, value, onChange, options = [], placeholder }: DynamicFormFieldProps) {
  const [isAiEnhancing, setIsAiEnhancing] = useState(false)

  const handleAiEnhance = () => {
    // This is a placeholder for future AI enhancement functionality
    setIsAiEnhancing(true)
    setTimeout(() => {
      setIsAiEnhancing(false)
    }, 1000)
  }

  switch (type) {
    case "text":
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Enter your response"}
          className="w-full"
        />
      )

    case "textarea":
      return (
        <div className="space-y-2">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Enter your detailed response"}
            className="w-full min-h-[120px]"
          />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground"
                    disabled={true}
                    onClick={handleAiEnhance}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    {isAiEnhancing ? "Enhancing..." : "Improve with AI"}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">AI writing enhancement coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )

    case "dropdown":
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder || "Select an option"} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    default:
      return (
        <div className="flex items-center text-amber-600 text-sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Unsupported input type: {type}
        </div>
      )
  }
}
