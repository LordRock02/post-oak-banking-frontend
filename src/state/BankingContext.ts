import { createContext } from "react"

import type { BankingState } from "@/state/bankingReducer"
import type { AddFundsInput, SendMoneyInput, Transaction } from "@/types"

export interface BankingActions {
  reload: () => void
  sendMoney: (input: SendMoneyInput) => Promise<Transaction>
  addFunds: (input: AddFundsInput) => Promise<Transaction>
}

/**
 * State and actions live in separate contexts so components that only
 * trigger actions (buttons, dialogs) don't re-render on every state change.
 */
export const BankingStateContext = createContext<BankingState | null>(null)
export const BankingActionsContext = createContext<BankingActions | null>(null)
