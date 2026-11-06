const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080"

export class ApiError extends Error {
  /** HTTP status, or 0 if the request never reached the server. */
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

type TokenGetter = () => string | null
/** Attempts a token refresh; resolves to the new access token, or null if refresh failed. */
type UnauthorizedHandler = () => Promise<string | null>

let getAccessToken: TokenGetter = () => null
let onUnauthorized: UnauthorizedHandler = () => Promise.resolve(null)

/** Wires the client to the auth layer. Called once from <AuthProvider>. */
export function configureApiClient(options: {
  getAccessToken: TokenGetter
  onUnauthorized: UnauthorizedHandler
}) {
  getAccessToken = options.getAccessToken
  onUnauthorized = options.onUnauthorized
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  /** Attach the Bearer token and retry-on-401. Defaults to true. */
  auth?: boolean
}

async function readBody(response: Response) {
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function request<T>(
  path: string,
  { method = "GET", body, auth = true }: RequestOptions = {},
  isRetry = false
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (auth) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, "Can't reach the server. Is the backend running?")
  }

  if (response.status === 401 && auth && !isRetry) {
    const newToken = await onUnauthorized()
    if (newToken) return request<T>(path, { method, body, auth }, true)
  }

  if (!response.ok) {
    const data = await readBody(response)
    const message =
      (typeof data === "object" && data && (data.message ?? data.error)) ||
      response.statusText ||
      `Request failed with status ${response.status}`
    throw new ApiError(response.status, message)
  }

  return (await readBody(response)) as T
}

export const apiClient = {
  get: <T,>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T,>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),
}
