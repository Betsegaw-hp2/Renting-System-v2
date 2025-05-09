import type React from "react"
import { useSelector } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"
import type { RootState } from "../store"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const location = useLocation()

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // If role is required and user doesn't have it, redirect to home
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute