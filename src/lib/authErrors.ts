import { ApiError } from "@/services/apiClient"

/** Maps a /auth/login failure to a user-facing message. */
export function loginErrorMessage(err: unknown) {
  if (err instanceof ApiError) {
    if (err.status === 401 || err.status === 403) return "Invalid credentials."
    return err.message || "Something went wrong. Please try again."
  }
  return "Something went wrong. Please try again."
}

/** Maps a /usuarios (register) failure to a user-facing message. */
export function registerErrorMessage(err: unknown) {
  if (err instanceof ApiError) {
    // The backend rejects a duplicate email with a bare 403 (no body).
    if (err.status === 403 || err.status === 409) {
      return "An account with that email already exists."
    }
    return err.message || "Something went wrong. Please try again."
  }
  return "Something went wrong. Please try again."
}
