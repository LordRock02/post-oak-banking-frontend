import { useCallback, useEffect, useMemo, useReducer } from "react"
import type { ReactNode } from "react"
import { useNavigate } from "react-router"

import { setSessionExpiredHandler } from "@/services/apiClient"
import * as authService from "@/services/authService"
import { clearTokens, getAccessToken, setTokens } from "@/lib/authStorage"
import { authReducer, initialAuthState } from "@/state/authReducer"
import { AuthActionsContext, AuthStateContext } from "@/state/AuthContext"
import type { AuthActions, AuthContextState } from "@/state/AuthContext"
import type { LoginPayload, RegisterPayload } from "@/types"

/** Must be rendered inside the router: it redirects to /login when the session expires. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, Boolean(getAccessToken()), initialAuthState)
  const navigate = useNavigate()

  const logout = useCallback(() => {
    clearTokens()
    dispatch({ type: "LOGGED_OUT" })
  }, [])

  // The API client has already cleared the tokens by the time this runs.
  useEffect(
    () =>
      setSessionExpiredHandler(() => {
        dispatch({ type: "LOGGED_OUT" })
        navigate("/login", { replace: true })
      }),
    [navigate]
  )

  // Validate a stored token once on load. A 401 here goes through the
  // interceptor's refresh flow first; anything still failing ends the session.
  useEffect(() => {
    if (!getAccessToken()) return
    let cancelled = false
    authService
      .getCurrentUser()
      .then((user) => {
        if (!cancelled) dispatch({ type: "AUTHENTICATED", user })
      })
      .catch(() => {
        if (!cancelled) logout()
      })
    return () => {
      cancelled = true
    }
  }, [logout])

  const login = useCallback(async (input: LoginPayload) => {
    setTokens(await authService.login(input))
    try {
      dispatch({ type: "AUTHENTICATED", user: await authService.getCurrentUser() })
    } catch (err) {
      clearTokens()
      throw err
    }
  }, [])

  const register = useCallback((input: RegisterPayload) => authService.register(input), [])

  const actions = useMemo<AuthActions>(() => ({ login, register, logout }), [login, register, logout])

  const value = useMemo<AuthContextState>(
    () => ({
      ...state,
      isAuthenticated: state.status === "authenticated",
      isLoading: state.status === "checking",
    }),
    [state]
  )

  return (
    <AuthActionsContext.Provider value={actions}>
      <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>
    </AuthActionsContext.Provider>
  )
}
