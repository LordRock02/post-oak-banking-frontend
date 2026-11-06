import { createContext } from "react"

import type { AuthStatus } from "@/state/authReducer"
import type { LoginPayload, RegisterPayload, User } from "@/types"

export interface AuthContextState {
  status: AuthStatus
  user: User | null
  isAuthenticated: boolean
  /** True while the stored session is being validated on app load. */
  isLoading: boolean
}

export interface AuthActions {
  login: (input: LoginPayload) => Promise<void>
  register: (input: RegisterPayload) => Promise<void>
  logout: () => void
}

/**
 * State and actions live in separate contexts so components that only
 * trigger actions don't re-render on every state change.
 */
export const AuthStateContext = createContext<AuthContextState | null>(null)
export const AuthActionsContext = createContext<AuthActions | null>(null)
