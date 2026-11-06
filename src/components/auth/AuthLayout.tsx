import type { ReactNode } from "react"

import { BrandMark } from "@/components/layout/BrandMark"

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-2 self-center">
        <BrandMark className="px-0" />
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/5 sm:p-8 dark:ring-white/10">
        <div className="mb-6 flex flex-col gap-1 text-center">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {children}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">{footer}</p>
    </div>
  )
}
