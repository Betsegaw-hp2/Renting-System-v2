"use client"

import { Loader2, Lock, Save, Settings, User } from "lucide-react"
import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Switch } from "../../../components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { useToast } from "../../../hooks/useToast"
import type { RootState } from "../../../store"
import { adminApi } from "../api/adminApi"
import { AdminLayout } from "../components/layout/AdminLayout"

export default function SettingsPage() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Profile state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    maintenanceMode: false,
    listingApprovalRequired: true,
    maxImagesPerListing: 10,
    maxActiveListingsPerUser: 20,
  })

  // Load profile data and system settings
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Try to load admin profile
      try {
        const profile = await adminApi.getAdminProfile()
        setProfileData({
          firstName: profile.firstName || user?.first_name || "",
          lastName: profile.lastName || user?.last_name || "",
          email: profile.email || user?.email || "",
          phone: profile.phone || "",
        })
        setAvatarPreview(profile.avatar || user?.profile_picture || null)
      } catch (error) {
        console.error("Error loading profile data:", error)
        // Fallback to user data from Redux store
        if (user) {
          setProfileData({
            firstName: user.first_name || "",
            lastName: user.last_name || "",
            email: user.email || "",
            phone: "",
          })
          setAvatarPreview(user.profile_picture || null)
        }
      }

      // Try to load system settings
      try {
        const settings = await adminApi.getSystemSettings()
        setSystemSettings({
          enableEmailNotifications: settings.enableEmailNotifications ?? true,
          enableSmsNotifications: settings.enableSmsNotifications ?? false,
          maintenanceMode: settings.maintenanceMode ?? false,
          listingApprovalRequired: settings.listingApprovalRequired ?? true,
          maxImagesPerListing: settings.maxImagesPerListing ?? 10,
          maxActiveListingsPerUser: settings.maxActiveListingsPerUser ?? 20,
        })
      } catch (error) {
        console.error("Error loading system settings:", error)
        // Keep default settings
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSettingChange = (name: string, value: boolean | number) => {
    setSystemSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const saveProfile = async () => {
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      await adminApi.updateAdminProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        avatar: avatarFile || undefined,
      })

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      })

      // Reset avatar file after successful update
      setAvatarFile(null)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const savePassword = async () => {
    // Validate password
    if (!passwordData.currentPassword) {
      toast({
        title: "Validation Error",
        description: "Current password is required.",
        variant: "destructive",
      })
      return
    }

    if (!passwordData.newPassword) {
      toast({
        title: "Validation Error",
        description: "New password is required.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      await adminApi.updateAdminPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast({
        title: "Success",
        description: "Password updated successfully.",
      })
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: "Failed to update password. Please check your current password and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const saveSystemSettings = async () => {
    setIsSaving(true)
    try {
      await adminApi.updateSystemSettings(systemSettings)

      toast({
        title: "Success",
        description: "System settings updated successfully.",
      })
    } catch (error) {
      console.error("Error updating system settings:", error)
      toast({
        title: "Error",
        description: "Failed to update system settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account profile information and email address.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-6 sm:space-y-0">
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={avatarPreview || "/placeholder.svg"} alt="Profile" />
                          <AvatarFallback>
                            {profileData.firstName && profileData.lastName
                              ? `${profileData.firstName[0]}${profileData.lastName[0]}`
                              : "AD"}
                          </AvatarFallback>
                        </Avatar>
                        <Label
                          htmlFor="avatar"
                          className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <User className="h-4 w-4" />
                          <span className="sr-only">Upload avatar</span>
                        </Label>
                        <Input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </div>
                      <div className="space-y-4 sm:flex-1">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              value={profileData.firstName}
                              onChange={handleProfileChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              value={profileData.lastName}
                              onChange={handleProfileChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={saveProfile} disabled={isLoading || isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Update your password to keep your account secure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={savePassword} disabled={isLoading || isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide settings for the platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable email notifications for users and administrators.
                          </p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={systemSettings.enableEmailNotifications}
                          onCheckedChange={(checked) => handleSettingChange("enableEmailNotifications", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sms-notifications">SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable SMS notifications for users and administrators.
                          </p>
                        </div>
                        <Switch
                          id="sms-notifications"
                          checked={systemSettings.enableSmsNotifications}
                          onCheckedChange={(checked) => handleSettingChange("enableSmsNotifications", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="maintenance-mode" className="text-red-500 font-medium">
                            Maintenance Mode
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Enable maintenance mode to prevent users from accessing the platform.
                          </p>
                        </div>
                        <Switch
                          id="maintenance-mode"
                          checked={systemSettings.maintenanceMode}
                          onCheckedChange={(checked) => handleSettingChange("maintenanceMode", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="listing-approval">Listing Approval Required</Label>
                          <p className="text-sm text-muted-foreground">
                            Require admin approval before new listings are published.
                          </p>
                        </div>
                        <Switch
                          id="listing-approval"
                          checked={systemSettings.listingApprovalRequired}
                          onCheckedChange={(checked) => handleSettingChange("listingApprovalRequired", checked)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-images">Maximum Images Per Listing</Label>
                        <Input
                          id="max-images"
                          type="number"
                          min="1"
                          max="50"
                          value={systemSettings.maxImagesPerListing}
                          onChange={(e) =>
                            handleSettingChange("maxImagesPerListing", Number.parseInt(e.target.value) || 10)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-listings">Maximum Active Listings Per User</Label>
                        <Input
                          id="max-listings"
                          type="number"
                          min="1"
                          max="100"
                          value={systemSettings.maxActiveListingsPerUser}
                          onChange={(e) =>
                            handleSettingChange("maxActiveListingsPerUser", Number.parseInt(e.target.value) || 20)
                          }
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={saveSystemSettings} disabled={isLoading || isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Settings className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}