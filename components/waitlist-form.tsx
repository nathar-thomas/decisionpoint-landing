"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { subscribeToWaitlist } from "@/app/actions"

// Replace the entire isValidEmail function with this more permissive version
const isValidEmail = (email: string): boolean => {
  // Basic regex for email validation - this is the only check we'll do client-side
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<{ text: string; isError: boolean; isDuplicate?: boolean } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Debug status state
  const [debugStatus, setDebugStatus] = useState({
    honeypot: { status: "clear", emoji: "✅" },
    emailValid: { status: "pending", emoji: "⏳" },
    rateLimit: { status: "OK", emoji: "✅" },
    lastUpdate: "",
  })

  // Track if we're in development mode
  const isDev = process.env.NODE_ENV === "development"

  // Update email validation status when email changes
  useEffect(() => {
    if (email) {
      const isValid = isValidEmail(email)
      setDebugStatus((prev) => ({
        ...prev,
        emailValid: {
          status: isValid ? "valid" : "invalid",
          emoji: isValid ? "✅" : "❌",
        },
        lastUpdate: typeof window !== 'undefined' ? new Date().toLocaleTimeString() : "",
      }))
    } else {
      setDebugStatus((prev) => ({
        ...prev,
        emailValid: { status: "pending", emoji: "⏳" },
        lastUpdate: typeof window !== 'undefined' ? new Date().toLocaleTimeString() : "",
      }))
    }
  }, [email])

  // Use refs to store UTM parameters
  const utmSourceRef = useRef<HTMLInputElement>(null)
  const utmMediumRef = useRef<HTMLInputElement>(null)
  const utmCampaignRef = useRef<HTMLInputElement>(null)
  const utmContentRef = useRef<HTMLInputElement>(null)
  const utmTermRef = useRef<HTMLInputElement>(null)

  // Honeypot ref for checking if it's been filled
  const honeypotRef = useRef<HTMLInputElement>(null)

  // Extract UTM parameters from URL on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      const params = url.searchParams

      // Set UTM values directly on the DOM elements using refs
      if (utmSourceRef.current) utmSourceRef.current.value = params.get("utm_source") || ""
      if (utmMediumRef.current) utmMediumRef.current.value = params.get("utm_medium") || ""
      if (utmCampaignRef.current) utmCampaignRef.current.value = params.get("utm_campaign") || ""
      if (utmContentRef.current) utmContentRef.current.value = params.get("utm_content") || ""
      if (utmTermRef.current) utmTermRef.current.value = params.get("utm_term") || ""
    }
  }, [])

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setMessage(null)

    // Check honeypot field
    const honeypot = formData.get("honeypot") as string
    if (honeypot) {
      // This is likely a bot - silently reject but show success message
      console.log("Bot detected via honeypot")

      // Update debug status
      setDebugStatus((prev) => ({
        ...prev,
        honeypot: { status: "tripped", emoji: "❌" },
        lastUpdate: typeof window !== 'undefined' ? new Date().toLocaleTimeString() : "",
      }))

      setIsSubmitting(false)
      setMessage({
        text: "Thanks for joining our waitlist! We'll keep you updated.",
        isError: false,
      })
      return
    }

    const emailValue = formData.get("email") as string

    // Validate email before submission
    if (!isValidEmail(emailValue)) {
      console.log("Invalid email format rejected on client")
      setIsSubmitting(false)
      setMessage({
        text: "Please enter a valid email address.",
        isError: true,
      })
      return
    }

    try {
      const result = await subscribeToWaitlist(formData)

      // Update rate limit status based on response
      if (!result.success && result.message.includes("Too many submissions")) {
        setDebugStatus((prev) => ({
          ...prev,
          rateLimit: { status: "Blocked", emoji: "❌" },
          lastUpdate: typeof window !== 'undefined' ? new Date().toLocaleTimeString() : "",
        }))
      } else {
        setDebugStatus((prev) => ({
          ...prev,
          rateLimit: { status: "OK", emoji: "✅" },
          lastUpdate: typeof window !== 'undefined' ? new Date().toLocaleTimeString() : "",
        }))
      }

      if (result.success) {
        // Only clear the email field if it's a new submission (not a duplicate)
        if (!result.isDuplicate) {
          setEmail("")

          // Reset email validation status
          setDebugStatus((prev) => ({
            ...prev,
            emailValid: { status: "pending", emoji: "⏳" },
            lastUpdate: typeof window !== 'undefined' ? new Date().toLocaleTimeString() : "",
          }))
        }

        setMessage({
          text: result.message,
          isError: false,
          isDuplicate: result.isDuplicate,
        })
      } else {
        setMessage({ text: result.message, isError: true })
      }
    } catch (error) {
      console.error("Form submission error:", error)
      setMessage({
        text: "An unexpected error occurred. Please try again.",
        isError: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-sm space-y-3">
      <form action={handleSubmit} className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
          aria-label="Email address"
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Joining..." : "Join Waitlist"}
        </Button>

        {/* Hidden inputs for UTM parameters using refs */}
        <input type="hidden" name="utm_source" ref={utmSourceRef} />
        <input type="hidden" name="utm_medium" ref={utmMediumRef} />
        <input type="hidden" name="utm_campaign" ref={utmCampaignRef} />
        <input type="hidden" name="utm_content" ref={utmContentRef} />
        <input type="hidden" name="utm_term" ref={utmTermRef} />

        {/* Honeypot field - properly hidden with CSS */}
        <div
          className="absolute opacity-0 pointer-events-none left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden"
          aria-hidden="true"
        >
          <input type="text" name="honeypot" ref={honeypotRef} tabIndex={-1} autoComplete="off" />
        </div>
      </form>

      {/* Form submission message */}
      {message && (
        <div
          className={`text-sm p-2 rounded ${
            message.isError
              ? "bg-red-50 text-red-600"
              : message.isDuplicate
                ? "bg-yellow-50 text-yellow-800"
                : "bg-green-50 text-green-600"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Debug status display - only visible in development mode */}
      {isDev && (
        <div className="mt-4 text-xs border border-gray-200 rounded p-2 bg-gray-50">
          <h4 className="font-semibold mb-1">Debug Status:</h4>
          <div className="grid grid-cols-2 gap-1">
            <div>Honeypot:</div>
            <div>
              {debugStatus.honeypot.status} {debugStatus.honeypot.emoji}
            </div>

            <div>Email valid:</div>
            <div>
              {debugStatus.emailValid.status} {debugStatus.emailValid.emoji}
            </div>

            <div>Rate:</div>
            <div>
              {debugStatus.rateLimit.status} {debugStatus.rateLimit.emoji}
            </div>

            <div>Last update:</div>
            <div>{debugStatus.lastUpdate}</div>
          </div>
        </div>
      )}
    </div>
  )
}
