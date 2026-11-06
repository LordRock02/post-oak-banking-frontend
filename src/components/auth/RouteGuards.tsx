import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { Navigate, Outlet, useLocation } from "react-router"
import type { Location } from "react-router"

import { useAuthState } from "@/hooks/useAuth"

function SessionLoader() {
  return (
    <div
      role="status"
      className="flex min-h-svh items-center justify-center bg-background text-muted-foreground"
    >
      <Loader2 className="size-6 animate-spin" aria-hidden="true" />
      <span className="sr-only">Checking your session…</span>
    </div>
  )
}

/**
 * Renders its children (or the nested route) only for an authenticated user.
 * Once the initial session check finishes without a user, redirects to /login,
 * remembering where they were headed.
 */
export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { status } = useAuthState()
  const location = useLocation()

  if (status === "checking") return <SessionLoader />
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children ?? <Outlet />
}

/** For /login and /register: sends an already-signed-in user back where they came from. */
export function GuestRoute({ children }: { children?: ReactNode }) {
  const { status } = useAuthState()
  const location = useLocation()

  if (status === "checking") return <SessionLoader />
  if (status === "authenticated") {
    const from = (location.state as { from?: Location } | null)?.from
    return <Navigate to={from ?? "/"} replace />
  }
  return children ?? <Outlet />
}
