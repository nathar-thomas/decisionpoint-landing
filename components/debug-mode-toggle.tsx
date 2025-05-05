"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function DebugModeToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const [isDebugMode, setIsDebugMode] = useState(false)

  // Check if we're in debug mode on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      setIsDebugMode(urlParams.get("debug") === "true")
    }
  }, [])

  // Toggle debug mode
  const handleToggleDebug = (checked: boolean) => {
    console.log(`🐛 Debug mode ${checked ? "enabled" : "disabled"}`)

    // Update URL with debug parameter
    const urlParams = new URLSearchParams(window.location.search)

    if (checked) {
      urlParams.set("debug", "true")
    } else {
      urlParams.delete("debug")
    }

    const newUrl = `${pathname}?${urlParams.toString()}`
    router.push(newUrl)

    setIsDebugMode(checked)
  }

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 text-white p-2 rounded-md flex items-center space-x-2 z-50 text-xs shadow-lg opacity-70 hover:opacity-100 transition-opacity">
      <Switch id="debug-mode" checked={isDebugMode} onCheckedChange={handleToggleDebug} size="sm" />
      <Label htmlFor="debug-mode" className="cursor-pointer">
        Debug Mode
      </Label>
    </div>
  )
}
