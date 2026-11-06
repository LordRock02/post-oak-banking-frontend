import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { cn } from "cn"

import { formatPercent } from "@/lib/format"

interface TrendIndicatorProps {
  /** Percentage change; sign determines direction. */
  value: number
  /** When true, an increase is unfavourable (e.g. spending). */
  invert?: boolean
  label?: string
  /** Use light text for dark surfaces. */
  onDark?: boolean
  className?: string
}

/**
 * Direction is always conveyed by icon + sign, never by colour alone.
 */
export function TrendIndicator({
  value,
  invert = false,
  label,
  onDark = false,
  className,
}: TrendIndicatorProps) {
  const flat = Math.abs(value) < 0.05
  const up = value > 0
  const favourable = flat ? null : up !== invert
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight

  const tone =
    favourable === null
      ? onDark ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-600"
      : favourable
        ? onDark ? "bg-emerald-400/15 text-emerald-300" : "bg-emerald-50 text-emerald-700"
        : onDark ? "bg-rose-400/15 text-rose-300" : "bg-rose-50 text-rose-700"

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold tabular-nums",
          tone
        )}
      >
        <Icon className="size-3" strokeWidth={2.5} aria-hidden="true" />
        <span className="sr-only">{flat ? "No change" : up ? "Up" : "Down"}</span>
        {formatPercent(value)}
      </span>
      {label && (
        <span className={onDark ? "text-slate-400" : "text-slate-500"}>{label}</span>
      )}
    </span>
  )
}
