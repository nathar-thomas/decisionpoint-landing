"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

interface TurnstileProps {
  siteKey: string
  onVerify: (token: string) => void
  theme?: "light" | "dark" | "auto"
}

export function TurnstileCaptcha({ siteKey, onVerify, theme = "auto" }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!loaded || !containerRef.current) return

    // @ts-ignore - Turnstile is loaded via script
    window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      theme: theme,
    })

    return () => {
      // @ts-ignore - Turnstile is loaded via script
      if (window.turnstile) {
        window.turnstile.reset(containerRef.current)
      }
    }
  }, [siteKey, onVerify, theme, loaded])

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer onLoad={() => setLoaded(true)} />
      <div ref={containerRef} className="my-3" />
    </>
  )
}
