"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { subscribeToWaitlist } from "@/app/actions"

export function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<{ text: string; isError: boolean; isDuplicate?: boolean } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

        {/* Hidden inputs for UTM parameters using refs */}
        <input type="hidden" name="utm_source" ref={utmSourceRef} />
        <input type="hidden" name="utm_medium" ref={utmMediumRef} />
        <input type="hidden" name="utm_campaign" ref={utmCampaignRef} />
        <input type="hidden" name="utm_content" ref={utmContentRef} />
        <input type="hidden" name="utm_term" ref={utmTermRef} />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Joining..." : "Join Waitlist"}
        </Button>
      </form>

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
    </div>
  )
}
