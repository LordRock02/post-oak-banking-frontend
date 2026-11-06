import { Landmark, PiggyBank } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardData } from "@/hooks/useBanking"
import { formatCurrency } from "@/lib/format"
import type { AccountSnapshot } from "@/types"

function AccountCard({ account }: { account: AccountSnapshot }) {
  const Icon = account.type === "SAVINGS" ? PiggyBank : Landmark

  return (
    <article className="group flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-900/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-900/5">
      <header className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-teal-50 group-hover:text-teal-700">
          <Icon className="size-4.5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-slate-900">{account.name}</h3>
          <p className="text-xs text-slate-500 tabular-nums">•••• {account.lastFour}</p>
        </div>
      </header>

      <p className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
        {formatCurrency(account.balance, account.currency)}
      </p>

      <dl className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
        <div>
          <dt className="text-slate-500">Available</dt>
          <dd className="mt-0.5 font-medium text-slate-900 tabular-nums">
            {formatCurrency(account.available, account.currency)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Held</dt>
          <dd className="mt-0.5 font-medium text-slate-900 tabular-nums">
            {formatCurrency(account.held, account.currency)}
          </dd>
        </div>
      </dl>
    </article>
  )
}

function AccountCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-900/5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-xl" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
      <Skeleton className="h-7 w-36" />
      <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}

export function AccountCards() {
  const { isLoading, snapshots } = useDashboardData()

  return (
    <section aria-label="Accounts" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {isLoading
        ? Array.from({ length: 2 }, (_, i) => <AccountCardSkeleton key={i} />)
        : snapshots.map((account) => <AccountCard key={account.id} account={account} />)}
    </section>
  )
}
