import { useState } from "react"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive"
}

interface ToastState {
  toasts: Toast[]
}

export function useToast() {
  const [state, setState] = useState<ToastState>({ toasts: [] })

  const toast = ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { id, title, description, variant }

    setState(prev => ({
      toasts: [...prev.toasts, newToast],
    }))

    // 3秒後に自動で消える
    setTimeout(() => {
      setState(prev => ({
        toasts: prev.toasts.filter(t => t.id !== id),
      }))
    }, 3000)
  }

  return {
    toast,
    toasts: state.toasts,
  }
}
