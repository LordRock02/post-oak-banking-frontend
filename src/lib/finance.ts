import type {
  Account,
  AccountSnapshot,
  CashFlowPoint,
  Timeframe,
  Transaction,
  TransactionFilter,
} from "@/types"
import { formatShortDate, parseISODate, toISODate } from "@/lib/format"

const DAY_MS = 86_400_000

/** Inter-account transfers are excluded from income/expense reporting. */
export function isInternalTransfer(transaction: Transaction) {
  return transaction.category === "Transfer"
}

/** Failed transactions and internal transfers never count as income or expenses. */
function countsAsCashFlow(transaction: Transaction) {
  return transaction.status !== "FAILED" && !isInternalTransfer(transaction)
}

export function buildAccountSnapshots(
  accounts: Account[],
  transactions: Transaction[]
): AccountSnapshot[] {
  return accounts.map((account) => {
    const held = transactions
      .filter(
        (t) =>
          t.accountId === account.id &&
          t.status === "PENDING" &&
          t.type === "DEBIT"
      )
      .reduce((sum, t) => sum + t.amount, 0)

    return { ...account, held, available: account.balance - held }
  })
}

export interface BalanceTotals {
  balance: number
  available: number
  held: number
}

export function sumSnapshots(snapshots: AccountSnapshot[]): BalanceTotals {
  return snapshots.reduce(
    (acc, s) => ({
      balance: acc.balance + s.balance,
      available: acc.available + s.available,
      held: acc.held + s.held,
    }),
    { balance: 0, available: 0, held: 0 }
  )
}

/**
 * Change in total ledger balance over the last `days`, reconstructed by
 * unwinding posted activity that happened inside the window.
 */
export function balanceChange(
  currentBalance: number,
  transactions: Transaction[],
  today: Date,
  days = 30
) {
  const since = toISODate(new Date(today.getTime() - days * DAY_MS))
  const delta = transactions
    .filter((t) => t.status === "POSTED" && t.date > since)
    .reduce((sum, t) => sum + (t.type === "CREDIT" ? t.amount : -t.amount), 0)

  const previous = currentBalance - delta
  return {
    amount: delta,
    percent: previous === 0 ? 0 : (delta / Math.abs(previous)) * 100,
  }
}

export interface PeriodTotals {
  income: number
  expenses: number
  net: number
  savingsRate: number
}

function totalsBetween(
  transactions: Transaction[],
  start: string,
  end: string
): PeriodTotals {
  let income = 0
  let expenses = 0
  for (const t of transactions) {
    if (t.date < start || t.date > end || !countsAsCashFlow(t)) continue
    if (t.type === "CREDIT") income += t.amount
    else expenses += t.amount
  }
  const net = income - expenses
  return { income, expenses, net, savingsRate: income ? (net / income) * 100 : 0 }
}

export interface MonthlySummary {
  monthLabel: string
  current: PeriodTotals
  previous: PeriodTotals
}

/**
 * Month-to-date totals compared against the same number of days in the
 * previous month, so a partial month is never compared to a full one.
 */
export function monthlySummary(
  transactions: Transaction[],
  today: Date
): MonthlySummary {
  const day = today.getDate()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const prevStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const prevLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate()
  const prevEnd = new Date(
    prevStart.getFullYear(),
    prevStart.getMonth(),
    Math.min(day, prevLastDay)
  )

  return {
    monthLabel: today.toLocaleDateString("en-US", { month: "long" }),
    current: totalsBetween(transactions, toISODate(monthStart), toISODate(today)),
    previous: totalsBetween(transactions, toISODate(prevStart), toISODate(prevEnd)),
  }
}

export function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100
  return ((current - previous) / Math.abs(previous)) * 100
}

const TIMEFRAME_CONFIG: Record<Timeframe, { days: number; bucketDays: number }> = {
  "7D": { days: 7, bucketDays: 1 },
  "30D": { days: 30, bucketDays: 1 },
  "90D": { days: 91, bucketDays: 7 },
}

/**
 * Buckets income and expenses into a continuous series (empty buckets are
 * zero-filled so the curve never skips a day/week).
 */
export function aggregateCashFlow(
  transactions: Transaction[],
  timeframe: Timeframe,
  today: Date
): CashFlowPoint[] {
  const { days, bucketDays } = TIMEFRAME_CONFIG[timeframe]
  const end = parseISODate(toISODate(today))
  const start = new Date(end.getTime() - (days - 1) * DAY_MS)
  const bucketCount = Math.ceil(days / bucketDays)

  const points: CashFlowPoint[] = Array.from({ length: bucketCount }, (_, i) => {
    const date = toISODate(new Date(start.getTime() + i * bucketDays * DAY_MS))
    return {
      date,
      label: bucketDays === 1 ? formatShortDate(date) : `Week of ${formatShortDate(date)}`,
      income: 0,
      expenses: 0,
    }
  })

  for (const t of transactions) {
    if (!countsAsCashFlow(t)) continue
    const offset = Math.round((parseISODate(t.date).getTime() - start.getTime()) / DAY_MS)
    if (!Number.isFinite(offset) || offset < 0 || offset >= days) continue
    const point = points[Math.floor(offset / bucketDays)]
    if (t.type === "CREDIT") point.income += t.amount
    else point.expenses += t.amount
  }

  return points.map((p) => ({
    ...p,
    income: Math.round(p.income * 100) / 100,
    expenses: Math.round(p.expenses * 100) / 100,
  }))
}

export function filterTransactions(
  transactions: Transaction[],
  filter: TransactionFilter,
  query: string
) {
  const q = query.trim().toLowerCase()
  return transactions.filter((t) => {
    if (filter === "INCOME" && t.type !== "CREDIT") return false
    if (filter === "EXPENSES" && t.type !== "DEBIT") return false
    if (!q) return true
    return (
      t.merchantName.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.reference.toLowerCase().includes(q) ||
      t.amount.toFixed(2).includes(q)
    )
  })
}

export function sortByNewest(transactions: Transaction[]) {
  return [...transactions].sort(
    (a, b) =>
      (b.createdAt ?? b.date).localeCompare(a.createdAt ?? a.date) || b.id.localeCompare(a.id)
  )
}
