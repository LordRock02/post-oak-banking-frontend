import { useState } from "react"
import { AlertTriangle, Bell, CheckCheck, CreditCard, TrendingUp } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AlertItem {
  id: string
  icon: LucideIcon
  tone: "warning" | "info" | "success"
  title: string
  detail: string
  time: string
}

const ALERTS: AlertItem[] = [
  {
    id: "low-balance",
    icon: AlertTriangle,
    tone: "warning",
    title: "Low balance warning",
    detail: "Savings dropped below your $500 alert threshold.",
    time: "2h ago",
  },
  {
    id: "large-transaction",
    icon: CreditCard,
    tone: "info",
    title: "Large transaction detected",
    detail: "A $420.00 charge posted to Checking •••• 4821.",
    time: "Yesterday",
  },
  {
    id: "savings-goal",
    icon: TrendingUp,
    tone: "success",
    title: "Savings goal milestone",
    detail: "You're 75% of the way to your Emergency Fund goal.",
    time: "3 days ago",
  },
]

const TONE_STYLES: Record<AlertItem["tone"], string> = {
  warning: "bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
  info: "bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400",
  success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
}

export function NotificationsMenu() {
  const [unread, setUnread] = useState(ALERTS.length)

  return (
    <DropdownMenu onOpenChange={(open) => open && setUnread(0)}>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative rounded-xl" aria-label="Notifications" />
        }
      >
        <Bell className="size-4.5 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-rose-500" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <div className="flex items-center justify-between px-1.5 py-1">
            <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
            {unread === 0 && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <CheckCheck className="size-3.5" />
                All caught up
              </span>
            )}
          </div>
          <DropdownMenuSeparator />
          <div className="flex flex-col gap-0.5">
            {ALERTS.map((alert) => (
              <DropdownMenuItem
                key={alert.id}
                className="items-start gap-2.5 py-2"
                closeOnClick={false}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                    TONE_STYLES[alert.tone]
                  )}
                >
                  <alert.icon className="size-3.5" />
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate text-xs font-medium text-foreground">{alert.title}</p>
                  <p className="line-clamp-2 text-[11px] text-muted-foreground">{alert.detail}</p>
                  <p className="text-[10px] text-faint">{alert.time}</p>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
