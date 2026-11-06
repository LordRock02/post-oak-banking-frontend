import { useContext, useMemo, useState } from "react"

import {
  BankingActionsContext,
  BankingStateContext,
} from "@/state/BankingContext"
import {
  buildAccountSnapshots,
  sortByNewest,
  sumSnapshots,
} from "@/lib/finance"

export function useBankingState() {
  const state = useContext(BankingStateContext)
  if (!state) throw new Error("useBankingState must be used within <BankingProvider>")
  return state
}

export function useBankingActions() {
  const actions = useContext(BankingActionsContext)
  if (!actions) throw new Error("useBankingActions must be used within <BankingProvider>")
  return actions
}

/**
 * Display-ready selectors shared across dashboard widgets. Everything here is
 * memoized against the reducer state, so derived values are computed once
 * per change rather than once per consumer render.
 */
export function useDashboardData() {
  const state = useBankingState()
  const { accounts, transactions, status, error, recentIds } = state

  const snapshots = useMemo(
    () => buildAccountSnapshots(accounts, transactions),
    [accounts, transactions]
  )
  const totals = useMemo(() => sumSnapshots(snapshots), [snapshots])
  const sortedTransactions = useMemo(() => sortByNewest(transactions), [transactions])
  const accountsById = useMemo(
    () => new Map(snapshots.map((s) => [s.id, s])),
    [snapshots]
  )
  // Captured once per consumer so a widget's date math is stable across renders.
  const [today] = useState(() => new Date())

  return {
    status,
    error,
    isLoading: status === "loading",
    snapshots,
    totals,
    transactions: sortedTransactions,
    accountsById,
    recentIds,
    today,
  }
}
