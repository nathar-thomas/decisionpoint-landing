"use server"

import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import VerificationEmail from "@/emails/verification-email"
// Add these imports at the top:
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

// Add to your existing imports
import { createHash } from "crypto"

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

type SubscribeResponse = {
  success: boolean
  isDuplicate?: boolean
  message: string
}

// Add a simple rate limiting mechanism before your main function:
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds
const MAX_SUBMISSIONS_PER_WINDOW = 5

// Track submissions in memory (for a production app, use Redis or similar)
const submissions: Record<string, { count: number; timestamp: number }> = {}

// Then modify your subscribeToWaitlist function:
export async function subscribeToWaitlist(formData: FormData): Promise<SubscribeResponse> {
  // Check honeypot field
  const honeypot = formData.get("honeypot") as string
  if (honeypot) {
    // This is likely a bot - silently reject but show success message
    return {
      success: true,
      message: "Thanks for joining our waitlist! We'll keep you updated.",
    }
  }

  // Get the token from the form data
  const turnstileToken = formData.get("cf-turnstile-response") as string

  // Verify the token with Cloudflare if provided
  if (turnstileToken) {
    try {
      const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        return {
          success: false,
          message: "CAPTCHA verification failed. Please try again.",
        }
      }
    } catch (error) {
      console.error("Error verifying CAPTCHA:", error)
      return {
        success: false,
        message: "Error verifying CAPTCHA. Please try again later.",
      }
    }
  }

  // Get client identifier (IP or cookie)
  let clientId = cookies().get("client_id")?.value

  if (!clientId) {
    // Set a persistent cookie if none exists
    clientId = uuidv4()
    cookies().set("client_id", clientId, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
  }

  // Check rate limit
  const now = Date.now()
  if (submissions[clientId]) {
    // Clean up old entries
    if (now - submissions[clientId].timestamp > RATE_LIMIT_WINDOW) {
      submissions[clientId] = { count: 1, timestamp: now }
    } else if (submissions[clientId].count >= MAX_SUBMISSIONS_PER_WINDOW) {
      return {
        success: false,
        message: "Too many submissions. Please try again later.",
      }
    } else {
      submissions[clientId].count += 1
    }
  } else {
    submissions[clientId] = { count: 1, timestamp: now }
  }

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
    // Initialize Supabase client
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Generate verification token
    const verificationToken = createHash("sha256").update(`${email}${Date.now()}${Math.random()}`).digest("hex")

    // Prepare data for insertion
    const data = {
      email: email.toLowerCase().trim(),
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_content: utmParams.utm_content,
      utm_term: utmParams.utm_term,
      created_at: new Date().toISOString(),
      verified: false,
      verification_token: verificationToken,
      verification_sent_at: new Date().toISOString(),
    }

    // Check if email already exists
    const { data: existingUser, error: lookupError } = await supabase
      .from("waitlist")
      .select("email, verified")
      .eq("email", email.toLowerCase().trim())
      .single()

    if (lookupError && lookupError.code !== "PGRST116") {
      // Error other than "not found"
      console.error("Error checking for existing email:", lookupError)
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      }
    }

    if (existingUser) {
      // Email already exists
      if (existingUser.verified) {
        // Already verified
        return {
          success: true,
          isDuplicate: true,
          message: "You're already on the waitlist! We'll be in touch soon.",
        }
      } else {
        // Not verified yet, resend verification email
        // Update the verification token
        const { error: updateError } = await supabase
          .from("waitlist")
          .update({
            verification_token: verificationToken,
            verification_sent_at: new Date().toISOString(),
          })
          .eq("email", email.toLowerCase().trim())

        if (updateError) {
          console.error("Error updating verification token:", updateError)
          return {
            success: false,
            message: "Something went wrong. Please try again later.",
          }
        }

        // Send verification email
        try {
          await resend.emails.send({
            from: "DecisionPoint <hello@decisionpnt.com>",
            to: email,
            subject: "Verify your email for DecisionPoint",
            react: VerificationEmail({
              recipientEmail: email,
              verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`,
            }),
          })

          console.log("Verification email resent successfully to:", email)
        } catch (emailError) {
          console.error("Error sending verification email:", emailError)
        }

        return {
          success: true,
          isDuplicate: true,
          message: "We've sent you another verification email. Please check your inbox.",
        }
      }
    }

    // Insert new user
    const { error } = await supabase.from("waitlist").insert([data])

    // Handle errors
    if (error) {
      console.error("Error inserting into waitlist:", error)
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      }
    }

    // For new subscribers, send a verification email
    try {
      await resend.emails.send({
        from: "DecisionPoint <hello@decisionpnt.com>",
        to: email,
        subject: "Verify your email for DecisionPoint",
        react: VerificationEmail({
          recipientEmail: email,
          verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`,
        }),
      })

      console.log("Verification email sent successfully to:", email)
    } catch (emailError) {
      console.error("Error sending verification email:", emailError)
    }

    // Success case for new submission
    return {
      success: true,
      isDuplicate: false,
      message: "Thanks for joining! Please check your email to verify your address.",
    }
  } catch (err) {
    console.error("Unexpected error in subscribeToWaitlist:", err)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    }
  }
}
