import { ChevronDown, LogOut, ShieldCheck, UserRound } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { notify } from "@/lib/toast"
import type { SettingsTab } from "@/components/settings/SettingsDialog"

interface ProfileMenuProps {
  onOpenSettings: (tab?: SettingsTab) => void
}

export function ProfileMenu({ onOpenSettings }: ProfileMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl py-1.5 pr-2 pl-1.5 text-sm transition-colors hover:bg-muted"
          />
        }
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-slate-800 text-xs font-semibold text-white">
          JD
        </span>
        <span className="hidden text-sm font-medium text-foreground/80 sm:inline">Jane Doe</span>
        <ChevronDown className="hidden size-3.5 text-faint sm:inline" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block text-xs font-medium text-foreground">Jane Doe</span>
            <span className="block text-[11px] font-normal text-muted-foreground">
              jane.doe@example.com
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onOpenSettings("profile")}>
            <UserRound />
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onOpenSettings("security")}>
            <ShieldCheck />
            Security
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => notify("Signed out", "You've been logged out of this session.", "info")}
        >
          <LogOut />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
