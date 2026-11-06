import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react"
import type { ReactNode } from "react"

import { configureApiClient } from "@/services/apiClient"
import * as authService from "@/services/authService"
import { clearSession, loadSession, storeSession } from "@/lib/authStorage"
import { authReducer, initialAuthState } from "@/state/authReducer"
import { AuthActionsContext, AuthStateContext } from "@/state/AuthContext"
import type { AuthActions } from "@/state/AuthContext"
import type { LoginPayload, RegisterPayload } from "@/types"

export function AuthProvider({ children }: { children: ReactNode }) {
  // Read localStorage once, synchronously, so there's no "checking" flash on load.
  const [session] = useState(loadSession)
  const accessTokenRef = useRef(session?.accessToken ?? null)
  const refreshTokenRef = useRef(session?.refreshToken ?? null)
  const [state, dispatch] = useReducer(authReducer, session, initialAuthState)

  const logout = useCallback(() => {
    accessTokenRef.current = null
    refreshTokenRef.current = null
    clearSession()
    dispatch({ type: "LOGGED_OUT" })
  }, [])

  /**
   * Refreshes the access token on a 401. The backend only rotates the access
   * token here — refreshToken/fullName are kept as-is unless it sends new ones.
   * Logs the user out if the refresh token is also dead.
   */
  const refresh = useCallback(async () => {
    const refreshToken = refreshTokenRef.current
    if (!refreshToken) return null
    try {
      const response = await authService.refreshAccessToken(refreshToken)
      accessTokenRef.current = response.accessToken
      const nextRefreshToken = response.refreshToken ?? refreshToken
      refreshTokenRef.current = nextRefreshToken
      const fullName = response.fullName ?? state.fullName ?? ""
      storeSession({
        accessToken: response.accessToken,
        refreshToken: nextRefreshToken,
        fullName,
        email: state.email,
      })
      if (response.fullName) dispatch({ type: "AUTHENTICATED", fullName, email: state.email })
      return response.accessToken
    } catch {
      logout()
      return null
    }
  }, [logout, state.email, state.fullName])

  useEffect(() => {
    configureApiClient({
      getAccessToken: () => accessTokenRef.current,
      onUnauthorized: refresh,
    })
  }, [refresh])

  const login = useCallback(async (input: LoginPayload) => {
    const response = await authService.login(input)
    accessTokenRef.current = response.accessToken
    refreshTokenRef.current = response.refreshToken
    storeSession({ ...response, email: input.email })
    dispatch({ type: "AUTHENTICATED", fullName: response.fullName, email: input.email })
  }, [])

  const register = useCallback((input: RegisterPayload) => authService.register(input), [])

  const actions = useMemo<AuthActions>(() => ({ login, register, logout }), [login, register, logout])

  return (
    <AuthActionsContext.Provider value={actions}>
      <AuthStateContext.Provider value={state}>{children}</AuthStateContext.Provider>
    </AuthActionsContext.Provider>
  )
}
