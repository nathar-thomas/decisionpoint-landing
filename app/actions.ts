"use server"

import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import VerificationEmail from "@/emails/verification-email"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { createHash } from "crypto"

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

type SubscribeResponse = {
  success: boolean
  isDuplicate?: boolean
  message: string
  debug?: any
}

// Enhanced rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds
const MAX_SUBMISSIONS_PER_WINDOW = 3 // Reduced from 5 to 3 per hour

// Track submissions in memory (for a production app, use Redis or similar)
const submissions: Record<string, { count: number; timestamp: number }> = {}

// Enhanced server-side email validation
function isValidEmailServer(email: string): boolean {
  // Basic format check
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!basicEmailRegex.test(email)) {
    console.log("Invalid email rejected: Failed basic format check")
    return false
  }

  // More comprehensive email validation
  // This regex checks for proper email format with various validations
  const strictEmailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (!strictEmailRegex.test(email)) {
    console.log("Invalid email rejected: Failed strict format check")
    return false
  }

  // We're removing the TLD check and most suspicious pattern checks
  // Only keeping the most obvious spam patterns
  const suspiciousPatterns = [/^test@/i, /^example@/i, /^noreply@/i, /^no-reply@/i]

  if (suspiciousPatterns.some((pattern) => pattern.test(email))) {
    console.log("Invalid email rejected: Contains obvious test patterns")
    return false
  }

  // Removed disposable domain check

  return true
}

