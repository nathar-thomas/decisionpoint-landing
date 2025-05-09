import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const { task_id, business_id, response_type, value } = await request.json()

    // Validate required fields
    if (!task_id || !business_id || !response_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if a response already exists
    const { data: existingResponse, error: fetchError } = await supabase
      .from("survey_responses")
      .select("id")
      .eq("task_id", task_id)
      .eq("business_id", business_id)
      .eq("user_id", user.id)
      .limit(1)

    if (fetchError) {
      console.error("Error checking for existing response:", fetchError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    let result

    if (existingResponse && existingResponse.length > 0) {
      // Update existing response
      const { data, error: updateError } = await supabase
        .from("survey_responses")
        .update({
          value,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingResponse[0].id)
        .select()

      if (updateError) {
        console.error("Error updating response:", updateError)
        return NextResponse.json({ error: "Failed to update response" }, { status: 500 })
      }

      result = data
    } else {
      // Insert new response
      const { data, error: insertError } = await supabase
        .from("survey_responses")
        .insert({
          task_id,
          business_id,
          user_id: user.id,
          response_type,
          value,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (insertError) {
        console.error("Error inserting response:", insertError)
        return NextResponse.json({ error: "Failed to save response" }, { status: 500 })
      }

      result = data
    }

    // Update the task status to "Completed"
    const { error: taskUpdateError } = await supabase
      .from("tasks")
      .update({ task_status: "Completed" })
      .eq("task_id", task_id)

    if (taskUpdateError) {
      console.warn("Failed to update task status:", taskUpdateError)
      // Continue execution even if task update fails
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Unexpected error in survey-response API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
