import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { SegmentedControl } from "@/components/ui/segmented-control"
import type { SegmentedOption } from "@/components/ui/segmented-control"
import { useSessionKey } from "@/components/dashboard/actions/formUtils"
import { useTheme } from "@/hooks/useTheme"
import type { Theme } from "@/theme/theme"
import { notify } from "@/lib/toast"

export type SettingsTab = "profile" | "security" | "notifications" | "appearance"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: SettingsTab
}

const TABS: SegmentedOption<SettingsTab>[] = [
  { value: "profile", label: "Profile" },
  { value: "security", label: "Security" },
  { value: "notifications", label: "Notifications" },
  { value: "appearance", label: "Appearance" },
]

const THEME_OPTIONS: SegmentedOption<Theme>[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]

function SettingsRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl p-3 ring-1 ring-border/70">
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  )
}

function ProfileSection({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("Jane Doe")
  const [email, setEmail] = useState("jane.doe@example.com")

  const onSave = () => {
    notify("Profile updated", "Your changes have been saved.")
    onClose()
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Full name" htmlFor="settings-name">
        <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Email address" htmlFor="settings-email">
        <Input
          id="settings-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Button onClick={onSave} className="mt-1 h-10 w-full rounded-xl">
        Save changes
      </Button>
    </div>
  )
}

function SecuritySection({ onClose }: { onClose: () => void }) {
  const [twoFactor, setTwoFactor] = useState(true)
  const [loginAlerts, setLoginAlerts] = useState(true)

  const onSave = () => {
    notify("Security settings updated", "Your changes have been saved.")
    onClose()
  }

  return (
    <div className="flex flex-col gap-4">
      <SettingsRow
        label="Two-factor authentication"
        description="Require a verification code when signing in."
        checked={twoFactor}
        onCheckedChange={setTwoFactor}
      />
      <SettingsRow
        label="Login alerts"
        description="Get notified of sign-ins from new devices."
        checked={loginAlerts}
        onCheckedChange={setLoginAlerts}
      />
      <Field label="Password" htmlFor="settings-password" hint="Last changed 3 months ago.">
        <Input id="settings-password" type="password" value="••••••••••" readOnly />
      </Field>
      <Button onClick={onSave} className="mt-1 h-10 w-full rounded-xl">
        Save changes
      </Button>
    </div>
  )
}

function NotificationsSection({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState(true)
  const [push, setPush] = useState(true)
  const [sms, setSms] = useState(false)

  const onSave = () => {
    notify("Notification preferences updated", "Your changes have been saved.")
    onClose()
  }

  return (
    <div className="flex flex-col gap-4">
      <SettingsRow
        label="Email alerts"
        description="Low balance, large transactions, and statements."
        checked={email}
        onCheckedChange={setEmail}
      />
      <SettingsRow
        label="Push notifications"
        description="Real-time alerts on this device."
        checked={push}
        onCheckedChange={setPush}
      />
      <SettingsRow
        label="SMS alerts"
        description="Critical account alerts via text message."
        checked={sms}
        onCheckedChange={setSms}
      />
      <Button onClick={onSave} className="mt-1 h-10 w-full rounded-xl">
        Save changes
      </Button>
    </div>
  )
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 rounded-xl p-3 ring-1 ring-border/70">
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">Theme</span>
          <span className="text-xs text-muted-foreground">
            Choose how Post Oak Banking looks on this device.
          </span>
        </span>
        <SegmentedControl label="Theme" options={THEME_OPTIONS} value={theme} onChange={setTheme} />
      </div>
    </div>
  )
}

export function SettingsDialog({ open, onOpenChange, defaultTab = "profile" }: SettingsDialogProps) {
  const sessionKey = useSessionKey(open)
  const [tab, setTab] = useState(defaultTab)
  const [prevSessionKey, setPrevSessionKey] = useState(sessionKey)
  if (sessionKey !== prevSessionKey) {
    setPrevSessionKey(sessionKey)
    setTab(defaultTab)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" key={sessionKey}>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your profile, security, and preferences.</DialogDescription>
        </DialogHeader>

        <SegmentedControl
          label="Settings section"
          options={TABS}
          value={tab}
          onChange={setTab}
          className="mb-5 self-start"
        />

        {tab === "profile" && <ProfileSection onClose={() => onOpenChange(false)} />}
        {tab === "security" && <SecuritySection onClose={() => onOpenChange(false)} />}
        {tab === "notifications" && <NotificationsSection onClose={() => onOpenChange(false)} />}
        {tab === "appearance" && <AppearanceSection />}
      </DialogContent>
    </Dialog>
  )
}
