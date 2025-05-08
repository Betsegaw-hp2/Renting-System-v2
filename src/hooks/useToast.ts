"use client"

import type React from "react"

// Simplified version of the useToast hook
import { useCallback, useEffect, useState } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  duration?: number,
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

type ToastActionProps = Omit<ToastProps, "id">

let count = 0

function generateId() {
  return `toast-${++count}`
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(({ title, description, action, duration = 5000, variant }: ToastActionProps) => {
    const id = generateId()

    setToasts((toasts) => [...toasts, { id, title, description, action, duration, variant }])

    return id
  }, [])

  // Auto-dismiss toasts after their duration
  useEffect(() => {
    const timers = toasts
      .map((toast) => {
        if (toast.duration) {
          const timer = setTimeout(() => {
            dismiss(toast.id)
          }, toast.duration)
          return { id: toast.id, timer }
        }
        return null
      })
      .filter(Boolean) as { id: string; timer: NodeJS.Timeout }[]

    return () => {
      timers.forEach((timer) => {
        clearTimeout(timer.timer)
      })
    }
  }, [toasts, dismiss])

  return {
    toasts,
    toast,
    dismiss,
  }
}
