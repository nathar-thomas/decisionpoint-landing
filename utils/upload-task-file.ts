import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { v4 as uuidv4 } from "uuid"

/**
 * Uploads a file for a specific task and creates a record in the uploaded_files table
 * @param file The file to upload
 * @param taskId The ID of the task
 * @param businessId The ID of the business
 * @returns Object containing the file path and upload details
 */
export async function uploadTaskFile(file: File, taskId: string, businessId: string) {
  const supabase = createClientComponentClient()

  // Strict UUID validation
  const isValidUUID = (id: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(id)
  }

  // Enhanced debug logging for upload tracking
  console.log("[UploadTaskFile] Starting upload", {
    taskId,
    businessId,
    isValidTaskId: isValidUUID(taskId),
    isValidBusinessId: isValidUUID(businessId),
    filename: file?.name,
  })

  // Validate inputs
  if (!file) {
    console.warn("[UploadTaskFile] No file provided")
    throw new Error("No file selected")
  }

  if (!taskId || !businessId) {
    console.error("[UploadTaskFile] Missing taskId or businessId:", { taskId, businessId })
    throw new Error("Missing task or business information")
  }

  // Strict validation check
  if (!isValidUUID(taskId) || !isValidUUID(businessId)) {
    console.error("[UploadTaskFile] Invalid UUID format:", { taskId, businessId })
    throw new Error("Invalid task or business ID format")
  }

  try {
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error("[UploadTaskFile] Auth error:", userError)
      throw new Error("Authentication error: " + userError.message)
    }

    if (!userData?.user) {
      console.error("[UploadTaskFile] No authenticated user found")
      throw new Error("You must be logged in to upload files")
    }

    // Create file path
    const fileExt = file.name.split(".").pop() || ""
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${businessId}/${taskId}/${fileName}`

    console.log("[UploadTaskFile] Uploading to path:", filePath)

    // Upload to Storage - using the task-documents bucket
    const { data: fileData, error: uploadError } = await supabase.storage
      .from("task-documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("[UploadTaskFile] Storage upload error:", uploadError)
      throw new Error("File upload failed: " + uploadError.message)
    }

    console.log("[UploadTaskFile] File uploaded successfully:", fileData)

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage.from("task-documents").getPublicUrl(filePath)
    const fileUrl = publicUrlData?.publicUrl || null

    console.log("[UploadTaskFile] Generated public URL:", fileUrl)

    // Create database record in uploaded_files table with the file_url
    const insertData = {
      filename: file.name,
      file_path: filePath,
      file_url: fileUrl, // Store the public URL
      file_type: file.type,
      task_id: taskId,
      business_id: businessId,
      user_id: userData.user.id,
      status: "processed", // Mark as processed immediately
    }

    console.log("[UploadTaskFile] Inserting file metadata:", insertData)

    const { data: recordData, error: dbError } = await supabase
      .from("uploaded_files")
      .insert(insertData)
      .select()
      .single()

    if (dbError) {
      console.error("[UploadTaskFile] Database record error:", dbError)
      throw new Error("Failed to create file record: " + dbError.message)
    }

    console.log("[UploadTaskFile] Database record created:", recordData)

    // Update the task status to "In Progress" or "Completed"
    const { error: taskUpdateError } = await supabase
      .from("tasks")
      .update({ task_status: "Completed" })
      .eq("task_id", taskId)

    if (taskUpdateError) {
      console.warn("[UploadTaskFile] Failed to update task status:", taskUpdateError)
      // Continue execution even if task update fails
    }

    return {
      success: true,
      filePath,
      fileRecord: recordData,
      publicUrl: fileUrl,
    }
  } catch (error) {
    console.error("[UploadTaskFile] Unexpected error:", error)
    throw error
  }
}
