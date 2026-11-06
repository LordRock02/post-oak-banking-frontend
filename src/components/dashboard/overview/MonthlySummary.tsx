import { useMemo } from "react"
import type { LucideIcon } from "lucide-react"
import { ArrowDownLeft, ArrowUpRight, PiggyBank } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardData } from "@/hooks/useBanking"
import { monthlySummary, percentChange } from "@/lib/finance"
import { formatCurrency } from "@/lib/format"
import { TrendIndicator } from "@/components/dashboard/overview/TrendIndicator"

interface StatTileProps {
  label: string
  value: string
  icon: LucideIcon
  iconClassName: string
  trend: number
  invert?: boolean
  footnote?: string
  isLoading: boolean
}

function StatTile({ label, value, icon: Icon, iconClassName, trend, invert, footnote, isLoading }: StatTileProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-slate-900/5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex size-8 items-center justify-center rounded-lg ${iconClassName}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      {isLoading ? (
        <>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-40" />
        </>
      ) : (
        <>
          <p className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <TrendIndicator value={trend} invert={invert} label="vs. last month" />
            {footnote && <span className="text-xs text-slate-500">{footnote}</span>}
          </div>
        </>
      )}
    </div>
  )
}

export function MonthlySummary() {
  const { isLoading, transactions, today } = useDashboardData()
  const summary = useMemo(() => monthlySummary(transactions, today), [transactions, today])
  const { current, previous } = summary

  return (
    <section aria-labelledby="monthly-summary-title" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="monthly-summary-title" className="text-base font-semibold text-slate-900">
          {summary.monthLabel} so far
        </h2>
        <p className="text-xs text-slate-500">Compared with the same days last month</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          label="Money in"
          value={formatCurrency(current.income)}
          icon={ArrowDownLeft}
          iconClassName="bg-teal-50 text-teal-700"
          trend={percentChange(current.income, previous.income)}
          isLoading={isLoading}
        />
        <StatTile
          label="Money out"
          value={formatCurrency(current.expenses)}
          icon={ArrowUpRight}
          iconClassName="bg-rose-50 text-rose-700"
          trend={percentChange(current.expenses, previous.expenses)}
          invert
          isLoading={isLoading}
        />
        <StatTile
          label="Net saved"
          value={formatCurrency(current.net)}
          icon={PiggyBank}
          iconClassName="bg-slate-100 text-slate-700"
          trend={percentChange(current.net, previous.net)}
          footnote={`${Math.round(current.savingsRate)}% savings rate`}
          isLoading={isLoading}
        />
      </div>
    </section>
  )
}
