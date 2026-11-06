import { MOCK_CHECKING_ACCOUNT_ID } from "@/services/accountService"
import type { Transaction } from "@/types"

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "t1b2c3d4-0001-4000-8000-000000000001",
    accountId: MOCK_CHECKING_ACCOUNT_ID,
    amount: 2850.0,
    type: "CREDIT",
    category: "Income",
    merchantName: "Employer Payroll",
    status: "POSTED",
    date: "2026-11-01",
  },
  {
    id: "t1b2c3d4-0001-4000-8000-000000000002",
    accountId: MOCK_CHECKING_ACCOUNT_ID,
    amount: 54.23,
    type: "DEBIT",
    category: "Shopping",
    merchantName: "Amazon",
    status: "POSTED",
    date: "2026-11-02",
  },
  {
    id: "t1b2c3d4-0001-4000-8000-000000000003",
    accountId: MOCK_CHECKING_ACCOUNT_ID,
    amount: 18.47,
    type: "DEBIT",
    category: "Food",
    merchantName: "KFC",
    status: "POSTED",
    date: "2026-11-02",
  },
  {
    id: "t1b2c3d4-0001-4000-8000-000000000004",
    accountId: MOCK_CHECKING_ACCOUNT_ID,
    amount: 15.99,
    type: "DEBIT",
    category: "Entertainment",
    merchantName: "Netflix",
    status: "POSTED",
    date: "2026-11-03",
  },
  {
    id: "t1b2c3d4-0001-4000-8000-000000000005",
    accountId: MOCK_CHECKING_ACCOUNT_ID,
    amount: 6.75,
    type: "DEBIT",
    category: "Food",
    merchantName: "Starbucks",
    status: "PENDING",
    date: "2026-11-04",
  },
  {
    id: "t1b2c3d4-0001-4000-8000-000000000006",
    accountId: MOCK_CHECKING_ACCOUNT_ID,
    amount: 42.1,
    type: "DEBIT",
    category: "Transportation",
    merchantName: "Shell",
    status: "POSTED",
    date: "2026-11-04",
  },
  {
    id: "t1b2c3d4-0001-4000-8000-000000000007",
    accountId: MOCK_CHECKING_ACCOUNT_ID,
    amount: 120.0,
    type: "CREDIT",
    category: "Transfer",
    merchantName: "Savings Transfer",
    status: "POSTED",
    date: "2026-11-05",
  },
]

export function getTransactionsByAccount(
  accountId: string
): Promise<Transaction[]> {
  return Promise.resolve(
    MOCK_TRANSACTIONS.filter(
      (transaction) => transaction.accountId === accountId
    )
  )
}
