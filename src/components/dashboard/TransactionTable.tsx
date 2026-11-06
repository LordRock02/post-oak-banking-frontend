import { useEffect, useMemo, useState } from "react"

import { MOCK_CHECKING_ACCOUNT_ID } from "@/services/accountService"
import { getTransactionsByAccount } from "@/services/transactionService"
import type { Transaction } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatAmount(transaction: Transaction) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(transaction.amount)

  return transaction.type === "CREDIT" ? `+${formatted}` : `-${formatted}`
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    getTransactionsByAccount(MOCK_CHECKING_ACCOUNT_ID).then(setTransactions)
  }, [])

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return transactions
    return transactions.filter((transaction) =>
      transaction.merchantName.toLowerCase().includes(query)
    )
  }, [transactions, search])

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-sm font-medium text-slate-500">
          Recent Transactions
        </CardTitle>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by merchant..."
          className="w-full sm:w-56"
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-slate-500"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-slate-500">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {transaction.merchantName}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {transaction.category}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {transaction.status}
                  </TableCell>
                  <TableCell
                    className={
                      transaction.type === "CREDIT"
                        ? "text-right font-medium text-emerald-600"
                        : "text-right font-medium text-slate-900"
                    }
                  >
                    {formatAmount(transaction)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
