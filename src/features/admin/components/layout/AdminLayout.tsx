"use client"

import { BarChart3, ChevronLeft, ChevronRight, Flag, FolderTree, Home, Settings, Users } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link, useLocation } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar"
import { cn } from "../../../../lib/utils"
import type { RootState } from "../../../../store"

// Add the import for Header
import { Header } from "../../../../components/layout/Header"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()
  const user = useSelector((state: RootState) => state.auth.user)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)

      // Only auto-close sidebar on initial load for mobile, not on every resize
      if (mobile && !isMobile) {
        setSidebarOpen(false)
      } else if (!mobile && isMobile) {
        setSidebarOpen(true)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [isMobile])

  const navItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: BarChart3,
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: Users,
    },
    {
      path: "/admin/listings",
      label: "Listings",
      icon: Home,
    },
    {
      path: "/admin/categories",
      label: "Categories",
      icon: FolderTree,
    },
    {
      path: "/admin/reports",
      label: "Reports",
      icon: Flag,
    },
    {
      path: "/admin/settings",
      label: "Settings",
      icon: Settings,
    },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const userInitials = user ? getInitials(`${user.first_name} ${user.last_name}`) : "AU"
  const userName = user ? `${user.first_name} ${user.last_name}` : "Admin User"

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-[#111827] transition-all duration-300 ease-in-out lg:relative",
          sidebarOpen ? "w-64" : "w-20",
          !sidebarOpen && isMobile && "-translate-x-full",
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-700 px-4">
          <Link to="/admin/dashboard" className="flex items-center">
            {sidebarOpen ? (
              <span className="text-xl font-bold text-white">Admin Panel</span>
            ) : (
              <span className="text-xl font-bold text-white">AP</span>
            )}
          </Link>
        </div>

        {/* Collapse Button */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-600 shadow-md hover:bg-gray-100 focus:outline-none",
            isMobile && !sidebarOpen && "right-[-40px] z-50",
          )}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    sidebarOpen && "mr-3",
                    location.pathname === item.path ? "text-white" : "text-gray-400 group-hover:text-white",
                  )}
                />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profile_picture || "/placeholder.svg"} alt={userName} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{userName}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={toggleSidebar} aria-hidden="true" />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} showSidebarToggle={true} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  )
}