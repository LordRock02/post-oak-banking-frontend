import { Landmark } from "lucide-react"
import { cn } from "cn"

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-16 items-center gap-2.5 px-5", className)}>
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Landmark className="size-4" strokeWidth={2} />
      </span>
      <span className="text-sm font-semibold tracking-tight text-foreground">Post Oak</span>
    </div>
  )
}
