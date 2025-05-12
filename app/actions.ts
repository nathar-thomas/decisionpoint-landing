"use server"

import { createClient } from "@supabase/supabase-js"

type UtmParams = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

export async function subscribeToWaitlist(formData: FormData) {
  const email = formData.get("email") as string

  // Extract UTM parameters from form data
  const utmParams: UtmParams = {
    utm_source: (formData.get("utm_source") as string) || null,
    utm_medium: (formData.get("utm_medium") as string) || null,
    utm_campaign: (formData.get("utm_campaign") as string) || null,
    utm_content: (formData.get("utm_content") as string) || null,
    utm_term: (formData.get("utm_term") as string) || null,
  }

  if (!email || !email.includes("@")) {
    return { success: false, message: "Please enter a valid email address." }
  }

  try {
    // Initialize Supabase client with service role key (server-side only)
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Prepare data for insertion
    const data = {
      email: email.toLowerCase().trim(),
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_content: utmParams.utm_content,
      utm_term: utmParams.utm_term,
      created_at: new Date().toISOString(),
    }

    // Insert data into waitlist table
    const { error } = await supabase.from("waitlist").insert([data])

    // Check for duplicate email error
    if (error && error.code === "23505") {
      // PostgreSQL unique constraint violation
      return {
        success: true,
        message: "You're already on the waitlist! We'll be in touch soon.",
      }
    }

    // Handle other errors
    if (error) {
      console.error("Error inserting into waitlist:", error)
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      }
    }

    // Success case
    return {
      success: true,
      message: "Thanks for joining our waitlist! We'll keep you updated.",
    }
  } catch (err) {
    console.error("Unexpected error in subscribeToWaitlist:", err)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    }
  }
}
