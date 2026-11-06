import { useState } from "react"

import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"

type AuthView = "login" | "register"

export function AuthPage() {
  const [view, setView] = useState<AuthView>("login")

  if (view === "register") {
    return (
      <RegisterPage
        onSwitchToLogin={() => setView("login")}
        onRegistered={() => setView("login")}
      />
    )
  }

  return <LoginPage onSwitchToRegister={() => setView("register")} />
}
