"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { subscribeToWaitlist } from "@/app/actions"

export function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [utmParams, setUtmParams] = useState({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
  })

  // Extract UTM parameters from URL on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      const params = url.searchParams

      setUtmParams({
        utm_source: params.get("utm_source") || "",
        utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || "",
        utm_content: params.get("utm_content") || "",
        utm_term: params.get("utm_term") || "",
      })
    }
  }, [])

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setMessage(null)

    try {
      const result = await subscribeToWaitlist(formData)

      if (result.success) {
        setEmail("")
        setMessage({ text: result.message, isError: false })
      } else {
        setMessage({ text: result.message, isError: true })
      }
    } catch (error) {
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

        {/* Hidden inputs for UTM parameters */}
        <input type="hidden" name="utm_source" value={utmParams.utm_source} />
        <input type="hidden" name="utm_medium" value={utmParams.utm_medium} />
        <input type="hidden" name="utm_campaign" value={utmParams.utm_campaign} />
        <input type="hidden" name="utm_content" value={utmParams.utm_content} />
        <input type="hidden" name="utm_term" value={utmParams.utm_term} />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Joining..." : "Join Waitlist"}
        </Button>
      </form>

      {message && (
        <div
          className={`text-sm p-2 rounded ${message.isError ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}
