import { createElement } from "react"
import type { LucideProps } from "lucide-react"

import { getCategoryIcon } from "@/components/dashboard/transactions/categoryIcons"

/** Renders the lucide icon mapped to a transaction category. */
export function CategoryIcon({ category, ...props }: LucideProps & { category: string }) {
  return createElement(getCategoryIcon(category), { "aria-hidden": true, ...props })
}
