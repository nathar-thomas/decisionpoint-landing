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

    // Upload to Storage
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

    // Create database record
    const { data: recordData, error: dbError } = await supabase
      .from("uploaded_files")
      .insert({
        filename: file.name,
        file_path: filePath,
        file_type: file.type,
        task_id: taskId,
        business_id: businessId,
        user_id: userData.user.id,
        status: "pending",
      })
      .select()
      .single()

    if (dbError) {
      console.error("[UploadTaskFile] Database record error:", dbError)
      throw new Error("Failed to create file record: " + dbError.message)
    }

    console.log("[UploadTaskFile] Database record created:", recordData)

    return {
      success: true,
      filePath,
      fileRecord: recordData,
    }
  } catch (error) {
    console.error("[UploadTaskFile] Unexpected error:", error)
    throw error
  }
}
