export interface Business {
  id: string
  business_name: string
  industry: string
  years_in_operation: string
  location: string
  owner_names: string
  logo_url: string[]
  asking_price: string
  stage: string
  about: string
  created_at: string
  updated_at: string
}

export interface SurveyResponse {
  response_id: string
  task_id: string
  business_id: string
  user_id: string
  responses: Record<string, any>
  value: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description: string
  type: "input" | "file" | "multi-input"
  required: boolean
}
