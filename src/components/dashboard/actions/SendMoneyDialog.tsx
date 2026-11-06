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
import { Input } from "@/components/ui/input"
import { useBankingActions, useDashboardData } from "@/hooks/useBanking"
import { formatCurrency } from "@/lib/format"
import { notify } from "@/lib/toast"
import { SAVED_PAYEES } from "@/services/transactionService"
import type { Transaction } from "@/types"
import {
  AmountInput,
  SubmitButton,
  SuccessView,
} from "@/components/dashboard/actions/shared"
import { parseAmount, useSessionKey } from "@/components/dashboard/actions/formUtils"

interface SendMoneyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

function SendMoneyForm({ onClose }: { onClose: () => void }) {
  const { snapshots } = useDashboardData()
  const { sendMoney } = useBankingActions()

  const [payeeId, setPayeeId] = useState(SAVED_PAYEES[0].id)
  const [fromAccountId, setFromAccountId] = useState(snapshots[0]?.id ?? "")
  const [amountRaw, setAmountRaw] = useState("")
  const [note, setNote] = useState("")
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<Transaction | null>(null)

  const account = snapshots.find((a) => a.id === fromAccountId)
  const payee = SAVED_PAYEES.find((p) => p.id === payeeId)!
  const amount = parseAmount(amountRaw)

  const amountError =
    Number.isNaN(amount) || amount <= 0
      ? "Enter an amount greater than $0."
      : account && amount > account.available
        ? `Exceeds available balance of ${formatCurrency(account.available)}.`
        : undefined

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (amountError || !account) return

    setSubmitting(true)
    try {
      const transaction = await sendMoney({
        fromAccountId,
        payeeName: payee.name,
        amount: Math.round(amount * 100) / 100,
        note: note.trim(),
      })
      setResult(transaction)
      notify("Transfer sent", `${formatCurrency(transaction.amount)} to ${payee.name}`)
    } catch {
      notify("Transfer failed", "Please try again.", "error")
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <SuccessView
        title={`Sent to ${payee.name}`}
        amount={result.amount}
        onDone={onClose}
        lines={[
          { label: "From", value: account ? `${account.name} •••• ${account.lastFour}` : "—" },
          { label: "Status", value: "Pending · posts shortly" },
          { label: "Reference", value: result.reference },
        ]}
      />
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-xs font-medium text-foreground/80">Recipient</legend>
        <div className="grid grid-cols-2 gap-2">
          {SAVED_PAYEES.map((p) => (
            <label
              key={p.id}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-xl p-2.5 ring-1 transition-all has-focus-visible:ring-2 has-focus-visible:ring-ring",
                p.id === payeeId
                  ? "bg-teal-50/60 dark:bg-teal-400/10 ring-teal-600 dark:ring-teal-400"
                  : "ring-border hover:bg-muted/50"
              )}
            >
              <input
                type="radio"
                name="payee"
                value={p.id}
                checked={p.id === payeeId}
                onChange={() => setPayeeId(p.id)}
                className="sr-only"
              />
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                {initials(p.name)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-medium text-foreground">{p.name}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{p.detail}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label="Amount"
        htmlFor="send-amount"
        error={touched ? amountError : undefined}
        hint={account && `Available: ${formatCurrency(account.available)}`}
      >
        <AmountInput
          id="send-amount"
          value={amountRaw}
          onChange={setAmountRaw}
          invalid={touched && !!amountError}
        />
      </Field>

      <Field label="From account" htmlFor="send-from">
        <NativeSelect
          id="send-from"
          value={fromAccountId}
          onChange={(e) => setFromAccountId(e.target.value)}
        >
          {snapshots.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} •••• {a.lastFour} — {formatCurrency(a.available)} available
            </option>
          ))}
        </NativeSelect>
      </Field>

      <Field label="Note (optional)" htmlFor="send-note">
        <Input
          id="send-note"
          value={note}
          maxLength={80}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's it for?"
          className="h-10"
        />
      </Field>

      <SubmitButton submitting={submitting}>
        {!Number.isNaN(amount) && amount > 0
          ? `Send ${formatCurrency(amount)}`
          : "Send money"}
      </SubmitButton>
    </form>
  )
}

export function SendMoneyDialog({ open, onOpenChange }: SendMoneyDialogProps) {
  const sessionKey = useSessionKey(open)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send money</DialogTitle>
          <DialogDescription>Transfers arrive within minutes for saved recipients.</DialogDescription>
        </DialogHeader>
        <SendMoneyForm key={sessionKey} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
