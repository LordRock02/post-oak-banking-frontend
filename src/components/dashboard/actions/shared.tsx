import type { ReactNode } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format"

interface AmountInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  invalid?: boolean
}

export function AmountInput({ id, value, onChange, invalid }: AmountInputProps) {
  return (
    <div
      className={cn(
        "flex h-14 items-center gap-1 rounded-xl border bg-white px-4 transition-colors focus-within:ring-3",
        invalid
          ? "border-rose-400 focus-within:ring-rose-500/15"
          : "border-input focus-within:border-ring focus-within:ring-ring/50"
      )}
    >
      <span className="text-2xl font-semibold text-slate-400">$</span>
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        placeholder="0.00"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ""))}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className="w-full bg-transparent text-2xl font-semibold text-slate-900 tabular-nums outline-none placeholder:text-slate-300"
      />
    </div>
  )
}

export function SubmitButton({ submitting, children }: { submitting: boolean; children: ReactNode }) {
  return (
    <Button type="submit" size="lg" disabled={submitting} className="mt-2 h-11 w-full rounded-xl text-sm">
      {submitting ? (
        <>
          <Loader2 className="animate-spin" data-icon="inline-start" />
          Processing…
        </>
      ) : (
        children
      )}
    </Button>
  )
}

interface SuccessViewProps {
  title: string
  amount: number
  lines: { label: string; value: string }[]
  onDone: () => void
}

export function SuccessView({ title, amount, lines, onDone }: SuccessViewProps) {
  return (
    <div className="flex flex-col items-center gap-5 pt-2 text-center animate-in fade-in zoom-in-95 duration-300">
      <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
        <CheckCircle2 className="size-7" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
          {formatCurrency(amount)}
        </p>
      </div>
      <dl className="w-full divide-y divide-slate-100 rounded-xl bg-slate-50 px-4 text-sm">
        {lines.map((line) => (
          <div key={line.label} className="flex justify-between gap-4 py-2.5">
            <dt className="text-slate-500">{line.label}</dt>
            <dd className="text-right font-medium text-slate-900">{line.value}</dd>
          </div>
        ))}
      </dl>
      <Button size="lg" onClick={onDone} className="h-11 w-full rounded-xl">
        Done
      </Button>
    </div>
  )
}
