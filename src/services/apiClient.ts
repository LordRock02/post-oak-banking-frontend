import axios from "axios"
import type { AxiosError, InternalAxiosRequestConfig } from "axios"

import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from "@/lib/authStorage"

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080"
const REFRESH_PATH = "/api/v1/auth/refresh"

declare module "axios" {
  interface AxiosRequestConfig {
    /** Public endpoint (login, register): no Bearer token, and a 401 is never refreshed. */
    skipAuth?: boolean
  }
}

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  /** Set once a request has been retried after a refresh, so a second 401 can't loop. */
  _retry?: boolean
}

export class ApiError extends Error {
  /** HTTP status, or 0 if the request never reached the server. */
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

function toApiError(error: AxiosError): ApiError {
  if (!error.response) {
    return new ApiError(0, "Can't reach the server. Is the backend running?")
  }
  const { status, statusText, data } = error.response
  const body = data as { message?: string; error?: string } | string | undefined
  const message =
    (typeof body === "object" && body && (body.message ?? body.error)) ||
    statusText ||
    `Request failed with status ${status}`
  return new ApiError(status, message)
}

/* ---------- Session expiry ---------- */

type SessionExpiredHandler = () => void

const redirectToLogin: SessionExpiredHandler = () => window.location.assign("/login")
let onSessionExpired: SessionExpiredHandler = redirectToLogin

/**
 * Lets <AuthProvider> handle an unrecoverable 401 in-app (reset state + router
 * redirect) instead of the full-page reload fallback. Returns an unsubscribe.
 */
export function setSessionExpiredHandler(handler: SessionExpiredHandler) {
  onSessionExpired = handler
  return () => {
    if (onSessionExpired === handler) onSessionExpired = redirectToLogin
  }
}

function expireSession() {
  clearTokens()
  onSessionExpired()
}

/* ---------- Token refresh ---------- */

/** Shared in-flight refresh, so concurrent 401s trigger a single /auth/refresh call. */
let refreshInFlight: Promise<string> | null = null

function refreshAccessToken(): Promise<string> {
  refreshInFlight ??= (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) throw new Error("No refresh token stored.")
    // Bare axios, not `api`: the refresh call must bypass our interceptors.
    const { data } = await axios.post<{ accessToken: string }>(`${API_BASE_URL}${REFRESH_PATH}`, {
      refreshToken,
    })
    setAccessToken(data.accessToken)
    return data.accessToken
  })().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

/* ---------- Axios instance ---------- */

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  if (!config.skipAuth) {
    const token = getAccessToken()
    if (token) config.headers.set("Authorization", `Bearer ${token}`)
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) throw error

    const original = error.config as RetriableRequestConfig | undefined
    const canRefresh =
      error.response?.status === 401 && original && !original.skipAuth && !original._retry

    if (!canRefresh) throw toApiError(error)

    original._retry = true
    let token: string
    try {
      token = await refreshAccessToken()
    } catch {
      expireSession()
      throw toApiError(error)
    }

    original.headers.set("Authorization", `Bearer ${token}`)
    return api(original)
  }
)
