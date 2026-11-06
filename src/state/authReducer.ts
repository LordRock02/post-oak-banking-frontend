import type { User } from "@/types"

/** "checking" = a stored token is being validated against /usuarios/me. */
export type AuthStatus = "checking" | "authenticated" | "unauthenticated"

export interface AuthState {
  status: AuthStatus
  user: User | null
}

export type AuthAction = { type: "AUTHENTICATED"; user: User } | { type: "LOGGED_OUT" }

export function initialAuthState(hasStoredToken: boolean): AuthState {
  return { status: hasStoredToken ? "checking" : "unauthenticated", user: null }
}

export function authReducer(_state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTHENTICATED":
      return { status: "authenticated", user: action.user }
    case "LOGGED_OUT":
      return { status: "unauthenticated", user: null }
  }
}
