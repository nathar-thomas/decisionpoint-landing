"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Briefcase, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function verifyEmail() {
      if (!token || !email) {
        setStatus("error")
        setMessage("Invalid verification link. Please check your email and try again.")
        return
      }

      try {
        // Initialize Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Find the waitlist entry with matching token and email
        const { data, error } = await supabase
          .from("waitlist")
          .update({ verified: true })
          .match({ email, verification_token: token })
          .select()

        if (error) {
          console.error("Verification error:", error)
          setStatus("error")
          setMessage("An error occurred during verification. Please try again later.")
          return
        }

        if (!data || data.length === 0) {
          setStatus("error")
          setMessage("Invalid or expired verification link. Please try signing up again.")
          return
        }

        // Send welcome email now that they're verified
        await fetch("/api/send-welcome", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        })

        setStatus("success")
        setMessage("Your email has been successfully verified! You are now on the DecisionPoint waitlist.")
      } catch (err) {
        console.error("Verification error:", err)
        setStatus("error")
        setMessage("An error occurred during verification. Please try again later.")
      }
    }

    verifyEmail()
  }, [token, email])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/40 bg-background">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            <span className="text-xl font-semibold">DecisionPoint</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg border">
          {status === "loading" && (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Email Verified!</h1>
              <p className="mb-6">{message}</p>
              <Button asChild>
                <Link href="/">Return to Homepage</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-8">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Verification Failed</h1>
              <p className="mb-6">{message}</p>
              <Button asChild>
                <Link href="/">Return to Homepage</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
