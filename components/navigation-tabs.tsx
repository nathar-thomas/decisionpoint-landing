"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface Tab {
  icon: React.ReactNode
  label: string
  route: string
  description?: string
}

interface NavigationTabsProps {
  tabs: Tab[]
  className?: string
}

export function NavigationTabs({ tabs, className }: NavigationTabsProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex", className)}>
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const isActive = pathname.includes(tab.route)

          return (
            <Link
              key={tab.route}
              href={tab.route}
              onClick={() => console.log("🧭 [Navigation] Navigating to tab:", tab.label, tab.route)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {tab.icon}
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
