import type { Account } from "@/types"

export const MOCK_USER_ID = "u1b2c3d4-0001-4000-8000-000000000001"

const MOCK_ACCOUNTS: Account[] = [
  {
    id: "a1b2c3d4-0001-4000-8000-000000000001",
    userId: MOCK_USER_ID,
    name: "Main Checking",
    balance: 4231.56,
    currency: "USD",
  },
  {
    id: "a1b2c3d4-0001-4000-8000-000000000002",
    userId: MOCK_USER_ID,
    name: "Savings",
    balance: 12890.0,
    currency: "USD",
  },
]

export function getAccountsByUser(userId: string): Promise<Account[]> {
  return Promise.resolve(
    MOCK_ACCOUNTS.filter((account) => account.userId === userId)
  )
}
