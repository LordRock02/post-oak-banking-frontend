import { createContext } from "react"

export type Theme = "light" | "dark"

/** localStorage key. Keep in sync with the pre-paint script in index.html. */
export const THEME_STORAGE_KEY = "post-oak-theme"

const DARK_QUERY = "(prefers-color-scheme: dark)"

export function getSystemTheme(): Theme {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light"
}

/** Returns the explicitly saved preference, or null if the user never chose. */
export function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return value === "light" || value === "dark" ? value : null
  } catch {
    return null // storage unavailable (private mode, blocked cookies)
  }
}

export function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Non-fatal: the preference simply won't persist.
  }
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  root.style.colorScheme = theme
}

export function subscribeToSystemTheme(onChange: (theme: Theme) => void) {
  const media = window.matchMedia(DARK_QUERY)
  const listener = (e: MediaQueryListEvent) => onChange(e.matches ? "dark" : "light")
  media.addEventListener("change", listener)
  return () => media.removeEventListener("change", listener)
}

export interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
