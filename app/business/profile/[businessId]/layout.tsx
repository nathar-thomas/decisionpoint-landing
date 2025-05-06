"use client"

import type React from "react"

import { useParams, usePathname } from "next/navigation"
import { useEffect } from "react"
import { FileText, BarChart2, ClipboardList } from "lucide-react"
import { BackButton } from "@/components/back-button"
import { BusinessHeader } from "@/components/business-header"
import { NavigationTabs } from "@/components/navigation-tabs"

export default function BusinessProfileLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const businessId = params.businessId as string

  useEffect(() => {
    console.log("🔍 [BusinessProfileLayout] Mounted with businessId:", businessId)
  }, [businessId])

  const tabs = [
    {
      icon: <ClipboardList className="h-4 w-4" />,
      label: "Tasks",
      route: `/cashflow/tasks`,
      description: "Upload and complete required documentation.",
    },
    {
      icon: <BarChart2 className="h-4 w-4" />,
      label: "Analysis",
      route: `/cashflow/analysis`,
      description: "View financial analysis and insights.",
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: "Documents",
      route: `/cashflow/documents`,
      description: "Organize and view uploaded business files.",
    },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <BackButton destination="/dashboard" label="Back to Dashboard" />
        <NavigationTabs tabs={tabs} />
      </div>

      <BusinessHeader
        businessId={businessId}
        title="Business Profile"
        description="Manage this business's readiness, analysis, and documents."
        className="mb-8"
      />

      {children}
    </div>
  )
}
