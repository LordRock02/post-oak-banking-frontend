import { useMemo } from "react"
import { ArrowUpRight, Lock, Plus, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardData } from "@/hooks/useBanking"
import { balanceChange } from "@/lib/finance"
import { formatCurrency } from "@/lib/format"
import { TrendIndicator } from "@/components/dashboard/overview/TrendIndicator"

interface BalanceHeroProps {
  onSendMoney: () => void
  onAddFunds: () => void
}

export function BalanceHero({ onSendMoney, onAddFunds }: BalanceHeroProps) {
  const { isLoading, totals, transactions, snapshots, today } = useDashboardData()

  const change = useMemo(
    () => balanceChange(totals.balance, transactions, today, 30),
    [totals.balance, transactions, today]
  )

  const availableShare = totals.balance > 0 ? (totals.available / totals.balance) * 100 : 100

  return (
    <section
      aria-label="Total balance"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-6 text-white shadow-lg shadow-slate-900/10 sm:p-7 dark:to-teal-900/60 dark:ring-1 dark:ring-white/10"
    >
      {/* Decorative glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-teal-500/20 blur-3xl"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-400">Total balance</p>
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-56 bg-white/10" />
              <Skeleton className="h-5 w-48 bg-white/10" />
            </>
          ) : (
            <>
              <p className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                {formatCurrency(totals.balance)}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <TrendIndicator value={change.percent} onDark />
                <span className="text-slate-400">
                  {change.amount >= 0 ? "+" : "−"}
                  {formatCurrency(Math.abs(change.amount))} in the last 30 days · across{" "}
                  {snapshots.length} {snapshots.length === 1 ? "account" : "accounts"}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            size="lg"
            onClick={onSendMoney}
            disabled={isLoading || snapshots.length === 0}
            className="h-10 flex-1 rounded-xl bg-white px-4 text-slate-900 hover:bg-slate-100 lg:flex-none"
          >
            <ArrowUpRight data-icon="inline-start" />
            Send money
          </Button>
          <Button
            size="lg"
            onClick={onAddFunds}
            disabled={isLoading || snapshots.length === 0}
            className="h-10 flex-1 rounded-xl bg-white/10 px-4 text-white ring-1 ring-white/15 hover:bg-white/20 lg:flex-none"
          >
            <Plus data-icon="inline-start" />
            Add funds
          </Button>
        </div>
      </div>

      {/* Available vs held */}
      <div className="relative mt-7 flex flex-col gap-3">
        <div
          className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-white/10"
          role="img"
          aria-label={`${availableShare.toFixed(1)}% of funds available`}
        >
          {!isLoading && (
            <>
              <div
                className="h-full rounded-full bg-teal-400 transition-[width] duration-700 ease-out"
                style={{ width: `${availableShare}%` }}
              />
              {totals.held > 0 && (
                <div className="h-full flex-1 rounded-full bg-amber-300" />
              )}
            </>
          )}
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:flex sm:gap-8">
          <div className="flex items-start gap-2">
            <Wallet className="mt-0.5 size-4 text-teal-400" aria-hidden="true" />
            <div>
              <dt className="text-slate-400">Available</dt>
              <dd className="font-semibold tabular-nums">
                {isLoading ? <Skeleton className="mt-1 h-4 w-20 bg-white/10" /> : formatCurrency(totals.available)}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Lock className="mt-0.5 size-4 text-amber-300" aria-hidden="true" />
            <div>
              <dt className="text-slate-400">On hold (pending)</dt>
              <dd className="font-semibold tabular-nums">
                {isLoading ? <Skeleton className="mt-1 h-4 w-16 bg-white/10" /> : formatCurrency(totals.held)}
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </section>
  )
}
