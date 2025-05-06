import type React from "react"
import { cn } from "../../lib/utils"

interface FormCardProps {
  children: React.ReactNode
  title: string
  description?: string
  className?: string
}

export function FormCard({ children, title, description, className }: FormCardProps) {
  return (
    <div className={cn("w-full max-w-2xl", className)}>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="text-gray-500 dark:text-gray-400">{description}</p>}
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        {children}
      </div>
    </div>
  )
}
