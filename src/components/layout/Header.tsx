"use client"

import type React from "react"

import {
  BookOpen,
  Building2,
  Calendar,
  FileText,
  Heart,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  PieChart,
  Search,
  Settings,
  Tag,
  User,
  Users,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { logoutUser } from "../../features/auth/slices/authSlice"
import { NotificationBell } from "../../features/notifications/components/NotificationBell"
import { usePermissions } from "../../hooks/usePermissions"
import type { RootState } from "../../store"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"

interface HeaderProps {
  toggleSidebar?: () => void
  showSidebarToggle?: boolean
  showSearch?: boolean
  onSearchChange?: (value: string) => void
  searchValue?: string
  onSearchSubmit?: (e: React.FormEvent) => void
  variant?: "default" | "transparent" | "minimal"
}

export function Header({
  toggleSidebar,
  showSidebarToggle = false,
  showSearch = false,
  onSearchChange,
  searchValue = "",
  onSearchSubmit,
  variant = "default",
}: HeaderProps) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, is_authenticated } = useSelector((state: RootState) => state.auth)
  const permissions = usePermissions()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false)

  // Handle scroll effect for transparent variant
  useEffect(() => {
    if (variant === "transparent") {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 50)
      }
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    } else {
      setIsScrolled(false)
    }
  }, [variant])

  const handleLogout = () => {
    dispatch(logoutUser() as any)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Determine header background and text colors based on variant and scroll state
  const getHeaderClasses = () => {
    if (variant === "transparent") {
      return isScrolled ? "bg-white border-b border-gray-200 shadow-sm" : "bg-transparent"
    } else if (variant === "minimal") {
      return "bg-white border-b border-gray-200"
    }
    return "bg-white border-b border-gray-200"
  }

  // Determine logo color based on header variant and scroll state
  const getLogoClasses = () => {
    if (variant === "transparent" && !isScrolled) {
      return "text-white"
    }
    return "text-blue-600"
  }

  // Determine link color based on header variant and scroll state
  const getLinkClasses = () => {
    if (variant === "transparent" && !isScrolled) {
      return "text-white hover:text-gray-200"
    }
    return "text-gray-600 hover:text-blue-600"
  }

  // Determine button variant based on header variant and scroll state
  const getButtonVariant = (isOutline = false) => {
    if (variant === "transparent" && !isScrolled) {
      return isOutline ? "outline" : "ghost"
    }
    return isOutline ? "outline" : "default"
  }

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-all duration-300 ${getHeaderClasses()}`}
      data-variant={variant}
      data-scrolled={isScrolled}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showSidebarToggle && (
              <Button
                variant={variant === "transparent" && !isScrolled ? "ghost" : "ghost"}
                size="icon"
                onClick={toggleSidebar}
                className={`md:hidden ${variant === "transparent" && !isScrolled ? "text-white hover:bg-white/10" : ""}`}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            )}
            <Link to="/" className="flex items-center gap-2">
              <span className={`text-xl font-bold ${getLogoClasses()}`}>HomeRent</span>
            </Link>

            {/* Navigation links based on user role */}
            <nav className="hidden md:flex items-center ml-8 space-x-4">
              {is_authenticated ? (
                <>
                  <Link to="/home" className={`text-sm font-medium ${getLinkClasses()} flex items-center gap-1`}>
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>

                  <Link to="/browse" className={`text-sm font-medium ${getLinkClasses()} flex items-center gap-1`}>
                    <Search className="h-4 w-4" />
                    <span>Browse</span>
                  </Link>

                  {/* Admin-specific links */}
                  {permissions.isAdmin && (
                    <>
                      <Link
                        to="/admin/dashboard"
                        className={`text-sm font-medium ${getLinkClasses()} flex items-center gap-1`}
                      >
                        <PieChart className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/admin/users"
                        className={`text-sm font-medium ${getLinkClasses()} flex items-center gap-1`}
                      >
                        <Users className="h-4 w-4" />
                        <span>Users</span>
                      </Link>
                      <Link
                        to="/admin/listings"
                        className={`text-sm font-medium ${getLinkClasses()} flex items-center gap-1`}
                      >
                        <FileText className="h-4 w-4" />
                        <span>Listings</span>
                      </Link>
                      <Link
                        to="/admin/categories"
                        className={`text-sm font-medium ${getLinkClasses()} flex items-center gap-1`}
                      >
                        <Tag className="h-4 w-4" />
                        <span>Categories</span>
                      </Link>
                    </>
                  )}

                  {/* Owner-specific links */}
                  {permissions.isOwner && (
                    <>
                      <Link
                        to="/owner/properties"
                        className={`text-sm font-medium ${getLinkClasses()} flex items-center gap-1`}
                      >
                        <Building2 className="h-4 w-4" />
                        <span>My Properties</span>
                      </Link>
                      <Link
                        to="/owner/bookings"
                        className={`text-sm font-medium ${getLinkClasses()} flex items-center gap-1`}
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Booking Requests</span>
                      </Link>
                      <Link
                        to="/owner/messages"
                        className={`text-sm font-medium ${getLinkClasses()} flex items-center gap-1`}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Messages</span>
                      </Link>
                    </>
                  )}

                  {/* Tenant-specific links */}
                  {permissions.isTenant && (
                    <>
                      <Link
                        to="/tenant/bookings"
                        className={`text-sm font-medium ${getLinkClasses()} flex items-center gap-1`}
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>My Bookings</span>
                      </Link>
                      <Link
                        to="/tenant/saved"
                        className={`text-sm font-medium ${getLinkClasses()} flex items-center gap-1`}
                      >
                        <Heart className="h-4 w-4" />
                        <span>Saved</span>
                      </Link>
                      <Link
                        to="/tenant/messages"
                        className={`text-sm font-medium ${getLinkClasses()} flex items-center gap-1`}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Messages</span>
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link to="/browse" className={`text-sm font-medium ${getLinkClasses()} flex items-center gap-1`}>
                    <Search className="h-4 w-4" />
                    <span>Browse</span>
                  </Link>
                  <Link to="/how-it-works" className={`text-sm font-medium ${getLinkClasses()}`}>
                    How It Works
                  </Link>
                  <Link to="/about" className={`text-sm font-medium ${getLinkClasses()}`}>
                    About Us
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Search bar - desktop */}
            {showSearch && !mobileSearchVisible && (
              <form onSubmit={onSearchSubmit} className="hidden md:flex items-center relative w-64">
                <Input
                  type="text"
                  placeholder="Search listings..."
                  className={`pl-10 ${variant === "transparent" && !isScrolled ? "bg-white/20 border-white/30 text-white placeholder:text-white/70" : ""}`}
                  value={searchValue}
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                />
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${variant === "transparent" && !isScrolled ? "text-white/70" : "text-gray-400"}`}
                />
              </form>
            )}

            {/* Mobile search toggle */}
            {showSearch && !mobileSearchVisible && (
              <Button
                variant="ghost"
                size="icon"
                className={`md:hidden ${variant === "transparent" && !isScrolled ? "text-white hover:bg-white/10" : ""}`}
                onClick={() => setMobileSearchVisible(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Mobile search bar */}
            {showSearch && mobileSearchVisible && (
              <div className="fixed inset-0 bg-white z-50 p-4 md:hidden">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setMobileSearchVisible(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                  <form onSubmit={onSearchSubmit} className="flex-1">
                    <Input
                      type="text"
                      placeholder="Search listings..."
                      className="w-full"
                      value={searchValue}
                      onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                      autoFocus
                    />
                  </form>
                </div>
              </div>
            )}

            {is_authenticated && (
              <div className={variant === "transparent" && !isScrolled ? "text-white" : ""}>
                <NotificationBell />
              </div>
            )}

            {is_authenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full ${variant === "transparent" && !isScrolled ? "hover:bg-white/10" : ""}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.profile_picture || "/placeholder.svg"}
                        alt={`${user.first_name} ${user.last_name}`}
                      />
                      <AvatarFallback>{getInitials(`${user.first_name} ${user.last_name}`)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      to={
                        permissions.isAdmin
                          ? "/admin/profile"
                          : permissions.isOwner
                            ? "/owner/profile"
                            : "/tenant/profile"
                      }
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  {permissions.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {/* Allow owners and admins to switch to tenant account if they have one */}
                  {(permissions.isOwner || permissions.isAdmin) && (
                    <DropdownMenuItem asChild>
                      <Link to="/switch-to-tenant" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Switch to Tenant Account</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {/* Allow tenants to create an owner account */}
                  {permissions.isTenant && (
                    <DropdownMenuItem asChild>
                      <Link to="/become-owner" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>Become a Property Owner</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant={getButtonVariant(true)}
                  asChild
                  className={
                    variant === "transparent" && !isScrolled ? "border-white text-white hover:bg-white/10" : ""
                  }
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className={variant === "transparent" && !isScrolled ? "bg-white text-blue-600 hover:bg-white/90" : ""}
                >
                  <Link to="/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}