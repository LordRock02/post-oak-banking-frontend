import { useId, useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipContentProps } from "recharts"

import { SegmentedControl } from "@/components/ui/segmented-control"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardData } from "@/hooks/useBanking"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import { useTheme } from "@/hooks/useTheme"
import type { Theme } from "@/theme/theme"
import { aggregateCashFlow } from "@/lib/finance"
import {
  formatCompactCurrency,
  formatCurrency,
  formatShortDate,
} from "@/lib/format"
import type { CashFlowPoint, Timeframe } from "@/types"

type SeriesKey = "income" | "expenses"

const SERIES_LABELS: Record<SeriesKey, string> = { income: "Income", expenses: "Expenses" }
const SERIES_KEYS = Object.keys(SERIES_LABELS) as SeriesKey[]

interface ChartPalette {
  series: Record<SeriesKey, string>
  grid: string
  tick: string
  cursor: string
  /** Matches the card surface so active dots get a clean ring. */
  surface: string
  fillOpacity: number
}

/**
 * Per-theme chart colours. Each series pair was validated against its own
 * card surface for lightness band, colour-vision-deficiency separation and
 * ≥3:1 contrast (light: teal-600 / rose-600 on white; dark: #11a596 /
 * rose-500 on slate-900). Dark mode is a separate selection, not an inversion.
 */
const CHART_PALETTES: Record<Theme, ChartPalette> = {
  light: {
    series: { income: "#0d9488", expenses: "#e11d48" },
    grid: "#f1f5f9",
    tick: "#64748b",
    cursor: "#94a3b8",
    surface: "#ffffff",
    fillOpacity: 0.22,
  },
  dark: {
    series: { income: "#11a596", expenses: "#f43f5e" },
    grid: "#1e293b",
    tick: "#94a3b8",
    cursor: "#64748b",
    surface: "#0f172a",
    fillOpacity: 0.3,
  },
}

const TIMEFRAMES = [
  { value: "7D", label: "7D" },
  { value: "30D", label: "30D" },
  { value: "90D", label: "90D" },
] as const satisfies readonly { value: Timeframe; label: string }[]

function CashFlowTooltip({
  active,
  payload,
  palette,
}: TooltipContentProps & { palette: ChartPalette }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload as CashFlowPoint
  const net = point.income - point.expenses

  return (
    <div className="min-w-44 rounded-xl bg-popover/95 px-3.5 py-3 shadow-lg ring-1 ring-foreground/10 backdrop-blur-sm">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{point.label}</p>
      <dl className="flex flex-col gap-1.5 text-sm">
        {SERIES_KEYS.map((key) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <span className="size-2 rounded-full" style={{ backgroundColor: palette.series[key] }} />
              {SERIES_LABELS[key]}
            </dt>
            <dd className="font-semibold text-foreground tabular-nums">
              {formatCurrency(point[key])}
            </dd>
          </div>
        ))}
        <div className="mt-1 flex items-center justify-between gap-4 border-t border-border/70 pt-1.5">
          <dt className="text-muted-foreground">Net</dt>
          <dd className="font-semibold text-foreground tabular-nums">
            {net >= 0 ? "+" : "−"}
            {formatCurrency(Math.abs(net))}
          </dd>
        </div>
      </dl>
    </div>
  )
}

function LegendItem({ label, color, total }: { label: string; color: string; total: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </span>
      <span className="text-lg font-semibold text-foreground tabular-nums">
        {formatCurrency(total)}
      </span>
    </div>
  )
}

export function CashFlowChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>("30D")
  const { isLoading, transactions, today } = useDashboardData()
  const reduceMotion = usePrefersReducedMotion()
  const { theme } = useTheme()
  const palette = CHART_PALETTES[theme]
  const axisTick = { fontSize: 12, fill: palette.tick }
  const gradientId = `cf${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`

  const data = useMemo(
    () => aggregateCashFlow(transactions, timeframe, today),
    [transactions, timeframe, today]
  )
  const totals = useMemo(
    () =>
      data.reduce(
        (acc, p) => ({ income: acc.income + p.income, expenses: acc.expenses + p.expenses }),
        { income: 0, expenses: 0 }
      ),
    [data]
  )

  return (
    <section
      id="cash-flow"
      aria-labelledby="cash-flow-title"
      className="flex scroll-mt-20 flex-col gap-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/5 dark:ring-white/10 sm:p-6"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <h2 id="cash-flow-title" className="text-base font-semibold text-foreground">
            Cash flow
          </h2>
          {isLoading ? (
            <div className="flex gap-6">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </div>
          ) : (
            <div className="flex gap-6">
              {SERIES_KEYS.map((key) => (
                <LegendItem
                  key={key}
                  label={SERIES_LABELS[key]}
                  color={palette.series[key]}
                  total={totals[key]}
                />
              ))}
            </div>
          )}
        </div>
        <SegmentedControl
          label="Cash flow timeframe"
          options={TIMEFRAMES}
          value={timeframe}
          onChange={setTimeframe}
          className="self-start"
        />
      </header>

      <div className="h-72 w-full">
        {isLoading ? (
          <Skeleton className="size-full rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                {SERIES_KEYS.map((key) => (
                  <linearGradient key={key} id={`${gradientId}-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.series[key]} stopOpacity={palette.fillOpacity} />
                    <stop offset="100%" stopColor={palette.series[key]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} stroke={palette.grid} />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                minTickGap={28}
                tickMargin={8}
              />
              <YAxis
                tickFormatter={formatCompactCurrency}
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                content={(props) => <CashFlowTooltip {...props} palette={palette} />}
                cursor={{ stroke: palette.cursor, strokeWidth: 1, strokeDasharray: "4 4" }}
                isAnimationActive={!reduceMotion}
                animationDuration={150}
              />
              {SERIES_KEYS.map((key) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={SERIES_LABELS[key]}
                  stroke={palette.series[key]}
                  strokeWidth={2}
                  fill={`url(#${gradientId}-${key})`}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: palette.surface }}
                  isAnimationActive={!reduceMotion}
                  animationDuration={600}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Accessible data table for screen readers */}
      <table className="sr-only">
        <caption>Cash flow by {timeframe === "90D" ? "week" : "day"}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Income</th>
            <th scope="col">Expenses</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.date}>
              <th scope="row">{p.label}</th>
              <td>{formatCurrency(p.income)}</td>
              <td>{formatCurrency(p.expenses)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
