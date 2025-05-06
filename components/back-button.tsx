"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  destination: string
  className?: string
  showLabel?: boolean
  label?: string
}

export function BackButton({ destination, className, showLabel = false, label = "Back" }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    console.log("🧭 [Navigation] Navigating back to:", destination)
    router.push(destination)
  }

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className={cn("flex items-center gap-2 hover:bg-slate-100 p-2 h-9 w-9", className)}
      title={label}
    >
      <ArrowLeft className="h-5 w-5" />
      {showLabel && <span>{label}</span>}
    </Button>
  )
}
