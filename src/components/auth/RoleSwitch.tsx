"use client"

import type React from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { switchUserRole } from "../../features/auth/slices/authSlice"
import type { RootState } from "../../store"
import { UserRole } from "../../types/user.types"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"

export const RoleSwitch: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  if (!isAuthenticated || !user || !user.role ) {
    return null
  }

  const handleRoleSwitch = (role: UserRole) => {
    dispatch(switchUserRole(role))

    // Navigate to the appropriate homepage based on the new role
    switch (role) {
      case UserRole.ADMIN:
        navigate("/admin/dashboard")
        break
      case UserRole.PROPERTY_OWNER:
        navigate("/owner/dashboard")
        break
      case UserRole.TENANT:
        navigate("/tenant/dashboard")
        break
      default:
        navigate("/")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Switch Role</CardTitle>
        <CardDescription>You have multiple roles. Select the role you want to use.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">
          Current role: <span className="font-medium">{user.role}</span>
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {user.role && 
          <Button
            key={user.role}
            variant={user.role === user.role ? "default" : "outline"}
            onClick={() => handleRoleSwitch(user.role)}
            disabled={user.role === user.role}
          >
            {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
          </Button>
        }
      </CardFooter>
    </Card>
  )
}
