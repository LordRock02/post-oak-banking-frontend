import { Layout } from "@/components/layout/Layout"
import { DashboardOverview } from "@/components/dashboard/DashboardOverview"

function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here&apos;s an overview of your accounts.
        </p>
      </div>

      <DashboardOverview />
    </div>
  )
}

function App() {
  return (
    <Layout>
      <DashboardPage />
    </Layout>
  )
}

export default App
