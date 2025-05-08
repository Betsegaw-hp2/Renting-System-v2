import type React from "react"
import { useSelector } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"
import type { RootState } from "../store"
import type { UserRole } from "../types/user.types"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }


  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to dashboard if user doesn't have the required role
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
