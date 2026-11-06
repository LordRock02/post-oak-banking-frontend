import type { ComponentProps, ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "cn"

interface FieldProps {
  label: string
  htmlFor: string
  hint?: ReactNode
  error?: string
  children: ReactNode
}

/** Label + control + hint/error, with the error wired up for screen readers. */
function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}

function NativeSelect({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-lg border border-input bg-white pr-9 pl-3 text-sm text-slate-900 transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

export { Field, NativeSelect }
