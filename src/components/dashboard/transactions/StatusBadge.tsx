import { CheckCircle2, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { TransactionStatus } from "@/types"

/** Status is conveyed by icon + label, with colour as reinforcement only. */
export function StatusBadge({ status }: { status: TransactionStatus }) {
  return status === "PENDING" ? (
    <Badge tone="warning">
      <Clock className="size-3" aria-hidden="true" />
      PENDING
    </Badge>
  ) : (
    <Badge tone="success">
      <CheckCircle2 className="size-3" aria-hidden="true" />
      POSTED
    </Badge>
  )
}
