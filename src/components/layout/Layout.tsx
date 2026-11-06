import { useState } from "react"
import type { ReactNode } from "react"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Settings,
  Menu,
  ChevronDown,
  Landmark,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  active?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Transactions", icon: ArrowLeftRight },
  { label: "Settings", icon: Settings },
]

const CURRENT_YEAR = new Date().getFullYear()

function BrandMark() {
  return (
    <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-5">
      <Landmark className="size-5 text-slate-900" strokeWidth={1.75} />
      <span className="text-sm font-semibold tracking-tight text-slate-900">
        Post Oak
      </span>
    </div>
  )
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 p-3">
      {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
        <a
          key={label}
          href="#"
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            active
              ? "bg-slate-100 text-slate-900"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <Icon className="size-4" strokeWidth={1.75} />
          {label}
        </a>
      ))}
    </nav>
  )
}

function UserProfile() {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-md py-1.5 pr-1 pl-2 text-sm hover:bg-slate-50"
    >
      <div className="flex size-7 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-700">
        JD
      </div>
      <span className="hidden text-sm font-medium text-slate-700 sm:inline">
        Jane Doe
      </span>
      <ChevronDown className="hidden size-3.5 text-slate-400 sm:inline" />
    </button>
  )
}

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200 bg-white md:flex">
      <BrandMark />
      <NavLinks />
      <div className="border-t border-slate-200 p-3 text-xs text-slate-400">
        &copy; {CURRENT_YEAR} Post Oak Banking
      </div>
    </aside>
  )
}

function TopHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" />
            }
          >
            <Menu className="size-5" />
            <span className="sr-only">Open navigation</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <BrandMark />
            <NavLinks onNavigate={() => setMobileNavOpen(false)} />
          </SheetContent>
        </Sheet>
        <span className="text-sm font-medium text-slate-900">Dashboard</span>
      </div>
      <UserProfile />
    </header>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex min-h-screen flex-col md:pl-60">
        <TopHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
