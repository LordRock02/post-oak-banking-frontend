const ACCESS_TOKEN_KEY = "post-oak-access-token"
const REFRESH_TOKEN_KEY = "post-oak-refresh-token"
/** Keys written by earlier versions; removed on logout so nothing stale lingers. */
const LEGACY_KEYS = ["post-oak-full-name", "post-oak-email"]

// Every accessor swallows storage errors (private mode, blocked site data):
// the session then just won't persist across reloads.

function read(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Non-fatal.
  }
}

export const getAccessToken = () => read(ACCESS_TOKEN_KEY)
export const getRefreshToken = () => read(REFRESH_TOKEN_KEY)

export function setAccessToken(accessToken: string) {
  write(ACCESS_TOKEN_KEY, accessToken)
}

export function setTokens(tokens: { accessToken: string; refreshToken: string }) {
  write(ACCESS_TOKEN_KEY, tokens.accessToken)
  write(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

export function clearTokens() {
  try {
    for (const key of [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ...LEGACY_KEYS]) {
      localStorage.removeItem(key)
    }
  } catch {
    // Non-fatal.
  }
}
