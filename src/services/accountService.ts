import type { Account } from "@/types"
import { withLatency } from "@/services/mockApi"

export const MOCK_USER_ID = "u1b2c3d4-0001-4000-8000-000000000001"
export const MOCK_CHECKING_ACCOUNT_ID = "a1b2c3d4-0001-4000-8000-000000000001"
export const MOCK_SAVINGS_ACCOUNT_ID = "a1b2c3d4-0001-4000-8000-000000000002"

const MOCK_ACCOUNTS: Account[] = [
  {
    id: MOCK_CHECKING_ACCOUNT_ID,
    userId: MOCK_USER_ID,
    name: "Main Checking",
    type: "CHECKING",
    balance: 4231.56,
    currency: "USD",
    lastFour: "4821",
  },
  {
    id: MOCK_SAVINGS_ACCOUNT_ID,
    userId: MOCK_USER_ID,
    name: "High-Yield Savings",
    type: "SAVINGS",
    balance: 12890.0,
    currency: "USD",
    lastFour: "9034",
  },
]

export function getAccountsByUser(userId: string): Promise<Account[]> {
  return withLatency(
    MOCK_ACCOUNTS.filter((account) => account.userId === userId).map(
      (account) => ({ ...account })
    )
  )
}
