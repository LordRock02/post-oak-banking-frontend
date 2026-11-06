export type AccountType = "CHECKING" | "SAVINGS"

export interface Account {
  id: string
  userId: string
  name: string
  type: AccountType
  /** Ledger balance: the sum of all POSTED activity. */
  balance: number
  currency: string
  /** Last four digits shown as a masked account number. */
  lastFour: string
}

export type TransactionType = "CREDIT" | "DEBIT"
export type TransactionStatus = "POSTED" | "PENDING"

export interface Transaction {
  id: string
  accountId: string
  amount: number
  type: TransactionType
  category: string
  merchantName: string
  status: TransactionStatus
  /** ISO date (YYYY-MM-DD). */
  date: string
  /** Human-readable bank reference, e.g. "PO-7F3K2Q". */
  reference: string
  description?: string
}

/** Derived, display-ready view of an account. */
export interface AccountSnapshot extends Account {
  /** Funds reserved by pending debits. */
  held: number
  /** Ledger balance minus held funds. */
  available: number
}

export type TransactionFilter = "ALL" | "INCOME" | "EXPENSES"

export type Timeframe = "7D" | "30D" | "90D"

export interface CashFlowPoint {
  /** Start date of the bucket (YYYY-MM-DD). */
  date: string
  /** Bucket label rendered on the axis/tooltip. */
  label: string
  income: number
  expenses: number
}

export interface Payee {
  id: string
  name: string
  detail: string
}

export interface SendMoneyInput {
  fromAccountId: string
  payeeName: string
  amount: number
  note?: string
}

export interface AddFundsInput {
  toAccountId: string
  source: string
  amount: number
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
  companyName: string
}

export interface LoginPayload {
  email: string
  password: string
}

/** Response from both /auth/login and /auth/refresh. */
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  fullName: string
}
