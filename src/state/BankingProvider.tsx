import { useCallback, useEffect, useMemo, useReducer, useRef } from "react"
import type { ReactNode } from "react"

import { useAuthState } from "@/hooks/useAuth"
import { getAccountsByUser, getPrimaryAccount } from "@/services/accountService"
import * as transactionService from "@/services/transactionService"
import { formatCurrency } from "@/lib/format"
import { notify } from "@/lib/toast"
import {
  bankingReducer,
  initialBankingState,
} from "@/state/bankingReducer"
import { BankingActionsContext, BankingStateContext } from "@/state/BankingContext"
import type { BankingActions } from "@/state/BankingContext"
import type { AddFundsInput, SendMoneyInput, Transaction } from "@/types"

/** How long a simulated transaction stays PENDING before it posts. */
const SETTLEMENT_DELAY_MS = 8000

export function BankingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bankingReducer, initialBankingState)
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())
  const loadToken = useRef(0)
  const userId = useAuthState().user?.id

  const load = useCallback(async () => {
    const token = ++loadToken.current
    dispatch({ type: "LOAD_START" })
    try {
      if (!userId) throw new Error("No signed-in user.")
      const accounts = await getAccountsByUser(userId)
      // Transactions follow from the accounts: only the primary account's history is shown.
      const primary = getPrimaryAccount(accounts)
      const transactions = primary
        ? await transactionService.getTransactionsByAccount(primary.id)
        : []
      // Ignore stale responses (e.g. StrictMode double-mount or a fast reload).
      if (token !== loadToken.current) return
      dispatch({ type: "LOAD_SUCCESS", accounts, transactions })
    } catch (err) {
      if (token !== loadToken.current) return
      dispatch({
        type: "LOAD_FAILURE",
        error: err instanceof Error ? err.message : "Unable to load accounts",
      })
    }
  }, [userId])

  useEffect(() => {
    void load()
    const pending = timers.current
    const token = loadToken
    return () => {
      token.current++ // invalidate any in-flight load
      pending.forEach(clearTimeout)
      pending.clear()
    }
  }, [load])

  const scheduleSettlement = useCallback((transaction: Transaction) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer)
      dispatch({ type: "TRANSACTION_SETTLED", id: transaction.id })
      notify(
        "Transaction posted",
        `${transaction.merchantName} · ${formatCurrency(transaction.amount)}`,
        "info"
      )
    }, SETTLEMENT_DELAY_MS)
    timers.current.add(timer)
  }, [])

  const commit = useCallback(
    (transaction: Transaction) => {
      dispatch({ type: "TRANSACTION_CREATED", transaction })
      scheduleSettlement(transaction)
      return transaction
    },
    [scheduleSettlement]
  )

  const actions = useMemo<BankingActions>(
    () => ({
      reload: () => void load(),
      sendMoney: (input: SendMoneyInput) =>
        transactionService.sendMoney(input).then(commit),
      addFunds: (input: AddFundsInput) =>
        transactionService.addFunds(input).then(commit),
    }),
    [load, commit]
  )

  return (
    <BankingActionsContext.Provider value={actions}>
      <BankingStateContext.Provider value={state}>
        {children}
      </BankingStateContext.Provider>
    </BankingActionsContext.Provider>
  )
}
