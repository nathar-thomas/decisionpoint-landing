import { createServerSupabaseClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const { taskId, businessId, userId, value, responseData } = body

    // Validate required fields
    if (!taskId || !businessId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if a response already exists for this task/business/user
    const { data: existingResponse } = await supabase
      .from("survey_responses")
      .select("response_id")
      .eq("task_id", taskId)
      .eq("business_id", businessId)
      .eq("user_id", userId)
      .single()

    let result

    if (existingResponse) {
      // Update existing response
      result = await supabase
        .from("survey_responses")
        .update({
          value: value || null,
          responses: responseData || {},
          updated_at: new Date().toISOString(),
        })
        .eq("response_id", existingResponse.response_id)
        .select()
        .single()
    } else {
      // Insert new response
      result = await supabase
        .from("survey_responses")
        .insert({
          task_id: taskId,
          business_id: businessId,
          user_id: userId,
          value: value || null,
          responses: responseData || {},
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error("Error saving survey response:", result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    console.error("Unexpected error in survey response API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const url = new URL(request.url)

    const taskId = url.searchParams.get("taskId")
    const businessId = url.searchParams.get("businessId")
    const userId = url.searchParams.get("userId")

    if (!taskId || !businessId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    let query = supabase.from("survey_responses").select("*").eq("task_id", taskId).eq("business_id", businessId)

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching survey responses:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Unexpected error in survey response API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
