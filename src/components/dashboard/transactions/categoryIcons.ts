import type { LucideIcon } from "lucide-react"
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Banknote,
  Car,
  Coffee,
  HeartPulse,
  Home,
  Percent,
  ShoppingBag,
  ShoppingCart,
  Tv,
  Zap,
  CircleDollarSign,
  Laptop,
} from "lucide-react"

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Income: Banknote,
  Payroll: Banknote,
  Software: Laptop,
  Deposit: ArrowDownLeft,
  Interest: Percent,
  Transfer: ArrowLeftRight,
  "Transfer Out": ArrowUpRight,
  Housing: Home,
  Utilities: Zap,
  Groceries: ShoppingCart,
  Shopping: ShoppingBag,
  "Food & Drink": Coffee,
  Transportation: Car,
  Entertainment: Tv,
  Health: HeartPulse,
}

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? CircleDollarSign
}
