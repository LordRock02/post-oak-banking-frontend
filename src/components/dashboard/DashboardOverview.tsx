import { useEffect, useState } from "react"

import { getAccountsByUser, MOCK_USER_ID } from "@/services/accountService"
import type { Account } from "@/types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TransactionTable } from "@/components/dashboard/TransactionTable"

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function DashboardOverview() {
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    getAccountsByUser(MOCK_USER_ID).then(setAccounts)
  }, [])

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  )
  const totalCurrency = accounts[0]?.currency ?? "USD"

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-500">
            Total Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold tracking-tight text-slate-900">
            {formatCurrency(totalBalance, totalCurrency)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Across {accounts.length}{" "}
            {accounts.length === 1 ? "account" : "accounts"}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-500">
                {account.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-900">
                {formatCurrency(account.balance, account.currency)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <TransactionTable />
    </div>
  )
}
