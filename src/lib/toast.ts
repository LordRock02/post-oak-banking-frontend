import { Toast } from "@base-ui/react/toast"

export type ToastTone = "success" | "info" | "error"

/**
 * App-wide toast manager. Usable from non-component code (e.g. the banking
 * provider's settlement timers) as well as from components.
 */
export const toastManager = Toast.createToastManager()

export function notify(title: string, description?: string, tone: ToastTone = "success") {
  toastManager.add({ title, description, type: tone })
}