export async function subscribeToWaitlist(formData: FormData): Promise<SubscribeResponse> {
  const isDebugMode = process.env.NODE_ENV !== "production"
  const debugInfo: Record<string, any> = {}

  if (isDebugMode) console.log("[Server Action] subscribeToWaitlist called")

  // Check honeypot field
  const honeypot = formData.get("honeypot") as string
  if (honeypot) {
    // This is likely a bot - silently reject but show success message
    console.log("Bot detected via honeypot")
    if (isDebugMode) console.log("[Server Action] Honeypot field filled - likely bot")
    return {
      success: true,
      message: "Thanks for joining our waitlist! We'll keep you updated.",
      debug: isDebugMode ? { honeypot: true } : undefined,
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

    if (isDebugMode) {
      console.log("[Server Action] Created new client ID:", clientId)
      debugInfo.newClientId = true
    }
  } else if (isDebugMode) {
    console.log("[Server Action] Using existing client ID")
    debugInfo.existingClientId = true
  }

  // Check rate limit
  const now = Date.now()
  if (submissions[clientId]) {
    // Clean up old entries
    if (now - submissions[clientId].timestamp > RATE_LIMIT_WINDOW) {
      submissions[clientId] = { count: 1, timestamp: now }
      if (isDebugMode) {
        console.log("[Server Action] Reset rate limit counter for client")
        debugInfo.rateLimitReset = true
      }
    } else if (submissions[clientId].count >= MAX_SUBMISSIONS_PER_WINDOW) {
      console.log(`Rate limit exceeded: ${submissions[clientId].count} submissions in the last hour`)
      if (isDebugMode) {
        console.log("[Server Action] Rate limit exceeded for client")
        debugInfo.rateLimitExceeded = true
      }
      return {
        success: false,
        message: "Rate limit exceeded. Please try again later.",
        debug: isDebugMode ? debugInfo : undefined,
      }
    } else {
      submissions[clientId].count += 1
      if (isDebugMode) {
        console.log("[Server Action] Incremented submission count:", submissions[clientId].count)
        debugInfo.submissionCount = submissions[clientId].count
      }
    }
  } else {
    submissions[clientId] = { count: 1, timestamp: now }
    if (isDebugMode) {
      console.log("[Server Action] First submission for client")
      debugInfo.firstSubmission = true
    }
  }

  const email = formData.get("email") as string

  if (isDebugMode) {
    console.log("[Server Action] Email:", email)
    debugInfo.email = email
  }

  // Server-side email validation
  if (!isValidEmailServer(email)) {
    console.log("Invalid email rejected on server:", email)
    return {
      success: false,
      message: "Please enter a valid email address.",
      debug: isDebugMode ? { ...debugInfo, invalidEmail: true } : undefined,
    }
  }

  // Extract UTM parameters from form data
  const utmParams = {
    utm_source: (formData.get("utm_source") as string) || null,
    utm_medium: (formData.get("utm_medium") as string) || null,
    utm_campaign: (formData.get("utm_campaign") as string) || null,
    utm_content: (formData.get("utm_content") as string) || null,
    utm_term: (formData.get("utm_term") as string) || null,
  }

  if (isDebugMode && Object.values(utmParams).some((v) => v)) {
    console.log("[Server Action] UTM params present:", utmParams)
    debugInfo.utmParams = utmParams
  }

  try {
    // Initialize Supabase client
    if (isDebugMode) console.log("[Server Action] Initializing Supabase client")
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Generate verification token
    const verificationToken = createHash("sha256").update(`${email}${Date.now()}${Math.random()}`).digest("hex")

    if (isDebugMode) {
      console.log("[Server Action] Generated verification token")
      debugInfo.hasVerificationToken = true
    }

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
      // Remove client_id and submission_count fields as they don't exist in the database schema
    }

    // Check if email already exists
    if (isDebugMode) console.log("[Server Action] Checking if email already exists")
    const { data: existingUser, error: lookupError } = await supabase
      .from("waitlist")
      .select("email, verified")
      .eq("email", email.toLowerCase().trim())
      .single()

    if (lookupError && lookupError.code !== "PGRST116") {
      // Error other than "not found"
      console.error("[Server Action] Error checking for existing email:", lookupError)
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
        debug: isDebugMode ? { ...debugInfo, lookupError: lookupError } : undefined,
      }
    }

    if (existingUser) {
      // Email already exists
      if (isDebugMode) {
        console.log("[Server Action] Email already exists, verified:", existingUser.verified)
        debugInfo.emailExists = true
        debugInfo.emailVerified = existingUser.verified
      }

      if (existingUser.verified) {
        // Already verified
        return {
          success: true,
          isDuplicate: true,
          message: "You're already on the waitlist! We'll be in touch soon.",
          debug: isDebugMode ? debugInfo : undefined,
        }
      } else {
        // Not verified yet, resend verification email
        // Update the verification token
        if (isDebugMode) console.log("[Server Action] Updating verification token for existing unverified email")
        const { error: updateError } = await supabase
          .from("waitlist")
          .update({
            verification_token: verificationToken,
            verification_sent_at: new Date().toISOString(),
            // Remove client_id and submission_count fields
          })
          .eq("email", email.toLowerCase().trim())

        if (updateError) {
          console.error("[Server Action] Error updating verification token:", updateError)
          return {
            success: false,
            message: "Something went wrong. Please try again later.",
            debug: isDebugMode ? { ...debugInfo, updateError: updateError } : undefined,
          }
        }

        // Send verification email
        try {
          if (isDebugMode) console.log("[Server Action] Resending verification email")
          await resend.emails.send({
            from: "DecisionPoint <hello@decisionpnt.com>",
            to: email,
            subject: "Verify your email for DecisionPoint",
            react: VerificationEmail({
              recipientEmail: email,
              verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`,
            }),
          })

          if (isDebugMode) console.log("[Server Action] Verification email resent successfully")
        } catch (emailError) {
          console.error("[Server Action] Error sending verification email:", emailError)
          debugInfo.emailError = String(emailError)
        }

        return {
          success: true,
          isDuplicate: true,
          message: "We've sent you another verification email. Please check your inbox.",
          debug: isDebugMode ? debugInfo : undefined,
        }
      }
    }

    // Insert new user
    if (isDebugMode) console.log("[Server Action] Inserting new user into waitlist")
    const { error } = await supabase.from("waitlist").insert([data])

    // Handle errors
    if (error) {
      console.error("[Server Action] Error inserting into waitlist:", error)
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
        debug: isDebugMode ? { ...debugInfo, insertError: error } : undefined,
      }
    }

    // For new subscribers, send a verification email
    try {
      if (isDebugMode) console.log("[Server Action] Sending verification email to new user")
      await resend.emails.send({
        from: "DecisionPoint <hello@decisionpnt.com>",
        to: email,
        subject: "Verify your email for DecisionPoint",
        react: VerificationEmail({
          recipientEmail: email,
          verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`,
        }),
      })

      if (isDebugMode) console.log("[Server Action] Verification email sent successfully")
    } catch (emailError) {
      console.error("[Server Action] Error sending verification email:", emailError)
      debugInfo.emailError = String(emailError)
    }

    // Success case for new submission
    return {
      success: true,
      isDuplicate: false,
      message: "Thanks for joining! Please check your email to verify your address.",
      debug: isDebugMode ? debugInfo : undefined,
    }
  } catch (err) {
    console.error("[Server Action] Unexpected error in subscribeToWaitlist:", err)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
      debug: isDebugMode ? { ...debugInfo, unexpectedError: String(err) } : undefined,
    }
  }
}
