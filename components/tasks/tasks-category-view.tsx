"use client"

import { TasksTable } from "./tasks-table"

export function TasksCategoryView({ businessId }: { businessId: string }) {
  return <TasksTable businessId={businessId} />
}
