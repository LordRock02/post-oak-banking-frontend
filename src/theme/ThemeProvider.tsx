import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

import {
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  storeTheme,
  subscribeToSystemTheme,
  ThemeContext,
} from "@/theme/theme"
import type { Theme } from "@/theme/theme"

/**
 * Initial theme: saved preference if any, otherwise the OS preference.
 * Until the user picks a theme explicitly, OS changes are followed live.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme() ?? getSystemTheme())
  const [hasExplicitChoice, setHasExplicitChoice] = useState(() => getStoredTheme() !== null)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (hasExplicitChoice) return
    return subscribeToSystemTheme(setThemeState)
  }, [hasExplicitChoice])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    setHasExplicitChoice(true)
    storeTheme(next)
  }, [])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
    }),
    [theme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
