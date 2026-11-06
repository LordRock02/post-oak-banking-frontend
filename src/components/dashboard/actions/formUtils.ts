import { useState } from "react"

/** Parses free-form currency input ("1,250.5") into a number, or NaN. */
export function parseAmount(raw: string) {
  const cleaned = raw.replace(/[,$\s]/g, "")
  return cleaned === "" ? Number.NaN : Number(cleaned)
}

/**
 * Returns a key that changes each time `open` becomes true. Keying a form on
 * it resets the form for every new session while keeping it mounted (and
 * visible) during the dialog's close animation.
 */
export function useSessionKey(open: boolean) {
  const [session, setSession] = useState(0)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setSession((s) => s + 1)
  }
  return session
}
