import { useSelector } from "react-redux"
import type { RootState } from "../store"
import { ROLE_PERMISSIONS, UserRole } from "../types/user.types"

export function usePermissions() {
  const { user } = useSelector((state: RootState) => state.auth)

  const hasPermission = (permission: keyof (typeof ROLE_PERMISSIONS)[UserRole]): boolean => {
    if (!user) return false
    return ROLE_PERMISSIONS[user.role][permission] || false
  }

  const isRole = (role: UserRole): boolean => {
    return user?.role === role
  }

  return {
    hasPermission,
    isRole,
    isAdmin: user?.role === UserRole.ADMIN,
    isOwner: user?.role === UserRole.PROPERTY_OWNER,
    isTenant: user?.role === UserRole.TENANT,
    canBookProperties: hasPermission("can_book_properties"),
    canListProperties: hasPermission("can_list_properties"),
    canAccessAdminPanel: hasPermission("can_access_admin_panel"),
    canManageUsers: hasPermission("can_manage_users"),
    canManageCategories: hasPermission("can_manage_categories"),
  }
}
