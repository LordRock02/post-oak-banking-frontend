import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap ring-1 ring-inset",
  {
    variants: {
      tone: {
        neutral: "bg-slate-50 text-slate-600 ring-slate-200",
        success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        warning: "bg-amber-50 text-amber-800 ring-amber-600/25",
        info: "bg-sky-50 text-sky-700 ring-sky-600/20",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

function Badge({
  className,
  tone,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ tone }), className)} {...props} />
  )
}

export { Badge }
