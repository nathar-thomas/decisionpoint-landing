import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"

// We'll use dynamic imports to handle the case where the package isn't installed
const SpeedInsightsScript = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              // Only load if the package exists
              if (typeof window !== 'undefined') {
                import('@vercel/speed-insights/next').then(({ SpeedInsights }) => {
                  // The package exists and was loaded
                  console.log('Speed Insights loaded successfully');
                }).catch(err => {
                  // The package doesn't exist, silently fail
                  console.log('Speed Insights not available:', err.message);
                });
              }
            } catch (e) {
              // Silently fail if there's an error
              console.log('Error loading Speed Insights:', e.message);
            }
          })();
        `,
      }}
    />
  )
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DecisionPoint - Fewer follow-ups. Faster deals.",
  description:
    "DecisionPoint helps business brokers simplify seller onboarding, organize documents, and get to closing day with less chaos.",
  generator: "v0.dev",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense>
          {children}
          <Analytics />
          {/* This script will try to load SpeedInsights if available */}
          <SpeedInsightsScript />
        </Suspense>
      </body>
    </html>
  )
}
