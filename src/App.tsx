import { useState } from "react"
import { ArrowUpRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ToastProvider } from "@/components/ui/toaster"
import { Layout } from "@/components/layout/Layout"
import { SendMoneyDialog } from "@/components/dashboard/actions/SendMoneyDialog"
import { AddFundsDialog } from "@/components/dashboard/actions/AddFundsDialog"
import { DashboardPage } from "@/pages/DashboardPage"
import { BankingProvider } from "@/state/BankingProvider"
import { ThemeProvider } from "@/theme/ThemeProvider"
import { useBankingState } from "@/hooks/useBanking"

type ActiveDialog = "send" | "add" | null

function AppShell() {
  const [dialog, setDialog] = useState<ActiveDialog>(null)
  const { status } = useBankingState()
  const closeIfDismissed = (open: boolean) => !open && setDialog(null)

  return (
    <>
      <Layout
        headerActions={
          <Button
            size="lg"
            onClick={() => setDialog("send")}
            disabled={status !== "ready"}
            className="hidden h-9 rounded-xl px-3.5 sm:inline-flex"
          >
            <ArrowUpRight data-icon="inline-start" />
            Send
          </Button>
        }
      >
        <DashboardPage
          onSendMoney={() => setDialog("send")}
          onAddFunds={() => setDialog("add")}
        />
      </Layout>

      <SendMoneyDialog open={dialog === "send"} onOpenChange={closeIfDismissed} />
      <AddFundsDialog open={dialog === "add"} onOpenChange={closeIfDismissed} />
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BankingProvider>
          <AppShell />
        </BankingProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
