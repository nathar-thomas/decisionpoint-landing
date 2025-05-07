import { CheckCircle, AlertCircle } from "lucide-react"

interface TaskItemProps {
  task: {
    task_id: string
    task_name: string
    description: string
    isComplete: boolean
  }
}

export function TaskItem({ task }: TaskItemProps) {
  return (
    <div className="p-3 border rounded-lg bg-white">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="font-medium">{task.task_name}</h4>
          {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
        </div>
        <div
          className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            task.isComplete ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
          }`}
        >
          {task.isComplete ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>Complete</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 mr-1" />
              <span>Info Needed</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
