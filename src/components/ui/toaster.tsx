import type { ReactNode } from "react"
import { Toast } from "@base-ui/react/toast"
import { CheckCircle2, Info, XCircle, XIcon } from "lucide-react"
import { cn } from "cn"

import { toastManager } from "@/lib/toast"

const ICONS = {
  success: <CheckCircle2 className="size-4 text-emerald-600" />,
  info: <Info className="size-4 text-sky-600" />,
  error: <XCircle className="size-4 text-rose-600" />,
} as const

function ToastList() {
  const { toasts } = Toast.useToastManager()

  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      swipeDirection={["right", "down"]}
      className={cn(
        "relative flex w-full items-start gap-3 rounded-xl bg-white p-3.5 pr-10 shadow-lg ring-1 ring-slate-900/10 transition-all duration-300 ease-out select-none",
        "data-starting-style:translate-y-4 data-starting-style:opacity-0 data-ending-style:translate-x-6 data-ending-style:opacity-0 data-limited:hidden"
      )}
    >
      <span className="mt-0.5">
        {ICONS[(toast.type as keyof typeof ICONS) ?? "info"] ?? ICONS.info}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <Toast.Title className="text-sm font-semibold text-slate-900" />
        <Toast.Description className="text-xs text-slate-500" />
      </div>
      <Toast.Close
        aria-label="Dismiss"
        className="absolute top-2.5 right-2.5 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <XIcon className="size-3.5" />
      </Toast.Close>
    </Toast.Root>
  ))
}

/** Provides the toast manager and renders the stacked toast viewport. */
function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider toastManager={toastManager} timeout={4500} limit={3}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="fixed right-4 bottom-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  )
}

export { ToastProvider }
