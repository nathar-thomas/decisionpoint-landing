"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { subscribeToWaitlist } from "@/app/actions"
import { TurnstileCaptcha } from "./turnstile-captcha"

const isValidEmail = (email: string): boolean => {
  // Basic regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Check basic format
  if (!emailRegex.test(email)) return false

  // Additional checks for common fake patterns
  const domain = email.split("@")[1]

  // Check for disposable email domains (add more as needed)
  const disposableDomains = ["tempmail.com", "throwaway.com", "mailinator.com", "yopmail.com"]
  if (disposableDomains.some((d) => domain.includes(d))) return false

  // Check for suspicious patterns
  if (email.includes("test") || email.includes("123")) return false

  return true
}

export function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<{ text: string; isError: boolean; isDuplicate?: boolean } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  // Use refs to store UTM parameters
  const utmSourceRef = useRef<HTMLInputElement>(null)
  const utmMediumRef = useRef<HTMLInputElement>(null)
  const utmCampaignRef = useRef<HTMLInputElement>(null)
  const utmContentRef = useRef<HTMLInputElement>(null)
  const utmTermRef = useRef<HTMLInputElement>(null)

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

    // Add the token to the form data if it exists
    if (turnstileToken) {
      formData.append("cf-turnstile-response", turnstileToken)
    }

    // Check honeypot field
    const honeypot = formData.get("honeypot") as string
    if (honeypot) {
      // This is likely a bot - silently reject but show success message
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
      setIsSubmitting(false)
      setMessage({
        text: "Please enter a valid email address.",
        isError: true,
      })
      return
    }

    try {
      const result = await subscribeToWaitlist(formData)

      if (result.success) {
        // Only clear the email field if it's a new submission (not a duplicate)
        if (!result.isDuplicate) {
          setEmail("")
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
      <form action={handleSubmit} className="flex flex-col w-full max-w-sm items-center space-y-2">
        <div className="flex w-full space-x-2">
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
        </div>

        {/* Hidden inputs for UTM parameters using refs */}
        <input type="hidden" name="utm_source" ref={utmSourceRef} />
        <input type="hidden" name="utm_medium" ref={utmMediumRef} />
        <input type="hidden" name="utm_campaign" ref={utmCampaignRef} />
        <input type="hidden" name="utm_content" ref={utmContentRef} />
        <input type="hidden" name="utm_term" ref={utmTermRef} />

        {/* Honeypot field */}
        <div className="hidden" aria-hidden="true">
          <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" />
        </div>

        {/* Add the TurnstileCaptcha component */}
        <TurnstileCaptcha
          siteKey="1x00000000000000000000AA" // Replace with your actual Cloudflare Turnstile site key
          onVerify={(token) => setTurnstileToken(token)}
        />

        {message && (
          <div
            className={`text-sm p-2 rounded w-full ${
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
      </form>
    </div>
  )
}
