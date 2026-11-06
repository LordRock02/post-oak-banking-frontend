import { api } from "@/services/apiClient"
import type { AuthTokens, LoginPayload, RegisterPayload, User } from "@/types"

export async function register(payload: RegisterPayload): Promise<void> {
  await api.post("/api/v1/usuarios", payload, { skipAuth: true })
}

export async function login(payload: LoginPayload): Promise<AuthTokens> {
  const { data } = await api.post<Partial<AuthTokens>>("/api/v1/auth/login", payload, {
    skipAuth: true,
  })
  if (!data.accessToken || !data.refreshToken) {
    throw new Error("Login response is missing tokens.")
  }
  return { accessToken: data.accessToken, refreshToken: data.refreshToken }
}

/** Validates the current access token and returns the signed-in user. */
export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<User>("/api/v1/usuarios/me")
  return data
}
