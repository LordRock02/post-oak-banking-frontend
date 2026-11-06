import { useEffect, useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipContentProps } from "recharts"

import { MOCK_CHECKING_ACCOUNT_ID } from "@/services/accountService"
import { getTransactionsByAccount } from "@/services/transactionService"
import type { Transaction } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CashFlowPoint {
  date: string
  income: number
  expenses: number
}

function formatDateLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

function aggregateCashFlow(transactions: Transaction[]): CashFlowPoint[] {
  const byDate = new Map<string, { income: number; expenses: number }>()

  for (const transaction of transactions) {
    const entry = byDate.get(transaction.date) ?? { income: 0, expenses: 0 }
    if (transaction.type === "CREDIT") {
      entry.income += transaction.amount
    } else {
      entry.expenses += transaction.amount
    }
    byDate.set(transaction.date, entry)
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { income, expenses }]) => ({ date, income, expenses }))
}

function CashFlowTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-xs font-medium text-slate-500">
        {formatDateLabel(label as string)}
      </p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey as string}
          className="text-sm font-medium"
          style={{ color: entry.color }}
        >
          {entry.name}: {formatCurrency(Number(entry.value))}
        </p>
      ))}
    </div>
  )
}

export function CashFlowChart() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    getTransactionsByAccount(MOCK_CHECKING_ACCOUNT_ID).then(setTransactions)
  }, [])

  const data = useMemo(() => aggregateCashFlow(transactions), [transactions])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-500">
          Cash Flow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expensesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateLabel}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value: number) =>
                  `$${Math.round(value / 100) * 100}`
                }
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip content={CashFlowTooltip} />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#incomeFill)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#f43f5e"
                strokeWidth={2}
                fill="url(#expensesFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
