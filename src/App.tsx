import { useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { ArrowUpRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ToastProvider } from "@/components/ui/toaster"
import { Layout } from "@/components/layout/Layout"
import { SendMoneyDialog } from "@/components/dashboard/actions/SendMoneyDialog"
import { AddFundsDialog } from "@/components/dashboard/actions/AddFundsDialog"
import { SettingsDialog } from "@/components/settings/SettingsDialog"
import type { SettingsTab } from "@/components/settings/SettingsDialog"
import { GuestRoute, ProtectedRoute } from "@/components/auth/RouteGuards"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { BankingProvider } from "@/state/BankingProvider"
import { AuthProvider } from "@/state/AuthProvider"
import { ThemeProvider } from "@/theme/ThemeProvider"
import { useBankingState } from "@/hooks/useBanking"

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

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/"
                  element={
                    <BankingProvider>
                      <AppShell />
                    </BankingProvider>
                  }
                />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
