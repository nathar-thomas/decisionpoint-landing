import { createServerSupabaseClient } from "@/lib/supabase"
import TaskInputResponse from "@/components/task-input-response"
import MultiInputResponse from "@/components/multi-input-response"

interface TaskPageProps {
  params: {
    businessId: string
  }
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { businessId } = params
  const supabase = createServerSupabaseClient()

  // This would normally come from authentication
  const userId = "sample-user-id"

  // Fetch business details
  const { data: business } = await supabase.from("businesses").select("*").eq("id", businessId).single()

  // For demo purposes, we'll create some sample tasks
  const sampleTasks = [
    {
      id: "task-1",
      title: "Business Description",
      description: "Provide a brief description of the business",
      type: "input",
      required: true,
    },
    {
      id: "task-2",
      title: "Business Challenges",
      description: "Describe the main challenges facing the business",
      type: "input",
      multiline: true,
      required: false,
    },
    {
      id: "task-3",
      title: "Contact Information",
      description: "Provide contact details for the business",
      type: "multi-input",
      fields: [
        { id: "email", label: "Email Address", required: true },
        { id: "phone", label: "Phone Number", required: true },
        { id: "website", label: "Website", required: false },
      ],
    },
  ]

  if (!business) {
    return <div>Business not found</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Tasks for {business.business_name}</h1>

      <div className="space-y-6">
        {sampleTasks.map((task) => {
          if (task.type === "multi-input") {
            return (
              <MultiInputResponse
                key={task.id}
                taskId={task.id}
                businessId={businessId}
                userId={userId}
                taskTitle={task.title}
                taskDescription={task.description}
                fields={task.fields || []}
              />
            )
          } else {
            return (
              <TaskInputResponse
                key={task.id}
                taskId={task.id}
                businessId={businessId}
                userId={userId}
                taskTitle={task.title}
                taskDescription={task.description}
                multiline={task.multiline}
                required={task.required}
              />
            )
          }
        })}
      </div>
    </div>
  )
}
