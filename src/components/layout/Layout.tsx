import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import {
  ArrowLeftRight,
  Bell,
  ChevronDown,
  Landmark,
  LayoutDashboard,
  LineChart,
  Menu,
  Settings,
  ShieldCheck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  /** Section id to scroll to; items without one are not yet available. */
  target?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, target: "overview" },
  { id: "cash-flow", label: "Cash flow", icon: LineChart, target: "cash-flow" },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight, target: "transactions" },
  { id: "settings", label: "Settings", icon: Settings },
]

const CURRENT_YEAR = new Date().getFullYear()

/** Tracks which dashboard section is currently in view. */
function useActiveSection() {
  const [active, setActive] = useState(NAV_ITEMS[0].id)

  useEffect(() => {
    const sections = NAV_ITEMS.flatMap((item) =>
      item.target ? [document.getElementById(item.target)].filter(Boolean) : []
    ) as HTMLElement[]
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-80px 0px -55% 0px" }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return [active, setActive] as const
}

function BrandMark() {
  return (
    <div className="flex h-16 items-center gap-2.5 px-5">
      <span className="flex size-8 items-center justify-center rounded-xl bg-slate-900 text-white">
        <Landmark className="size-4" strokeWidth={2} />
      </span>
      <span className="text-sm font-semibold tracking-tight text-slate-900">Post Oak</span>
    </div>
  )
}

interface NavLinksProps {
  active: string
  onNavigate: (id: string) => void
}

function NavLinks({ active, onNavigate }: NavLinksProps) {
  return (
    <nav aria-label="Main" className="flex flex-1 flex-col gap-1 px-3 py-2">
      {NAV_ITEMS.map(({ id, label, icon: Icon, target }) => {
        const isActive = active === id
        return (
          <a
            key={id}
            href={target ? `#${target}` : undefined}
            aria-disabled={!target || undefined}
            aria-current={isActive ? "page" : undefined}
            onClick={(e) => {
              e.preventDefault()
              if (!target) return
              document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" })
              onNavigate(id)
            }}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
              isActive
                ? "bg-slate-900 text-white shadow-sm"
                : target
                  ? "cursor-pointer text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  : "cursor-not-allowed text-slate-400"
            )}
          >
            <Icon className="size-4 transition-transform group-hover:scale-110" strokeWidth={1.75} />
            {label}
            {!target && (
              <span className="ml-auto rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                Soon
              </span>
            )}
          </a>
        )
      })}
    </nav>
  )
}

function SecurityCard() {
  return (
    <div className="m-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-900/5">
      <ShieldCheck className="size-5 text-teal-600" strokeWidth={1.75} />
      <p className="mt-2 text-xs font-medium text-slate-900">Your account is protected</p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
        FDIC insured up to $250,000. Two-factor authentication is on.
      </p>
    </div>
  )
}

function UserProfile() {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-xl py-1.5 pr-2 pl-1.5 text-sm transition-colors hover:bg-slate-100"
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-slate-800 text-xs font-semibold text-white">
        JD
      </span>
      <span className="hidden text-sm font-medium text-slate-700 sm:inline">Jane Doe</span>
      <ChevronDown className="hidden size-3.5 text-slate-400 sm:inline" />
    </button>
  )
}

interface LayoutProps {
  children: ReactNode
  /** Extra controls rendered in the top header (e.g. primary actions). */
  headerActions?: ReactNode
}

export function Layout({ children, headerActions }: LayoutProps) {
  const [active, setActive] = useActiveSection()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const activeLabel = NAV_ITEMS.find((item) => item.id === active)?.label ?? "Dashboard"

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200/70 bg-white md:flex">
        <BrandMark />
        <NavLinks active={active} onNavigate={setActive} />
        <SecurityCard />
        <p className="px-5 pb-4 text-[11px] text-slate-400">&copy; {CURRENT_YEAR} Post Oak Banking</p>
      </aside>

      <div className="flex min-h-screen flex-col md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
                <Menu className="size-5" />
                <span className="sr-only">Open navigation</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 gap-0 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <BrandMark />
                <NavLinks
                  active={active}
                  onNavigate={(id) => {
                    setActive(id)
                    setMobileNavOpen(false)
                  }}
                />
                <SecurityCard />
              </SheetContent>
            </Sheet>
            <span className="text-sm font-medium text-slate-900">{activeLabel}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {headerActions}
            <Button variant="ghost" size="icon" className="relative rounded-xl" aria-label="Notifications">
              <Bell className="size-4.5 text-slate-600" />
              <span className="absolute top-2 right-2 size-1.5 rounded-full bg-rose-500" />
            </Button>
            <UserProfile />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
