import { apiClient } from "@/services/apiClient"
import type { AuthResponse, LoginPayload, RegisterPayload } from "@/types"

/** Raw login/refresh response shape on the wire — the backend names the full name field "nombre". */
interface RawAuthResponse {
  accessToken: string
  refreshToken?: string
  nombre?: string
}

function normalize(raw: RawAuthResponse): Partial<AuthResponse> & { accessToken: string } {
  return {
    accessToken: raw.accessToken,
    ...(raw.refreshToken !== undefined && { refreshToken: raw.refreshToken }),
    ...(raw.nombre !== undefined && { fullName: raw.nombre }),
  }
}

export function register(payload: RegisterPayload): Promise<void> {
  return apiClient.post<void>("/api/v1/usuarios", payload, { auth: false })
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const raw = await apiClient.post<RawAuthResponse>("/api/v1/auth/login", payload, { auth: false })
  const { accessToken, refreshToken, fullName } = normalize(raw)
  if (!refreshToken || !fullName) {
    throw new Error("Login response is missing required fields.")
  }
  return { accessToken, refreshToken, fullName }
}

/**
 * The backend only rotates the access token on refresh — it does not return
 * a new refresh token or the user's name, so callers must keep the existing ones.
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<Partial<AuthResponse> & { accessToken: string }> {
  const raw = await apiClient.post<RawAuthResponse>(
    "/api/v1/auth/refresh",
    { refreshToken },
    { auth: false }
  )
  return normalize(raw)
}
