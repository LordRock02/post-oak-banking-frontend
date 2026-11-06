export type AuthStatus = "authenticated" | "unauthenticated"

export interface AuthState {
  status: AuthStatus
  fullName: string | null
  email: string | null
}

export type AuthAction =
  | { type: "AUTHENTICATED"; fullName: string; email: string | null }
  | { type: "LOGGED_OUT" }

export function initialAuthState(
  session: { fullName: string; email: string | null } | null
): AuthState {
  return session
    ? { status: "authenticated", fullName: session.fullName, email: session.email }
    : { status: "unauthenticated", fullName: null, email: null }
}

export function authReducer(_state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTHENTICATED":
      return { status: "authenticated", fullName: action.fullName, email: action.email }
    case "LOGGED_OUT":
      return { status: "unauthenticated", fullName: null, email: null }
  }
}
