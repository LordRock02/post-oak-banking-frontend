import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import {
  ArrowLeftRight,
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
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { NotificationsMenu } from "@/components/layout/NotificationsMenu"
import { ProfileMenu } from "@/components/layout/ProfileMenu"
import type { SettingsTab } from "@/components/settings/SettingsDialog"
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
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Landmark className="size-4" strokeWidth={2} />
      </span>
      <span className="text-sm font-semibold tracking-tight text-foreground">Post Oak</span>
    </div>
  )
}

interface NavLinksProps {
  active: string
  onNavigate: (id: string) => void
  onOpenSettings: () => void
}

function NavLinks({ active, onNavigate, onOpenSettings }: NavLinksProps) {
  return (
    <nav aria-label="Main" className="flex flex-1 flex-col gap-1 px-3 py-2">
      {NAV_ITEMS.map(({ id, label, icon: Icon, target }) => {
        const isActive = active === id
        const itemClassName = cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground"
        )
        const content = (
          <>
            <Icon className="size-4 transition-transform group-hover:scale-110" strokeWidth={1.75} />
            {label}
          </>
        )

        // Settings opens a dialog rather than navigating, so it's a button, not a link.
        if (!target) {
          return (
            <button key={id} type="button" onClick={onOpenSettings} className={itemClassName}>
              {content}
            </button>
          )
        }

        return (
          <a
            key={id}
            href={`#${target}`}
            aria-current={isActive ? "page" : undefined}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" })
              onNavigate(id)
            }}
            className={itemClassName}
          >
            {content}
          </a>
        )
      })}
    </nav>
  )
}

function SecurityCard() {
  return (
    <div className="m-3 rounded-2xl bg-muted/50 p-4 ring-1 ring-foreground/5 dark:ring-white/10">
      <ShieldCheck className="size-5 text-teal-600 dark:text-teal-400" strokeWidth={1.75} />
      <p className="mt-2 text-xs font-medium text-foreground">Your account is protected</p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
        FDIC insured up to $250,000. Two-factor authentication is on.
      </p>
    </div>
  )
}

interface LayoutProps {
  children: ReactNode
  /** Extra controls rendered in the top header (e.g. primary actions). */
  headerActions?: ReactNode
  onOpenSettings: (tab?: SettingsTab) => void
}

export function Layout({ children, headerActions, onOpenSettings }: LayoutProps) {
  const [active, setActive] = useActiveSection()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const activeLabel = NAV_ITEMS.find((item) => item.id === active)?.label ?? "Dashboard"

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/70 bg-card md:flex">
        <BrandMark />
        <NavLinks active={active} onNavigate={setActive} onOpenSettings={() => onOpenSettings()} />
        <SecurityCard />
        <p className="px-5 pb-4 text-[11px] text-faint">&copy; {CURRENT_YEAR} Post Oak Banking</p>
      </aside>

      <div className="flex min-h-screen flex-col md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border/70 bg-card/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
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
                  onOpenSettings={() => {
                    setMobileNavOpen(false)
                    onOpenSettings()
                  }}
                />
                <SecurityCard />
              </SheetContent>
            </Sheet>
            <span className="text-sm font-medium text-foreground">{activeLabel}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {headerActions}
            <ThemeToggle />
            <NotificationsMenu />
            <ProfileMenu onOpenSettings={onOpenSettings} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
