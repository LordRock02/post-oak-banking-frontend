import type { Account, Transaction } from "@/types"

export type LoadStatus = "loading" | "ready" | "error"

export interface BankingState {
  status: LoadStatus
  error: string | null
  accounts: Account[]
  transactions: Transaction[]
  /** Ids created in this session, used to highlight fresh rows. */
  recentIds: string[]
}

export type BankingAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; accounts: Account[]; transactions: Transaction[] }
  | { type: "LOAD_FAILURE"; error: string }
  | { type: "TRANSACTION_CREATED"; transaction: Transaction }
  | { type: "TRANSACTION_SETTLED"; id: string }

export const initialBankingState: BankingState = {
  status: "loading",
  error: null,
  accounts: [],
  transactions: [],
  recentIds: [],
}

export function bankingReducer(
  state: BankingState,
  action: BankingAction
): BankingState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, status: "loading", error: null }

    case "LOAD_SUCCESS":
      return {
        ...state,
        status: "ready",
        accounts: action.accounts,
        transactions: action.transactions,
      }

    case "LOAD_FAILURE":
      return { ...state, status: "error", error: action.error }

    case "TRANSACTION_CREATED":
      return {
        ...state,
        transactions: [action.transaction, ...state.transactions],
        recentIds: [action.transaction.id, ...state.recentIds],
      }

    case "TRANSACTION_SETTLED": {
      const target = state.transactions.find((t) => t.id === action.id)
      if (!target || target.status === "POSTED") return state

      // Posting moves the amount into the ledger balance; any hold it
      // created is released automatically because holds are derived.
      const delta = target.type === "CREDIT" ? target.amount : -target.amount
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.id ? { ...t, status: "POSTED" } : t
        ),
        accounts: state.accounts.map((a) =>
          a.id === target.accountId
            ? { ...a, balance: Math.round((a.balance + delta) * 100) / 100 }
            : a
        ),
      }
    }
  }
}
