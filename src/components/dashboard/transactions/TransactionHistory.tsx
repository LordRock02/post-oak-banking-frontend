import { useCallback, useDeferredValue, useMemo, useState } from "react"
import { Receipt, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardData } from "@/hooks/useBanking"
import { filterTransactions } from "@/lib/finance"
import type { Transaction, TransactionFilter } from "@/types"
import { SearchInput } from "@/components/dashboard/transactions/SearchInput"
import { TransactionDetailSheet } from "@/components/dashboard/transactions/TransactionDetailSheet"
import { TransactionRow } from "@/components/dashboard/transactions/TransactionRow"

const FILTERS = [
  { value: "ALL", label: "All" },
  { value: "INCOME", label: "Income" },
  { value: "EXPENSES", label: "Expenses" },
] as const satisfies readonly { value: TransactionFilter; label: string }[]

const PAGE_SIZE = 10

function RowSkeleton() {
  return (
    <li className="flex items-center gap-3 px-3 py-3">
      <Skeleton className="size-10 rounded-xl" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="hidden h-5 w-16 rounded-full sm:block" />
      <Skeleton className="h-4 w-16" />
    </li>
  )
}

export function TransactionHistory() {
  const { isLoading, transactions, accountsById, recentIds } = useDashboardData()

  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<TransactionFilter>("ALL")
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [selected, setSelected] = useState<Transaction | null>(null)

  // The input updates synchronously; the (potentially large) list filter is
  // deferred so typing never blocks on rendering results.
  const deferredQuery = useDeferredValue(query)
  const isStale = deferredQuery !== query

  const filtered = useMemo(
    () => filterTransactions(transactions, filter, deferredQuery),
    [transactions, filter, deferredQuery]
  )
  const recentSet = useMemo(() => new Set(recentIds), [recentIds])

  const updateQuery = (value: string) => {
    setQuery(value)
    setVisible(PAGE_SIZE)
  }
  const updateFilter = (value: TransactionFilter) => {
    setFilter(value)
    setVisible(PAGE_SIZE)
  }
  const resetFilters = () => {
    updateQuery("")
    setFilter("ALL")
  }

  const hasActivity = transactions.length > 0

  const onSelect = useCallback((t: Transaction) => setSelected(t), [])

  // Keep the drawer in sync if the open transaction settles while viewed.
  const liveSelected = selected
    ? (transactions.find((t) => t.id === selected.id) ?? selected)
    : null

  return (
    <section
      id="transactions"
      aria-labelledby="transactions-title"
      className="flex scroll-mt-20 flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/5 dark:ring-white/10 sm:p-6"
    >
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 id="transactions-title" className="text-base font-semibold text-foreground">
            Transactions
          </h2>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {isLoading
              ? "Loading activity…"
              : `${filtered.length} ${filtered.length === 1 ? "result" : "results"}`}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput value={query} onChange={updateQuery} disabled={isLoading || !hasActivity} />
          <SegmentedControl
            label="Filter transactions"
            options={FILTERS}
            value={filter}
            onChange={updateFilter}
            className="self-start sm:self-auto"
          />
        </div>
      </header>

      {/* Column headings (desktop only) */}
      <div
        aria-hidden="true"
        className="hidden grid-cols-[auto_1fr_6rem_6.5rem_7rem] gap-3 border-b border-border/70 px-3 pb-2 text-xs font-medium text-faint sm:grid"
      >
        <span className="w-10" />
        <span>Description</span>
        <span>Date</span>
        <span>Status</span>
        <span className="text-right">Amount</span>
      </div>

      {isLoading ? (
        <ul className="-mx-3 flex flex-col" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => <RowSkeleton key={i} />)}
        </ul>
      ) : !hasActivity ? (
        <EmptyState
          icon={Receipt}
          title="No recent transactions found"
          description="Start spending to see your activity!"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No transactions found"
          description="Try a different search term or filter."
          action={
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <ul
            className={`-mx-3 flex flex-col transition-opacity duration-150 ${isStale ? "opacity-60" : ""}`}
          >
            {filtered.slice(0, visible).map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                isNew={recentSet.has(t.id)}
                onSelect={onSelect}
              />
            ))}
          </ul>
          {visible < filtered.length && (
            <Button
              variant="ghost"
              className="self-center text-muted-foreground"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
            >
              Show more ({filtered.length - visible} remaining)
            </Button>
          )}
        </>
      )}

      <TransactionDetailSheet
        transaction={liveSelected}
        account={liveSelected ? accountsById.get(liveSelected.accountId) : undefined}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </section>
  )
}
