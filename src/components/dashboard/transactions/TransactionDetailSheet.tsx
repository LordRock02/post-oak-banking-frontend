import { useState } from "react"
import type { ReactNode } from "react"
import { Check, Copy, Flag, Receipt } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatLongDate, formatSignedCurrency } from "@/lib/format"
import { notify } from "@/lib/toast"
import type { AccountSnapshot, Transaction } from "@/types"
import { CategoryIcon } from "@/components/dashboard/transactions/CategoryIcon"
import { StatusBadge } from "@/components/dashboard/transactions/StatusBadge"

interface TransactionDetailSheetProps {
  transaction: Transaction | null
  account: AccountSnapshot | undefined
  onOpenChange: (open: boolean) => void
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{children}</dd>
    </div>
  )
}

function CopyReference({ reference }: { reference: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reference)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      notify("Couldn't copy reference", undefined, "error")
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-mono text-xs transition-colors hover:bg-muted"
      aria-label={`Copy reference ${reference}`}
    >
      {reference}
      {copied ? (
        <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Copy className="size-3.5 text-faint" />
      )}
    </button>
  )
}

export function TransactionDetailSheet({
  transaction,
  account,
  onOpenChange,
}: TransactionDetailSheetProps) {
  // Keep the last transaction rendered while the sheet animates closed.
  const [displayed, setDisplayed] = useState(transaction)
  if (transaction && transaction !== displayed) setDisplayed(transaction)
  const t = transaction ?? displayed

  const credit = t?.type === "CREDIT"

  return (
    <Sheet open={transaction !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        {t && (
          <>
            <SheetHeader className="items-center gap-3 border-b border-border/70 px-6 pt-10 pb-6 text-center">
              <span
                className={cn(
                  "flex size-14 items-center justify-center rounded-2xl",
                  credit ? "bg-teal-50 dark:bg-teal-400/10 text-teal-700 dark:text-teal-300" : "bg-muted text-foreground/80"
                )}
              >
                <CategoryIcon category={t.category} className="size-6" strokeWidth={1.75} />
              </span>
              <SheetTitle className="text-base text-foreground">{t.merchantName}</SheetTitle>
              <p
                className={cn(
                  "text-3xl font-semibold tracking-tight tabular-nums",
                  credit ? "text-teal-700 dark:text-teal-300" : "text-foreground"
                )}
              >
                {formatSignedCurrency(t.amount, t.type)}
              </p>
              <SheetDescription>{formatLongDate(t.date)}</SheetDescription>
              <StatusBadge status={t.status} />
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6">
              {t.status === "FAILED" && (
                <p className="mt-4 rounded-xl bg-rose-50 dark:bg-rose-400/10 px-3.5 py-3 text-xs text-rose-900 dark:text-rose-300 ring-1 ring-rose-600/15 dark:ring-rose-400/25">
                  This transaction didn&apos;t go through. No money moved, and it doesn&apos;t count toward your balance.
                </p>
              )}
              {t.status === "PENDING" && (
                <p className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-400/10 px-3.5 py-3 text-xs text-amber-900 dark:text-amber-300 ring-1 ring-amber-600/15 dark:ring-amber-400/25">
                  {credit
                    ? "This deposit is being processed and will be added to your balance once it posts."
                    : "These funds are on hold and already deducted from your available balance. They'll post shortly."}
                </p>
              )}
              <dl className="divide-y divide-border/70">
                <DetailRow label="Type">{credit ? "Credit (money in)" : "Debit (money out)"}</DetailRow>
                <DetailRow label="Category">{t.category}</DetailRow>
                <DetailRow label="Account">
                  {account ? `${account.name} •••• ${account.lastFour}` : "—"}
                </DetailRow>
                {t.description && <DetailRow label="Note">{t.description}</DetailRow>}
                <DetailRow label="Reference">
                  <CopyReference reference={t.reference} />
                </DetailRow>
              </dl>
            </div>

            <SheetFooter className="flex-row border-t border-border/70 px-6">
              <Button
                variant="outline"
                className="h-10 flex-1 rounded-xl"
                onClick={() => notify("Receipt downloaded", `${t.reference}.pdf`)}
              >
                <Receipt data-icon="inline-start" />
                Receipt
              </Button>
              <Button
                variant="outline"
                className="h-10 flex-1 rounded-xl"
                onClick={() =>
                  notify("Dispute started", "Our team will contact you within 2 business days.", "info")
                }
              >
                <Flag data-icon="inline-start" />
                Report issue
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
