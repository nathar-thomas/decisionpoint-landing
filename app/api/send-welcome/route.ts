import { NextResponse } from "next/server"
import { Resend } from "resend"
import WelcomeEmail from "@/emails/welcome-email"

// Initialize Resend with your API key (with fallback for build)
const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder")

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if API key exists for actual email sending
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_placeholder") {
      console.log("Email would be sent to:", email)
      return NextResponse.json({ success: true, message: "Demo mode - email logged" })
    }

    // Send welcome email
    await resend.emails.send({
      from: "Pendl <hello@pendl.com>",
      to: email,
      subject: "Welcome to the Pendl Waitlist",
      react: WelcomeEmail({ recipientEmail: email }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 })
  }
}
