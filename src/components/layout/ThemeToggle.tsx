import { Moon, Sun } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/useTheme"

/** Header button that switches between light and dark themes. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"
  const label = isDark ? "Switch to light theme" : "Switch to dark theme"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="relative overflow-hidden rounded-xl text-muted-foreground hover:text-foreground"
    >
      <Sun
        aria-hidden="true"
        className={cn(
          "absolute size-4.5 transition-all duration-300",
          isDark ? "scale-50 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          "absolute size-4.5 transition-all duration-300",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-50 rotate-90 opacity-0"
        )}
      />
    </Button>
  )
}
