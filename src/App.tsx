import { useState } from "react"
import { ArrowUpRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ToastProvider } from "@/components/ui/toaster"
import { Layout } from "@/components/layout/Layout"
import { SendMoneyDialog } from "@/components/dashboard/actions/SendMoneyDialog"
import { AddFundsDialog } from "@/components/dashboard/actions/AddFundsDialog"
import { SettingsDialog } from "@/components/settings/SettingsDialog"
import type { SettingsTab } from "@/components/settings/SettingsDialog"
import { AuthPage } from "@/pages/AuthPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { BankingProvider } from "@/state/BankingProvider"
import { AuthProvider } from "@/state/AuthProvider"
import { ThemeProvider } from "@/theme/ThemeProvider"
import { useBankingState } from "@/hooks/useBanking"
import { useAuthState } from "@/hooks/useAuth"

type ActiveDialog = "send" | "add" | "settings" | null

function AppShell() {
  const [dialog, setDialog] = useState<ActiveDialog>(null)
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("profile")
  const { status } = useBankingState()
  const closeIfDismissed = (open: boolean) => !open && setDialog(null)
  const openSettings = (tab: SettingsTab = "profile") => {
    setSettingsTab(tab)
    setDialog("settings")
  }

  return (
    <>
      <Layout
        onOpenSettings={openSettings}
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
      <SettingsDialog
        open={dialog === "settings"}
        onOpenChange={closeIfDismissed}
        defaultTab={settingsTab}
      />
    </>
  )
}

function AuthGate() {
  const { status } = useAuthState()

  if (status !== "authenticated") return <AuthPage />

  return (
    <BankingProvider>
      <AppShell />
    </BankingProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
