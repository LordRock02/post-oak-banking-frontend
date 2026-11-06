import { api } from "@/services/apiClient"
import { createReference, withLatency } from "@/services/mockApi"
import { mapList, toTransaction } from "@/lib/apiMappers"
import type { RawTransaction } from "@/lib/apiMappers"
import { toISODate } from "@/lib/format"
import type { AddFundsInput, Payee, SendMoneyInput, Transaction } from "@/types"

export async function getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
  const { data } = await api.get<unknown>(
    `/api/v1/transactions/account/${encodeURIComponent(accountId)}`
  )
  return mapList<RawTransaction, Transaction>(data, (raw) => toTransaction(raw, accountId))
}

/* ---------- Send money / add funds: still simulated client-side ---------- */

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
