"use client"

import type React from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import type { RootState } from "../store"
import { UserRole } from "../types/user.types"

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, is_authenticated } = useSelector((state: RootState) => state.auth)

  const getRedirectPath = () => {
    if (!is_authenticated) {
      return "/login"
    }

    switch (user?.role) {
      case UserRole.ADMIN:
        return "/admin/dashboard"
      case UserRole.PROPERTY_OWNER:
        return "/owner/dashboard"
      case UserRole.TENANT:
        return "/tenant/dashboard"
      default:
        return "/"
    }
  }

  const getActionText = () => {
    if (!is_authenticated) {
      return "Log In"
    }
    return "Go to Dashboard"
  }

  const getMessage = () => {
    if (!is_authenticated) {
      return "Please log in to access this page."
    }

    return "You do not have permission to access this page. Please contact an administrator if you believe this is an error."
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>{getMessage()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <p>Different user roles have different permissions in the system:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Tenants:</strong> Can browse and book properties
              </li>
              <li>
                <strong>Owners:</strong> Can list and manage their properties
              </li>
              <li>
                <strong>Administrators:</strong> Can manage users, categories, and system settings
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Note: Owners and administrators must create tenant accounts to book properties.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/")}>
            Go to Home
          </Button>
          <Button onClick={() => navigate(getRedirectPath())}>{getActionText()}</Button>
        </CardFooter>
      </Card>
    </div>
  )
}