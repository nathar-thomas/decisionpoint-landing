import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log("[task-responses] ▶️ POST start")

  try {
    const body = await request.json()
    console.log("[task-responses] 📥 Payload:", body)
    console.log("[task-responses] ▶️ Skipping auth — payload:", body)

    // Initialize Supabase client with service-role key to bypass RLS
    console.log("[task-responses] 🔗 Initializing Supabase client")
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY, // ensure this env var is set
    )
    console.log("[task-responses] 🔑 Using service‑role supabaseAdmin")

    // Authentication check removed for Preview mode and MVP

    // Validate required fields
    if (!body.task_id || !body.business_id) {
      console.error("[task-responses] ❌ Missing required fields:", {
        task_id: body.task_id,
        business_id: body.business_id,
      })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 1️⃣ Check for existing response
    console.log("[task-responses] 🔍 SELECT existing...")
    const { data: existing, error: selectErr } = await supabaseAdmin
      .from("survey_responses")
      .select("response_id")
      .eq("business_id", body.business_id)
      .eq("task_id", body.task_id)
      .limit(1)
    if (selectErr) {
      console.error("[task-responses] ❌ Select error:", selectErr)
      return NextResponse.json({ error: selectErr.message }, { status: 500 })
    }

    // Create the base payload for upsert
    const payload = {
      business_id: body.business_id,
      task_id: body.task_id,
      value: body.response_value,
      responses: { [body.response_type]: body.response_value }, // ensure JSONB not null
      updated_at: new Date().toISOString(),
    }
    console.log("[task-responses] 🛠 Upsert payload:", payload)

    let result, dbError
    if (existing?.length) {
      console.log("[task-responses] 🔄 UPDATE existing...")
      ;({ data: result, error: dbError } = await supabaseAdmin
        .from("survey_responses")
        .update(payload)
        .eq("response_id", existing[0].response_id)
        .select())
    } else {
      console.log("[task-responses] ✏️ INSERT new...")
      // Add created_at for new records
      payload.created_at = new Date().toISOString()
      ;({ data: result, error: dbError } = await supabaseAdmin.from("survey_responses").insert(payload).select())
    }

    if (dbError) {
      console.error("[task-responses] ❌ DB write error:", dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }
    console.log("[task-responses] ✅ DB write success:", result)

    // Update the task status to "Completed"
    console.log("[task-responses] 🔄 Marking task Completed")
    const { error: taskUpdateError } = await supabaseAdmin
      .from("tasks")
      .update({ task_status: "Completed" })
      .eq("task_id", body.task_id)

    if (taskUpdateError) {
      console.warn("[task-responses] ⚠️ Task status update error:", taskUpdateError)
      // Continue execution even if task update fails
    } else {
      console.log("[task-responses] ✅ Task marked Completed")
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
