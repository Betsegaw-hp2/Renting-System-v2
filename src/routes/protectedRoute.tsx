import type React from "react"
import { useSelector } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"
import type { RootState } from "../store"
import { type UserRole, ROLE_PERMISSIONS } from "../types/user.types"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requiredPermission?: keyof (typeof ROLE_PERMISSIONS)[UserRole]
}

const ProtectedRoute = ({ children, requiredRole, requiredPermission }: ProtectedRouteProps) => {
  const { is_authenticated, user } = useSelector((state: RootState) => state.auth)
  const location = useLocation()

  // If not authenticated, redirect to login with return URL
  if (!is_authenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // If role is required and user doesn't have it, redirect to home
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/home" replace />
  }

  // If specific permission is required, check if user has it
  if (requiredPermission && user) {
    const hasPermission = ROLE_PERMISSIONS[user.role][requiredPermission]
    if (!hasPermission) {
      // Redirect to home with a message about insufficient permissions
      return <Navigate to="/home" state={{ permissionDenied: true }} replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
