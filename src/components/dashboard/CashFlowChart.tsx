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
import { aggregateCashFlow } from "@/lib/finance"
import {
  formatCompactCurrency,
  formatCurrency,
  formatShortDate,
} from "@/lib/format"
import type { CashFlowPoint, Timeframe } from "@/types"

/**
 * Series colours validated for colour-vision deficiency separation and
 * ≥3:1 contrast on white (teal-600 / rose-600).
 */
const SERIES = {
  income: { label: "Income", color: "#0d9488" },
  expenses: { label: "Expenses", color: "#e11d48" },
} as const

const TIMEFRAMES = [
  { value: "7D", label: "7D" },
  { value: "30D", label: "30D" },
  { value: "90D", label: "90D" },
] as const satisfies readonly { value: Timeframe; label: string }[]

const AXIS_TICK = { fontSize: 12, fill: "#64748b" }

function CashFlowTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload as CashFlowPoint
  const net = point.income - point.expenses

  return (
    <div className="min-w-44 rounded-xl bg-white/95 px-3.5 py-3 shadow-lg ring-1 ring-slate-900/10 backdrop-blur-sm">
      <p className="mb-2 text-xs font-medium text-slate-500">{point.label}</p>
      <dl className="flex flex-col gap-1.5 text-sm">
        {(Object.keys(SERIES) as (keyof typeof SERIES)[]).map((key) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-2 text-slate-600">
              <span className="size-2 rounded-full" style={{ backgroundColor: SERIES[key].color }} />
              {SERIES[key].label}
            </dt>
            <dd className="font-semibold text-slate-900 tabular-nums">
              {formatCurrency(point[key])}
            </dd>
          </div>
        ))}
        <div className="mt-1 flex items-center justify-between gap-4 border-t border-slate-100 pt-1.5">
          <dt className="text-slate-500">Net</dt>
          <dd className="font-semibold text-slate-900 tabular-nums">
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
      <span className="flex items-center gap-2 text-xs text-slate-500">
        <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </span>
      <span className="text-lg font-semibold text-slate-900 tabular-nums">
        {formatCurrency(total)}
      </span>
    </div>
  )
}

export function CashFlowChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>("30D")
  const { isLoading, transactions, today } = useDashboardData()
  const reduceMotion = usePrefersReducedMotion()
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
      className="flex scroll-mt-20 flex-col gap-5 rounded-2xl bg-white p-5 ring-1 ring-slate-900/5 sm:p-6"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <h2 id="cash-flow-title" className="text-base font-semibold text-slate-900">
            Cash flow
          </h2>
          {isLoading ? (
            <div className="flex gap-6">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </div>
          ) : (
            <div className="flex gap-6">
              <LegendItem {...SERIES.income} total={totals.income} />
              <LegendItem {...SERIES.expenses} total={totals.expenses} />
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
                {(Object.keys(SERIES) as (keyof typeof SERIES)[]).map((key) => (
                  <linearGradient key={key} id={`${gradientId}-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SERIES[key].color} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={SERIES[key].color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
                minTickGap={28}
                tickMargin={8}
              />
              <YAxis
                tickFormatter={formatCompactCurrency}
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                content={CashFlowTooltip}
                cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }}
                isAnimationActive={!reduceMotion}
                animationDuration={150}
              />
              {(Object.keys(SERIES) as (keyof typeof SERIES)[]).map((key) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={SERIES[key].label}
                  stroke={SERIES[key].color}
                  strokeWidth={2}
                  fill={`url(#${gradientId}-${key})`}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
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
