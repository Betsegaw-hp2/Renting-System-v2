"use client"

import type React from "react"
import { useEffect, useState } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  duration?: number
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  // size prop was here but not used by the Toaster component
}

type ToastActionProps = Omit<ToastProps, "id">

let count = 0

function generateId() {
  return `toast-${++count}`
}

// Global state for toasts
let globalToasts: ToastProps[] = []

// Listeners that will be called when toasts change
type Listener = (toasts: ToastProps[]) => void;
const listeners: Set<Listener> = new Set()

// Timers for auto-dismissal, mapping toast ID to its timer
const toastTimers: Map<string, NodeJS.Timeout> = new Map()

// Function to update global toasts and notify listeners
const updateGlobalToastsAndNotify = (newToasts: ToastProps[]) => {
  globalToasts = newToasts
  // Notify all listeners with a copy of the toasts array
  listeners.forEach((listener) => listener([...globalToasts]))
}

export const dismiss = (id: string): void => {
  // Clear any existing timer for this toast
  if (toastTimers.has(id)) {
    clearTimeout(toastTimers.get(id)!)
    toastTimers.delete(id)
  }
  updateGlobalToastsAndNotify(globalToasts.filter((toast) => toast.id !== id))
}

export const toast = ({ title, description, action, duration = 5000, variant }: ToastActionProps): string => {
  const id = generateId()
  
  // Helper function to safely convert description to string
  const safeDescription = (desc: any): string | undefined => {
    if (desc === null || desc === undefined) {
      return undefined
    }
    
    if (typeof desc === 'string') {
      return desc
    }
    
    if (typeof desc === 'object') {
      // Handle error objects or API response objects
      if (desc.message && typeof desc.message === 'string') {
        return desc.message
      }
      
      if (desc.error && typeof desc.error === 'string') {
        return desc.error
      }
      
      // If it's an object with field-specific errors, extract the first error
      const errorValues = Object.values(desc).filter(value => typeof value === 'string')
      if (errorValues.length > 0) {
        return errorValues[0] as string
      }
      
      // If errors are in an array format
      if (Array.isArray(desc) && desc.length > 0 && typeof desc[0] === 'string') {
        return desc[0]
      }
      
      // Fallback to JSON.stringify for objects
      try {
        return JSON.stringify(desc)
      } catch {
        return "An error occurred"
      }
    }
    
    // For any other type, convert to string
    return String(desc)
  }
  
  const newToast: ToastProps = { 
    id, 
    title, 
    description: safeDescription(description), 
    action, 
    duration, 
    variant 
  }

  // Add to global toasts
  // Ensure not to add duplicate toasts if rapidly called, though ID generation should prevent this.
  const updatedToasts = [...globalToasts, newToast]
  updateGlobalToastsAndNotify(updatedToasts)

  // Set timer for auto-dismissal if duration is provided
  if (newToast.duration) {
    const timer = setTimeout(() => {
      dismiss(id)
    }, newToast.duration)
    toastTimers.set(id, timer)
  }
  return id
}

// The hook itself
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>(globalToasts)

  useEffect(() => {
    const listener: Listener = (currentToasts) => {
      setToasts(currentToasts) // The listener now receives a new array instance
    }

    listeners.add(listener)
    // Initial sync with a new array instance, in case toasts were added before this hook instance mounted
    setToasts([...globalToasts])

    return () => {
      listeners.delete(listener)
    }
  }, [])

  return {
    toasts,
    toast, // return the global toast function
    dismiss, // return the global dismiss function
  }
}
