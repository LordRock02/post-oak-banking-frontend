const ACCESS_TOKEN_KEY = "post-oak-access-token"
const REFRESH_TOKEN_KEY = "post-oak-refresh-token"
const FULL_NAME_KEY = "post-oak-full-name"
const EMAIL_KEY = "post-oak-email"

export interface StoredSession {
  accessToken: string
  refreshToken: string
  fullName: string
  email: string | null
}

export function loadSession(): StoredSession | null {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    const fullName = localStorage.getItem(FULL_NAME_KEY)
    if (!accessToken || !refreshToken || !fullName) return null
    return { accessToken, refreshToken, fullName, email: localStorage.getItem(EMAIL_KEY) }
  } catch {
    return null // storage unavailable (private mode, blocked cookies)
  }
}

export function storeSession(session: StoredSession) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
    localStorage.setItem(FULL_NAME_KEY, session.fullName)
    if (session.email) localStorage.setItem(EMAIL_KEY, session.email)
  } catch {
    // Non-fatal: the session simply won't persist across reloads.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(FULL_NAME_KEY)
    localStorage.removeItem(EMAIL_KEY)
  } catch {
    // Non-fatal.
  }
}
