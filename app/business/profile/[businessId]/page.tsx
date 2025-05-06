"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { FileText, BarChart2, ClipboardList } from "lucide-react"
import { BackButton } from "@/components/back-button"
import { BusinessHeader } from "@/components/business-header"
import { NavigationTabs } from "@/components/navigation-tabs"

export default function BusinessProfilePage() {
  const params = useParams()
  const businessId = params.businessId as string

  useEffect(() => {
    console.log("🔍 [BusinessProfile] Mounted with businessId:", businessId)
  }, [businessId])

  const tabs = [
    {
      icon: <ClipboardList className="h-4 w-4" />,
      label: "Tasks",
      route: "/cashflow/tasks",
      description: "Upload and complete required documentation.",
    },
    {
      icon: <BarChart2 className="h-4 w-4" />,
      label: "Analysis",
      route: "/cashflow/analysis",
      description: "View financial analysis and insights.",
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: "Documents",
      route: "/cashflow/documents",
      description: "Organize and view uploaded business files.",
    },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <BackButton destination="/dashboard" label="Back to Dashboard" className="mb-6" />

      <BusinessHeader
        businessId={businessId}
        title="Business Profile"
        description="Manage this business's readiness, analysis, and documents."
        className="mb-8"
      />

      <NavigationTabs tabs={tabs} className="mb-8" />

      <div className="p-8 border rounded-lg bg-muted/10 text-center">
        <p className="text-muted-foreground">Select a tab above to manage tasks, view analysis, or access documents.</p>
      </div>
    </div>
  )
}
