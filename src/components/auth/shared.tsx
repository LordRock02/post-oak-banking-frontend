import { AlertTriangle } from "lucide-react"

/** Form-level error banner, for errors not tied to a specific field (e.g. "Invalid credentials"). */
export function FormAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl bg-rose-50 p-3.5 ring-1 ring-rose-600/15 dark:bg-rose-400/10 dark:ring-rose-400/25"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
      <p className="text-sm text-rose-700 dark:text-rose-300">{message}</p>
    </div>
  )
}
