import { createContext } from "react"

import type { AuthState } from "@/state/authReducer"
import type { LoginPayload, RegisterPayload } from "@/types"

export interface AuthActions {
  login: (input: LoginPayload) => Promise<void>
  register: (input: RegisterPayload) => Promise<void>
  logout: () => void
}

/**
 * State and actions live in separate contexts so components that only
 * trigger actions don't re-render on every state change.
 */
export const AuthStateContext = createContext<AuthState | null>(null)
export const AuthActionsContext = createContext<AuthActions | null>(null)
