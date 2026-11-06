import { Layout } from "@/components/layout/Layout"

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Checking", "Savings", "Credit Card"].map((account) => (
          <div
            key={account}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{account}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              $0.00
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-sm font-medium text-slate-900">Recent activity</p>
        <p className="mt-1 text-sm text-slate-500">
          No transactions yet.
        </p>
      </div>
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
