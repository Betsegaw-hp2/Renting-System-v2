import type React from "react"
import { Link } from "react-router-dom"
import { cn } from "../../lib/utils"

interface AuthLayoutProps {
  children: React.ReactNode
  className?: string
  showFooter?: boolean
}

export function AuthLayout({ children, className, showFooter = true }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-4 py-4 lg:px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold">All-in-One Rental Place</span>
          </Link>

          <nav className="hidden space-x-6 md:flex">
            <Link to="/browse" className="text-sm font-medium transition-colors hover:text-blue-600">
              Browse Homes
            </Link>
            <Link to="/how-it-works" className="text-sm font-medium transition-colors hover:text-blue-600">
              How It Works
            </Link>
            <Link to="/about" className="text-sm font-medium transition-colors hover:text-blue-600">
              About Us
            </Link>
            <Link to="/contact" className="text-sm font-medium transition-colors hover:text-blue-600">
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium transition-colors hover:text-blue-600">
              Log In
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

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
