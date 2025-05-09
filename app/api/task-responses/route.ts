import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log("[task-responses] ▶️ POST start")

  try {
    const body = await request.json()
    console.log("[task-responses] 📥 Payload:", body)

    // Initialize Supabase client
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
    if (!body.task_id || !body.business_id) {
      console.error("[task-responses] ❌ Missing required fields:", {
        task_id: body.task_id,
        business_id: body.business_id,
      })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Build the upsert payload with only existing columns
    const payload = {
      task_id: body.task_id,
      business_id: body.business_id,
      value: body.response_value,
      updated_at: new Date().toISOString(),
      user_id: user.id, // Include user_id for new records
    }
    console.log("[task-responses] 🛠 Upsert payload:", payload)

    // Upsert into survey_responses
    const { data, error } = await supabase
      .from("survey_responses")
      .upsert(payload, { onConflict: ["business_id", "task_id"] })
      .select()

    if (error) {
      console.error("[task-responses] ❌ Upsert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[task-responses] ✅ Upsert success:", data)

    // Update the task status to "Completed"
    const { error: taskUpdateError } = await supabase
      .from("tasks")
      .update({ task_status: "Completed" })
      .eq("task_id", body.task_id)

    if (taskUpdateError) {
      console.warn("[task-responses] ⚠️ Task status update error:", taskUpdateError)
      // Continue execution even if task update fails
    } else {
      console.log("[task-responses] 🔄 Task marked Completed")
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[task-responses] ❌ Unexpected error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
