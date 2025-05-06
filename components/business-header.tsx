import { cn } from "@/lib/utils"

interface BusinessHeaderProps {
  businessId: string
  title: string
  description: string
  className?: string
}

export function BusinessHeader({ businessId, title, description, className }: BusinessHeaderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
