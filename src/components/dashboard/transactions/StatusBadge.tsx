import { CheckCircle2, Clock, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { TransactionStatus } from "@/types"

/** Status is conveyed by icon + label, with colour as reinforcement only. */
export function StatusBadge({ status }: { status: TransactionStatus }) {
  if (status === "FAILED") {
    return (
      <Badge tone="danger">
        <XCircle className="size-3" aria-hidden="true" />
        FAILED
      </Badge>
    )
  }
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
