import { NextResponse } from "next/server"
import { Resend } from "resend"
import WelcomeEmail from "@/emails/welcome-email"

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Send welcome email
    await resend.emails.send({
      from: "DecisionPoint <hello@decisionpnt.com>",
      to: email,
      subject: "Welcome to the DecisionPoint Waitlist",
      react: WelcomeEmail({ recipientEmail: email }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 })
  }
}
