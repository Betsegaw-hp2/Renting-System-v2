import type React from "react"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"
import { ROLE_PERMISSIONS, type UserRole } from "../../types/user.types"

interface RoleBasedAccessControlProps {
  allowedRoles?: UserRole[]
  requiredPermission?: keyof (typeof ROLE_PERMISSIONS)[UserRole]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const RoleBasedAccessControl: React.FC<RoleBasedAccessControlProps> = ({
  allowedRoles,
  requiredPermission,
  children,
  fallback = null,
}) => {
  const { is_authenticated, user } = useSelector((state: RootState) => state.auth)

  if (!is_authenticated || !user) {
    return <>{fallback}</>
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <>{fallback}</>
  }

  // Check permission-based access
  if (requiredPermission && !ROLE_PERMISSIONS[user.role][requiredPermission]) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
