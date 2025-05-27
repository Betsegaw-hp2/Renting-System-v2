"use client"

import debounce from "lodash/debounce"
import { AtSign, Eye, EyeOff, Lock, Mail } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { UserRole } from "../../../../types/user.types"
import { checkUsername } from "../../api/authApi"
import type { SignupFormData } from "../../types/signup.types"

interface AccountInfoStepProps {
  formData: SignupFormData
  errors: Record<string, string>
  updateFormData: (field: keyof SignupFormData, value: any) => void
}

export function AccountInfoStep({ formData, errors, updateFormData }: AccountInfoStepProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [checkingUsername, setCheckingUsername] = useState(false)

  const debouncedCheck = useCallback(
    debounce(async (username: string) => {
      if (!username || username.length < 3) {
        setUsernameError("")
        return
      }
      try {
        setCheckingUsername(true)
        const result = await checkUsername(username)
        if (result.exists) setUsernameError("Username is already taken")
        else setUsernameError("")
      } catch {
        setUsernameError("Failed to check username")
      } finally {
        setCheckingUsername(false)
      }
    }, 500),
    []
  )

  useEffect(() => {
    debouncedCheck(formData.username)
  }, [formData.username, debouncedCheck])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* First Name & Last Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
          <Input
            id="firstName"
            placeholder="Enter your first name"
            value={formData.first_name}
            onChange={(e) => updateFormData("first_name", e.target.value)}
            className={errors.firstName ? "border-red-500" : ""}
          />
          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Enter your last name"
            value={formData.last_name}
            onChange={(e) => updateFormData("last_name", e.target.value)}
            className={errors.lastName ? "border-red-500" : ""}
          />
          {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
        </div>
      </div>
     
      {/* Username Field with dynamic check */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">Username</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <AtSign className="h-4 w-4" />
          </div>
          <Input
            id="username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={(e) => updateFormData("username", e.target.value)}
            className={`pl-10 ${errors.username || usernameError ? "border-red-500" : ""}`}
          />
        </div>
        {checkingUsername ? (
          <p className="text-sm font-medium text-yellow-500">Checking availability...</p>
        ) : usernameError ? (
          <p className="text-sm font-medium text-red-500">{usernameError}</p>
        ) : errors.username ? (
          <p className="text-sm font-medium text-red-500">{errors.username}</p>
        ) : formData.username.length >= 3 ? (
          <p className="text-sm font-medium text-green-500">Username is available</p>
        ) : null}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
        <div className="relative">
          <Mail className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 h-4 w-4" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={(e) => updateFormData("email", e.target.value)}
            className={errors.email ? "border-red-500" : ""}
          />
        </div>
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      {/* Password & Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
        <div className="relative">
          <Lock className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 h-4 w-4" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => updateFormData("password", e.target.value)}
            className={errors.password ? "border-red-500" : ""}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 h-4 w-4" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => updateFormData("confirmPassword", e.target.value)}
            className={errors.confirmPassword ? "border-red-500" : ""}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
      </div>

      {/* Role Select */}
      <div className="space-y-2">
        <Label htmlFor="role" className="text-sm font-medium">I am a</Label>
        <Select value={formData.role} onValueChange={(value) => updateFormData("role", value as UserRole)}>
          <SelectTrigger id="role" className="w-full">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UserRole.TENANT}>Tenant</SelectItem>
            <SelectItem value={UserRole.PROPERTY_OWNER}>Property Owner</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
      </div>
    </div>
  )
}
