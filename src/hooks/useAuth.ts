import { useContext } from "react"

import { AuthActionsContext, AuthStateContext } from "@/state/AuthContext"

export function useAuthState() {
  const state = useContext(AuthStateContext)
  if (!state) throw new Error("useAuthState must be used within <AuthProvider>")
  return state
}

export function useAuthActions() {
  const actions = useContext(AuthActionsContext)
  if (!actions) throw new Error("useAuthActions must be used within <AuthProvider>")
  return actions
}
