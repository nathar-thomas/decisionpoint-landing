"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  destination: string
  label?: string
  className?: string
}

export function BackButton({ destination, label = "Back", className }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    console.log("🧭 [Navigation] Navigating back to:", destination)
    router.push(destination)
  }

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className={cn("flex items-center gap-2 hover:bg-slate-100", className)}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}
