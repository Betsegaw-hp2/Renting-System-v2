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
  const { is_authenticated, user, is_loading, token } = useSelector((state: RootState) => state.auth)
  const location = useLocation()

  // Show loading if we're currently loading auth operations
  if (is_loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!is_authenticated || !token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // User is authenticated, now check roles and permissions if required
  if (requiredRole && user) {
    if (!user || user.role !== requiredRole) {
      console.log(`Access denied: User role ${user?.role} does not match required role ${requiredRole}`)
      return <Navigate to="/access-denied" state={{ from: location.pathname, requiredRole }} replace />
    }
  }

  if (requiredPermission && user) { // user must exist to check its role for permissions
    const userPermissions = ROLE_PERMISSIONS[user.role]
    if (!userPermissions || !userPermissions[requiredPermission]) {
      return <Navigate to="/access-denied" state={{ from: location.pathname, requiredPermission }} replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
