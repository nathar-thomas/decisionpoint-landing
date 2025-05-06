"use client"

import type React from "react"

import { useParams, usePathname } from "next/navigation"
import { useEffect } from "react"
import { FileText, BarChart2, ClipboardList, Home } from "lucide-react"
import { BackButton } from "@/components/back-button"
import { NavigationTabs } from "@/components/navigation-tabs"

export default function BusinessProfileLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const businessId = params.businessId as string

  useEffect(() => {
    console.log("🔍 [BusinessProfileLayout] Mounted with businessId:", businessId)
  }, [businessId])

  // Determine which tab is active from the current path
  const getActiveTab = () => {
    if (pathname.includes(`/business/${businessId}/tasks`)) return "tasks"
    if (pathname.includes(`/business/${businessId}/analysis`)) return "analysis"
    if (pathname.includes(`/business/${businessId}/documents`)) return "documents"
    return "overview"
  }

  const activeTab = getActiveTab()

  const tabs = [
    {
      icon: <Home className="h-4 w-4" />,
      label: "Overview",
      route: `/business/${businessId}/overview`,
      description: "Business profile overview",
    },
    {
      icon: <ClipboardList className="h-4 w-4" />,
      label: "Tasks",
      route: `/business/${businessId}/tasks`,
      description: "Upload and complete required documentation.",
    },
    {
      icon: <BarChart2 className="h-4 w-4" />,
      label: "Analysis",
      route: `/business/${businessId}/analysis`,
      description: "View financial analysis and insights.",
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: "Documents",
      route: `/business/${businessId}/documents`,
      description: "Organize and view uploaded business files.",
    },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <BackButton destination="/dashboard" label="Back to Dashboard" />
        <NavigationTabs tabs={tabs} activeTab={activeTab} />
      </div>

      {children}
    </div>
  )
}
