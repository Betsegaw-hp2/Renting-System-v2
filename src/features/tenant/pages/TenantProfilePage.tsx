"use client"

import { Header } from "@/components/layout/Header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { userApi, type UpdatePasswordPayload, type UpdateUserInfoPayload } from "@/features/auth/api/userApi"
import KycVerificationForm from "@/features/tenant/components/KYCVerificationForm"
import { useToast } from "@/hooks/useToast"
import { AlertTriangle, Calendar, Download, Loader2, MapPin, Star, Upload } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

const TenantProfilePage = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const user = useSelector((state: any) => state.auth.user)

  // Personal info form state
  const [personalInfo, setPersonalInfo] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  })

  // Loading states
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Error states
  const [personalInfoErrors, setPersonalInfoErrors] = useState<Record<string, string>>({})
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return

      setIsLoadingProfile(true)
      try {
        const userData = await userApi.getCurrentUser()
        setPersonalInfo({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          email: userData.email || "",
          username: userData.username || "",
        })
        // log successful fetch
      } catch (error: any) {
        toast({
          title: "Error fetching profile",
          description: error.message || "Failed to load your profile information",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchUserData()
  }, [user?.id, toast])

  // Handle personal info form changes
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPersonalInfo((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (personalInfoErrors[name]) {
      setPersonalInfoErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validate personal info form
  const validatePersonalInfo = () => {
    const errors: Record<string, string> = {}

    if (!personalInfo.first_name.trim()) {
      errors.first_name = "First name is required"
    }

    if (!personalInfo.last_name.trim()) {
      errors.last_name = "Last name is required"
    }

    if (!personalInfo.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
      errors.email = "Email is invalid"
    }

    if (!personalInfo.username.trim()) {
      errors.username = "Username is required"
    }

    setPersonalInfoErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Validate password form
  const validatePassword = () => {
    const errors: Record<string, string> = {}

    if (!passwordForm.password) {
      errors.password = "Password is required"
    } else if (passwordForm.password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (passwordForm.password !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle personal info form submission
  const handleUpdatePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePersonalInfo()) return

    setIsUpdatingProfile(true)
    try {
      const payload: UpdateUserInfoPayload = {
        first_name: personalInfo.first_name,
        last_name: personalInfo.last_name,
        email: personalInfo.email,
        username: personalInfo.username,
      }

      await userApi.updateUserInfo(user.id, payload)
      console.log("Profile updated successfully")
      
      toast({
        title: "Profile updated",
        description: "Your personal information has been updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update your profile information",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // Handle password form submission
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePassword()) return

    setIsUpdatingPassword(true)
    try {
      const payload: UpdatePasswordPayload = {
        password: passwordForm.password,
      }

      await userApi.updatePassword(user.id, payload)

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      })

      // Clear password form
      setPasswordForm({
        password: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update your password",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  return (
     <div className="min-h-screen bg-gray-50">
      <Header/>
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user?.profile_picture || ""} alt={user?.username || "User"} />
                  <AvatarFallback className="text-2xl">
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="relative">
                  <Button variant="outline" size="sm" className="absolute -top-12 -right-12 rounded-full">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="text-xl font-bold mt-2">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-muted-foreground">{user?.email}</p>
                {user?.is_verified && (
                  <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                    KYC Verified
                  </Badge>
                )}
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">{new Date(user?.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.location?.city || "Not specified"}, {user?.location?.country || ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Tenant Rating</p>
                    <div className="flex items-center">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-medium">5.0</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <h3 className="font-medium mb-4">Account Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download My Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Deactivate Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="personal-info">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
              <TabsTrigger value="kyc-documents">KYC Documents</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal-info">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdatePersonalInfo}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          value={personalInfo.first_name}
                          onChange={handlePersonalInfoChange}
                          className={personalInfoErrors.first_name ? "border-red-500" : ""}
                        />
                        {personalInfoErrors.first_name && (
                          <p className="text-sm text-red-500">{personalInfoErrors.first_name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={personalInfo.last_name}
                          onChange={handlePersonalInfoChange}
                          className={personalInfoErrors.last_name ? "border-red-500" : ""}
                        />
                        {personalInfoErrors.last_name && (
                          <p className="text-sm text-red-500">{personalInfoErrors.last_name}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={personalInfo.email}
                        onChange={handlePersonalInfoChange}
                        className={personalInfoErrors.email ? "border-red-500" : ""}
                      />
                      {personalInfoErrors.email && <p className="text-sm text-red-500">{personalInfoErrors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={personalInfo.username}
                        onChange={handlePersonalInfoChange}
                        className={personalInfoErrors.username ? "border-red-500" : ""}
                      />
                      {personalInfoErrors.username && (
                        <p className="text-sm text-red-500">{personalInfoErrors.username}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea id="bio" placeholder="Tell us a little about yourself" className="resize-none" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isUpdatingProfile} className="ml-auto">
                      {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Password & Security</CardTitle>
                  <CardDescription>Update your password and security settings</CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdatePassword}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={passwordForm.password}
                        onChange={handlePasswordChange}
                        className={passwordErrors.password ? "border-red-500" : ""}
                      />
                      {passwordErrors.password && <p className="text-sm text-red-500">{passwordErrors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className={passwordErrors.confirmPassword ? "border-red-500" : ""}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isUpdatingPassword} className="ml-auto">
                      {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Password
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* KYC Documents Tab */}
            <TabsContent value="kyc-documents">
              <Card>
                <CardHeader>
                  <CardTitle>KYC Documents</CardTitle>
                  <CardDescription>
                    {user?.is_verified
                      ? "Your identity has been verified successfully."
                      : "Verify your identity by uploading your ID documents."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user?.is_verified ? (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
                      <div className="bg-green-100 rounded-full p-2 mr-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-green-800">Verification Complete</h3>
                        <p className="text-sm text-green-700">Your identity has been verified successfully.</p>
                      </div>
                    </div>
                  ) : (
                    <KycVerificationForm />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive updates about your bookings via email</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="email-notifications" className="sr-only">
                            Email Notifications
                          </Label>
                          <input type="checkbox" id="email-notifications" className="toggle" defaultChecked />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive updates about your bookings via SMS</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="sms-notifications" className="sr-only">
                            SMS Notifications
                          </Label>
                          <input type="checkbox" id="sms-notifications" className="toggle" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Marketing Communications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive updates about new features and promotions
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="marketing-communications" className="sr-only">
                            Marketing Communications
                          </Label>
                          <input type="checkbox" id="marketing-communications" className="toggle" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-medium mb-4">Language & Region</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <select id="language" className="w-full border rounded-md p-2">
                          <option value="en">English</option>
                          <option value="fr">French</option>
                          <option value="es">Spanish</option>
                          <option value="de">German</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <select id="timezone" className="w-full border rounded-md p-2">
                          <option value="utc">UTC (Coordinated Universal Time)</option>
                          <option value="est">EST (Eastern Standard Time)</option>
                          <option value="cst">CST (Central Standard Time)</option>
                          <option value="pst">PST (Pacific Standard Time)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="ml-auto">Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
    </div>
  )
}

export default TenantProfilePage
