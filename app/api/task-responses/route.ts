import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log("[task-responses] ▶️ POST handler start")

  try {
    // Parse the request body
    const body = await request.json()
    console.log("[task-responses] 📥 Payload:", body)

    const { taskId, businessId, responseType, value } = body

    console.log("[task-responses] 🔗 Initializing Supabase client")
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[task-responses] ❌ Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate required fields
    if (!taskId || !businessId || !responseType) {
      console.error("[task-responses] ❌ Missing required fields:", { taskId, businessId, responseType })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if a response already exists
    const { data: existingResponse, error: fetchError } = await supabase
      .from("survey_responses")
      .select("response_id")
      .eq("task_id", taskId)
      .eq("business_id", businessId)
      .eq("user_id", user.id)
      .limit(1)

    if (fetchError) {
      console.error("[task-responses] ❌ Error checking for existing response:", fetchError)
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
        .eq("response_id", existingResponse[0].response_id)
        .select()

      if (updateError) {
        console.error("[task-responses] ❌ Upsert error:", updateError)
        return NextResponse.json({ error: "Failed to update response" }, { status: 500 })
      }

      console.log("[task-responses] ✅ Upsert success (update):", data)
      result = data
    } else {
      // Insert new response
      const { data, error: insertError } = await supabase
        .from("survey_responses")
        .insert({
          task_id: taskId,
          business_id: businessId,
          user_id: user.id,
          responses: { value }, // Store in JSONB field
          value, // Also store in text field for compatibility
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (insertError) {
        console.error("[task-responses] ❌ Upsert error:", insertError)
        return NextResponse.json({ error: "Failed to save response" }, { status: 500 })
      }

      console.log("[task-responses] ✅ Upsert success (insert):", data)
      result = data
    }

    // Update the task status to "Completed"
    const { error: taskUpdateError } = await supabase
      .from("tasks")
      .update({ task_status: "Completed" })
      .eq("task_id", taskId)

    if (taskUpdateError) {
      console.warn("[task-responses] ⚠️ Task status update error:", taskUpdateError)
      // Continue execution even if task update fails
    } else {
      console.log("[task-responses] 🔄 Task status updated")
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("[task-responses] ❌ Unexpected error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
