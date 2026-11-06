import { api } from "@/services/apiClient"
import { mapList, toAccount } from "@/lib/apiMappers"
import type { RawAccount } from "@/lib/apiMappers"
import type { Account } from "@/types"

/** Checking accounts first, so the primary account is always index 0. */
function byPrimaryFirst(a: Account, b: Account) {
  return Number(a.type === "SAVINGS") - Number(b.type === "SAVINGS")
}

export async function getAccountsByUser(userId: string): Promise<Account[]> {
  const { data } = await api.get<unknown>(`/api/v1/accounts/user/${encodeURIComponent(userId)}`)
  return mapList<RawAccount, Account>(data, toAccount).sort(byPrimaryFirst)
}

/** The account whose activity drives the dashboard: the first checking account, else the first. */
export function getPrimaryAccount(accounts: Account[]): Account | undefined {
  return accounts.find((a) => a.type === "CHECKING") ?? accounts[0]
}
