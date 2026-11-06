import { memo } from "react"
import { cn } from "cn"

import { formatShortDate, formatSignedCurrency } from "@/lib/format"
import type { Transaction } from "@/types"
import { CategoryIcon } from "@/components/dashboard/transactions/CategoryIcon"
import { StatusBadge } from "@/components/dashboard/transactions/StatusBadge"

interface TransactionRowProps {
  transaction: Transaction
  isNew: boolean
  onSelect: (transaction: Transaction) => void
}

export const TransactionRow = memo(function TransactionRow({
  transaction,
  isNew,
  onSelect,
}: TransactionRowProps) {
  const credit = transaction.type === "CREDIT"

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(transaction)}
        className={cn(
          "group grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[auto_1fr_6rem_6.5rem_7rem]",
          isNew && "animate-in fade-in slide-in-from-top-1 bg-teal-50/60 dark:bg-teal-400/10 duration-500"
        )}
      >
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
            credit ? "bg-teal-50 dark:bg-teal-400/10 text-teal-700 dark:text-teal-300" : "bg-muted text-muted-foreground"
          )}
        >
          <CategoryIcon category={transaction.category} className="size-4" strokeWidth={1.75} />
        </span>

        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {transaction.merchantName}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {transaction.category}
            <span className="sm:hidden"> · {formatShortDate(transaction.date)}</span>
          </span>
        </span>

        <span className="hidden text-sm text-muted-foreground tabular-nums sm:block">
          {formatShortDate(transaction.date)}
        </span>

        <span className="hidden sm:block">
          <StatusBadge status={transaction.status} />
        </span>

        <span className="flex flex-col items-end gap-1">
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              credit ? "text-teal-700 dark:text-teal-300" : "text-foreground"
            )}
          >
            {formatSignedCurrency(transaction.amount, transaction.type)}
          </span>
          {transaction.status === "PENDING" && (
            <span className="sm:hidden">
              <StatusBadge status="PENDING" />
            </span>
          )}
        </span>
      </button>
    </li>
  )
})
