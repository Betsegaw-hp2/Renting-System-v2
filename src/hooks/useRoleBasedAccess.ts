import { useSelector } from "react-redux"
import type { RootState } from "../store"
import type { UserRole } from "../types/user.types"

interface RoleBasedAccessResult {
  hasAccess: boolean
  userRole: UserRole | null
  isAuthenticated: boolean
}

/**
 * Hook to check if the current user has access based on their role
 * @param allowedRoles Array of roles that have access
 * @returns Object containing access information
 */
export const useRoleBasedAccess = (allowedRoles: UserRole[]): RoleBasedAccessResult => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  if (!isAuthenticated || !user) {
    return {
      hasAccess: false,
      userRole: null,
      isAuthenticated,
    }
  }

  const hasAccess = allowedRoles.includes(user.role)

  return {
    hasAccess,
    userRole: user.role,
    isAuthenticated,
  }
}
