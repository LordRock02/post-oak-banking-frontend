import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useBankingActions, useDashboardData } from "@/hooks/useBanking"
import { BalanceHero } from "@/components/dashboard/overview/BalanceHero"
import { AccountCards } from "@/components/dashboard/overview/AccountCards"
import { MonthlySummary } from "@/components/dashboard/overview/MonthlySummary"
import { CashFlowChart } from "@/components/dashboard/CashFlowChart"
import { TransactionHistory } from "@/components/dashboard/transactions/TransactionHistory"

function greeting(date: Date) {
  const hour = date.getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

function LoadError({ message }: { message: string }) {
  const { reload } = useBankingActions()
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl bg-rose-50 dark:bg-rose-400/10 p-5 ring-1 ring-rose-600/15 dark:ring-rose-400/25 sm:flex-row sm:items-center">
      <AlertTriangle className="size-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-sm font-medium text-rose-900 dark:text-rose-300">We couldn't load your accounts</p>
        <p className="text-xs text-rose-700 dark:text-rose-300">{message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={reload}>
        Try again
      </Button>
    </div>
  )
}

interface DashboardPageProps {
  onSendMoney: () => void
  onAddFunds: () => void
}

export function DashboardPage({ onSendMoney, onAddFunds }: DashboardPageProps) {
  const { status, error, today } = useDashboardData()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div id="overview" className="scroll-mt-20">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {greeting(today)}, Jane
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} ·
          Here&apos;s where your money stands.
        </p>
      </div>

      {status === "error" && <LoadError message={error ?? "Unknown error"} />}

      <BalanceHero onSendMoney={onSendMoney} onAddFunds={onAddFunds} />
      <AccountCards />
      <MonthlySummary />
      <CashFlowChart />
      <TransactionHistory />
    </div>
  )
}
