import { Landmark, PiggyBank, WalletCards } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { useDashboardData } from "@/hooks/useBanking"
import { formatCurrency } from "@/lib/format"
import type { AccountSnapshot } from "@/types"

function AccountCard({ account }: { account: AccountSnapshot }) {
  const Icon = account.type === "SAVINGS" ? PiggyBank : Landmark

  return (
    <article className="group flex flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/5 dark:ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-900/5">
      <header className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-foreground/80 transition-colors group-hover:bg-teal-50 dark:group-hover:bg-teal-400/10 group-hover:text-teal-700 dark:group-hover:text-teal-300">
          <Icon className="size-4.5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-foreground">{account.name}</h3>
          <p className="text-xs text-muted-foreground tabular-nums">•••• {account.lastFour}</p>
        </div>
      </header>

      <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {formatCurrency(account.balance, account.currency)}
      </p>

      <dl className="grid grid-cols-2 gap-3 border-t border-border/70 pt-3 text-xs">
        <div>
          <dt className="text-muted-foreground">Available</dt>
          <dd className="mt-0.5 font-medium text-foreground tabular-nums">
            {formatCurrency(account.available, account.currency)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Held</dt>
          <dd className="mt-0.5 font-medium text-foreground tabular-nums">
            {formatCurrency(account.held, account.currency)}
          </dd>
        </div>
      </dl>
    </article>
  )
}

function AccountCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/5 dark:ring-white/10">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-xl" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
      <Skeleton className="h-7 w-36" />
      <div className="grid grid-cols-2 gap-3 border-t border-border/70 pt-3">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}

export function AccountCards() {
  const { isLoading, snapshots, status } = useDashboardData()

  if (status === "ready" && snapshots.length === 0) {
    return (
      <section aria-label="Accounts" className="rounded-2xl bg-card ring-1 ring-foreground/5 dark:ring-white/10">
        <EmptyState
          icon={WalletCards}
          title="No accounts yet"
          description="Once an account is opened for you, its balance will show up here."
        />
      </section>
    )
  }

  return (
    <section aria-label="Accounts" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {isLoading
        ? Array.from({ length: 2 }, (_, i) => <AccountCardSkeleton key={i} />)
        : snapshots.map((account) => <AccountCard key={account.id} account={account} />)}
    </section>
  )
}
