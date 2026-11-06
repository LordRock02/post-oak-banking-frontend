import {
  MOCK_CHECKING_ACCOUNT_ID,
  MOCK_SAVINGS_ACCOUNT_ID,
} from "@/services/accountService"
import { createRandom, createReference, withLatency } from "@/services/mockApi"
import { toISODate } from "@/lib/format"
import type { AddFundsInput, Payee, SendMoneyInput, Transaction } from "@/types"

const HISTORY_DAYS = 120

interface MerchantTemplate {
  merchantName: string
  category: string
  min: number
  max: number
}

const DAILY_MERCHANTS: MerchantTemplate[] = [
  { merchantName: "Starbucks", category: "Food & Drink", min: 4.5, max: 9 },
  { merchantName: "Whole Foods", category: "Groceries", min: 28, max: 140 },
  { merchantName: "Trader Joe's", category: "Groceries", min: 22, max: 95 },
  { merchantName: "Amazon", category: "Shopping", min: 12, max: 160 },
  { merchantName: "Uber", category: "Transportation", min: 9, max: 38 },
  { merchantName: "Shell", category: "Transportation", min: 35, max: 62 },
  { merchantName: "Chipotle", category: "Food & Drink", min: 11, max: 24 },
  { merchantName: "Target", category: "Shopping", min: 18, max: 120 },
  { merchantName: "CVS Pharmacy", category: "Health", min: 8, max: 45 },
]

const MONTHLY_BILLS: (MerchantTemplate & { day: number })[] = [
  { merchantName: "Oakview Apartments", category: "Housing", min: 1450, max: 1450, day: 1 },
  { merchantName: "Netflix", category: "Entertainment", min: 15.99, max: 15.99, day: 3 },
  { merchantName: "Spotify", category: "Entertainment", min: 11.99, max: 11.99, day: 7 },
  { merchantName: "CenterPoint Energy", category: "Utilities", min: 78, max: 132, day: 12 },
  { merchantName: "Comcast Xfinity", category: "Utilities", min: 79.99, max: 79.99, day: 18 },
  { merchantName: "Planet Fitness", category: "Health", min: 24.99, max: 24.99, day: 21 },
]

type Draft = Omit<Transaction, "id" | "reference" | "status">

/**
 * Builds a realistic, deterministic history ending today. Generated ids are
 * monotonically increasing so newest-first ordering is stable within a day.
 * Debits from the last two days are left PENDING to populate held funds.
 */
function generateTransactions(today: Date): Transaction[] {
  const random = createRandom(20261106)
  const between = (min: number, max: number) =>
    Math.round((min + random() * (max - min)) * 100) / 100

  const result: Transaction[] = []
  const push = (draft: Draft, recent = false) => {
    const pending = recent && draft.type === "DEBIT" && random() < 0.6
    result.push({
      ...draft,
      id: `t0-${String(result.length).padStart(5, "0")}`,
      reference: createReference(random),
      status: pending ? "PENDING" : "POSTED",
    })
  }

  for (let offset = HISTORY_DAYS; offset >= 0; offset--) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
    const date = toISODate(day)
    const dom = day.getDate()
    const recent = offset <= 1
    const checking = MOCK_CHECKING_ACCOUNT_ID

    if (dom === 1 || dom === 15) {
      push({ accountId: checking, amount: 2850, type: "CREDIT", category: "Income", merchantName: "Employer Payroll", date, description: "Direct deposit · Acme Corp" })
    }
    if (dom === 2) {
      push({ accountId: checking, amount: 500, type: "DEBIT", category: "Transfer", merchantName: "Transfer to Savings", date, description: "Automatic monthly savings" })
      push({ accountId: MOCK_SAVINGS_ACCOUNT_ID, amount: 500, type: "CREDIT", category: "Transfer", merchantName: "Transfer from Checking", date, description: "Automatic monthly savings" })
    }
    if (dom === 28) {
      push({ accountId: MOCK_SAVINGS_ACCOUNT_ID, amount: between(38, 46), type: "CREDIT", category: "Interest", merchantName: "Interest Payment", date, description: "4.10% APY" })
    }
    if (dom === 20 && random() < 0.7) {
      push({ accountId: checking, amount: between(120, 640), type: "CREDIT", category: "Income", merchantName: "Freelance · Upwork", date })
    }

    for (const bill of MONTHLY_BILLS) {
      if (bill.day === dom) {
        push({ accountId: checking, amount: between(bill.min, bill.max), type: "DEBIT", category: bill.category, merchantName: bill.merchantName, date }, recent)
      }
    }

    const purchases = Math.floor(random() * 3)
    for (let i = 0; i < purchases; i++) {
      const m = DAILY_MERCHANTS[Math.floor(random() * DAILY_MERCHANTS.length)]
      push({ accountId: checking, amount: between(m.min, m.max), type: "DEBIT", category: m.category, merchantName: m.merchantName, date }, recent)
    }
  }

  return result
}

let cache: Transaction[] | null = null

export function getTransactionsByAccounts(
  accountIds: string[]
): Promise<Transaction[]> {
  cache ??= generateTransactions(new Date())
  const ids = new Set(accountIds)
  return withLatency(
    cache.filter((t) => ids.has(t.accountId)).map((t) => ({ ...t })),
    900
  )
}

export const SAVED_PAYEES: Payee[] = [
  { id: "p1", name: "Maria Gonzalez", detail: "Chase •••• 2210" },
  { id: "p2", name: "Alex Chen", detail: "Wells Fargo •••• 7781" },
  { id: "p3", name: "Houston Property Mgmt", detail: "Bank of America •••• 0419" },
  { id: "p4", name: "Sam Patel", detail: "Zelle · sam.patel@email.com" },
]

export const FUNDING_SOURCES = [
  "External bank •••• 6650",
  "Debit card •••• 3317",
  "Mobile check deposit",
] as const

let sequence = 0
const nextId = () => `t1-${Date.now()}-${sequence++}`

export function sendMoney(input: SendMoneyInput): Promise<Transaction> {
  return withLatency<Transaction>(
    {
      id: nextId(),
      accountId: input.fromAccountId,
      amount: input.amount,
      type: "DEBIT",
      category: "Transfer Out",
      merchantName: input.payeeName,
      status: "PENDING",
      date: toISODate(new Date()),
      reference: createReference(),
      description: input.note || undefined,
    },
    1100
  )
}

export function addFunds(input: AddFundsInput): Promise<Transaction> {
  return withLatency<Transaction>(
    {
      id: nextId(),
      accountId: input.toAccountId,
      amount: input.amount,
      type: "CREDIT",
      category: "Deposit",
      merchantName: "Funds Added",
      status: "PENDING",
      date: toISODate(new Date()),
      reference: createReference(),
      description: `From ${input.source}`,
    },
    1100
  )
}
