import { useState } from "react"
import type { FormEvent } from "react"
import { cn } from "cn"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, NativeSelect } from "@/components/ui/field"
import { useBankingActions, useDashboardData } from "@/hooks/useBanking"
import { formatCurrency } from "@/lib/format"
import { notify } from "@/lib/toast"
import { FUNDING_SOURCES } from "@/services/transactionService"
import type { Transaction } from "@/types"
import {
  AmountInput,
  SubmitButton,
  SuccessView,
} from "@/components/dashboard/actions/shared"
import { parseAmount, useSessionKey } from "@/components/dashboard/actions/formUtils"

const PRESETS = [50, 100, 250, 500]
const MAX_DEPOSIT = 25_000

interface AddFundsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function AddFundsForm({ onClose }: { onClose: () => void }) {
  const { snapshots } = useDashboardData()
  const { addFunds } = useBankingActions()

  const [toAccountId, setToAccountId] = useState(snapshots[0]?.id ?? "")
  const [source, setSource] = useState<string>(FUNDING_SOURCES[0])
  const [amountRaw, setAmountRaw] = useState("")
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<Transaction | null>(null)

  const account = snapshots.find((a) => a.id === toAccountId)
  const amount = parseAmount(amountRaw)
  const amountError =
    Number.isNaN(amount) || amount <= 0
      ? "Enter an amount greater than $0."
      : amount > MAX_DEPOSIT
        ? `Daily deposit limit is ${formatCurrency(MAX_DEPOSIT)}.`
        : undefined

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (amountError || !account) return

    setSubmitting(true)
    try {
      const transaction = await addFunds({
        toAccountId,
        source,
        amount: Math.round(amount * 100) / 100,
      })
      setResult(transaction)
      notify("Deposit initiated", `${formatCurrency(transaction.amount)} to ${account.name}`)
    } catch {
      notify("Deposit failed", "Please try again.", "error")
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <SuccessView
        title="Deposit on its way"
        amount={result.amount}
        onDone={onClose}
        lines={[
          { label: "To", value: account ? `${account.name} •••• ${account.lastFour}` : "—" },
          { label: "From", value: source },
          { label: "Reference", value: result.reference },
        ]}
      />
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Amount" htmlFor="add-amount" error={touched ? amountError : undefined}>
        <AmountInput
          id="add-amount"
          value={amountRaw}
          onChange={setAmountRaw}
          invalid={touched && !!amountError}
        />
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmountRaw(String(preset))}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium ring-1 transition-all active:scale-95",
                amount === preset
                  ? "bg-slate-900 text-white ring-slate-900"
                  : "text-slate-600 ring-slate-200 hover:bg-slate-50"
              )}
            >
              {formatCurrency(preset).replace(".00", "")}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Deposit to" htmlFor="add-to">
        <NativeSelect id="add-to" value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
          {snapshots.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} •••• {a.lastFour}
            </option>
          ))}
        </NativeSelect>
      </Field>

      <Field label="Funding source" htmlFor="add-source" hint="Deposits typically post within 1 business day.">
        <NativeSelect id="add-source" value={source} onChange={(e) => setSource(e.target.value)}>
          {FUNDING_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </NativeSelect>
      </Field>

      <SubmitButton submitting={submitting}>
        {!Number.isNaN(amount) && amount > 0 ? `Add ${formatCurrency(amount)}` : "Add funds"}
      </SubmitButton>
    </form>
  )
}

export function AddFundsDialog({ open, onOpenChange }: AddFundsDialogProps) {
  const sessionKey = useSessionKey(open)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add funds</DialogTitle>
          <DialogDescription>Move money into your Post Oak accounts.</DialogDescription>
        </DialogHeader>
        <AddFundsForm key={sessionKey} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
