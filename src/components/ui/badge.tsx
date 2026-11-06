import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap ring-1 ring-inset",
  {
    variants: {
      tone: {
        neutral: "bg-muted/50 text-muted-foreground ring-border",
        success: "bg-emerald-50 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-300 ring-emerald-600/20 dark:ring-emerald-400/25",
        warning: "bg-amber-50 dark:bg-amber-400/10 text-amber-800 dark:text-amber-300 ring-amber-600/25 dark:ring-amber-400/25",
        info: "bg-sky-50 dark:bg-sky-400/10 text-sky-700 dark:text-sky-300 ring-sky-600/20 dark:ring-sky-400/25",
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
