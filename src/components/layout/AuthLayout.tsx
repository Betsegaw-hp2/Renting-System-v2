import type React from "react"
import { Link } from "react-router-dom"
import { cn } from "../../lib/utils"
import { Header } from "./Header"

interface AuthLayoutProps {
  children: React.ReactNode
  className?: string
  showFooter?: boolean
}

export function AuthLayout({ children, className, showFooter = true }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className={cn("flex-1 bg-gray-50 dark:bg-gray-900", className)}>
        <div className="container mx-auto py-12">
          <div className="flex justify-center">{children}</div>
        </div>
      </main>

      {showFooter && (
        <footer className="border-t px-4 py-6 lg:px-6">
          <div className="container mx-auto">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} All-in-One Rental Place. All rights reserved.
              </p>
              <nav className="flex gap-4">
                <Link to="/terms" className="text-xs hover:underline underline-offset-4">
                  Terms of Service
                </Link>
                <Link to="/privacy" className="text-xs hover:underline underline-offset-4">
                  Privacy Policy
                </Link>
              </nav>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
