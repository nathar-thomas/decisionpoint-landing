"use server"

import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import WelcomeEmail from "@/emails/welcome-email"

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

type SubscribeResponse = {
  success: boolean
  isDuplicate?: boolean
  message: string
}

export async function subscribeToWaitlist(formData: FormData): Promise<SubscribeResponse> {
  const email = formData.get("email") as string

  // Extract UTM parameters from form data
  const utmParams = {
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
        isDuplicate: true,
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

    // For new subscribers, send a welcome email
    try {
      await resend.emails.send({
        from: "DecisionPoint <hello@yourdomain.com>", // Change to your verified domain
        to: email,
        subject: "Welcome to the DecisionPoint Waitlist",
        react: WelcomeEmail({ recipientEmail: email }),
      })

      console.log("Welcome email sent successfully to:", email)
    } catch (emailError) {
      // Log email error but don't fail the subscription
      console.error("Error sending welcome email:", emailError)
      // The user is still added to the waitlist even if the email fails
    }

    // Success case for new submission
    return {
      success: true,
      isDuplicate: false,
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
