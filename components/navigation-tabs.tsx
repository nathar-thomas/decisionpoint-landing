"use client"

import type React from "react"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface Tab {
  icon: React.ReactNode
  label: string
  route: string
  description?: string
}

interface NavigationTabsProps {
  tabs: Tab[]
  activeTab?: string
  className?: string
}

export function NavigationTabs({ tabs, activeTab, className }: NavigationTabsProps) {
  return (
    <div className={cn("flex", className)}>
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const tabName = tab.label.toLowerCase()
          const isActive = activeTab === tabName

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
