"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/useToast"
import { userApi, type UpdateUserInfoPayload, type UpdatePasswordPayload } from "@/features/auth/api/userApi"
import { ownerApi } from "@/features/owner/api/ownerApi"
import {
  Loader2,
  Upload,
  Calendar,
  MapPin,
  Star,
  Download,
  AlertTriangle,
  Home,
  Building,
  DollarSign,
  Users,
} from "lucide-react"

const OwnerProfilePage = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const user = useSelector((state: any) => state.auth.user)

  // Personal info form state
  const [personalInfo, setPersonalInfo] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    company_name: "",
    business_address: "",
    tax_id: "",
    phone_number: "",
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  })

  // Properties state
  const [properties, setProperties] = useState([])
  const [businessStats, setBusinessStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    totalBookings: 0,
    averageRating: 0,
    totalRevenue: 0,
  })

  // Loading states
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingProperties, setIsLoadingProperties] = useState(false)
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
          company_name: userData.company_name || "",
          business_address: userData.business_address || "",
          tax_id: userData.tax_id || "",
          phone_number: userData.phone_number || "",
        })
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

  // Fetch owner properties
  useEffect(() => {
    const fetchOwnerProperties = async () => {
      if (!user?.id) return

      setIsLoadingProperties(true)
      try {
        const propertiesData = await ownerApi.getOwnerProperties(user.id)
        setProperties(propertiesData)

        // Calculate business stats
        const activeListings = propertiesData.filter((property: any) => property.status === "available").length
        const totalBookings = propertiesData.reduce(
          (acc: number, property: any) => acc + (property.bookings_count || 0),
          0,
        )
        const totalRatings = propertiesData.reduce((acc: number, property: any) => {
          return property.rating ? acc + property.rating : acc
        }, 0)
        const averageRating = propertiesData.length > 0 ? (totalRatings / propertiesData.length).toFixed(1) : 0
        const totalRevenue = propertiesData.reduce(
          (acc: number, property: any) => acc + (property.total_revenue || 0),
          0,
        )

        setBusinessStats({
          totalProperties: propertiesData.length,
          activeListings,
          totalBookings,
          averageRating: Number(averageRating),
          totalRevenue,
        })
      } catch (error: any) {
        toast({
          title: "Error fetching properties",
          description: error.message || "Failed to load your properties",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProperties(false)
      }
    }

    fetchOwnerProperties()
  }, [user?.id, toast])

  // Handle personal info form changes
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    if (!personalInfo.phone_number.trim()) {
      errors.phone_number = "Phone number is required"
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

      // Additional owner-specific fields would be handled by a separate API call
      // This is a simplified example
      await userApi.updateUserInfo(user.id, payload)

      // Update owner-specific information
      await ownerApi.updateOwnerInfo(user.id, {
        company_name: personalInfo.company_name,
        business_address: personalInfo.business_address,
        tax_id: personalInfo.tax_id,
        phone_number: personalInfo.phone_number,
      })

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
                <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-blue-200">
                  Property Owner
                </Badge>
                {personalInfo.company_name && <p className="text-sm font-medium mt-2">{personalInfo.company_name}</p>}
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
                    <p className="text-sm font-medium">Business Location</p>
                    <p className="text-sm text-muted-foreground">{personalInfo.business_address || "Not specified"}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Owner Rating</p>
                    <div className="flex items-center">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= businessStats.averageRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-medium">{businessStats.averageRating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Stats */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-medium mb-4">Business Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Home className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm font-medium">Properties</span>
                    </div>
                    <p className="text-xl font-bold mt-1">{businessStats.totalProperties}</p>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                    <p className="text-xl font-bold mt-1">{businessStats.activeListings}</p>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-purple-500 mr-2" />
                      <span className="text-sm font-medium">Bookings</span>
                    </div>
                    <p className="text-xl font-bold mt-1">{businessStats.totalBookings}</p>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-amber-500 mr-2" />
                      <span className="text-sm font-medium">Revenue</span>
                    </div>
                    <p className="text-xl font-bold mt-1">${businessStats.totalRevenue.toLocaleString()}</p>
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
              <TabsTrigger value="business-info">Business Info</TabsTrigger>
              <TabsTrigger value="properties">My Properties</TabsTrigger>
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
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <Input
                        id="phone_number"
                        name="phone_number"
                        value={personalInfo.phone_number}
                        onChange={handlePersonalInfoChange}
                        className={personalInfoErrors.phone_number ? "border-red-500" : ""}
                      />
                      {personalInfoErrors.phone_number && (
                        <p className="text-sm text-red-500">{personalInfoErrors.phone_number}</p>
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

            {/* Business Info Tab */}
            <TabsContent value="business-info">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Update your business details</CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdatePersonalInfo}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        name="company_name"
                        value={personalInfo.company_name}
                        onChange={handlePersonalInfoChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_address">Business Address</Label>
                      <Textarea
                        id="business_address"
                        name="business_address"
                        value={personalInfo.business_address}
                        onChange={handlePersonalInfoChange}
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tax_id">Tax ID / Business Registration Number</Label>
                      <Input
                        id="tax_id"
                        name="tax_id"
                        value={personalInfo.tax_id}
                        onChange={handlePersonalInfoChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_description">Business Description</Label>
                      <Textarea
                        id="business_description"
                        placeholder="Tell us about your business"
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isUpdatingProfile} className="ml-auto">
                      {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Business Info
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>Update your payment details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input id="bank_name" placeholder="Enter your bank name" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="account_number">Account Number</Label>
                      <Input id="account_number" placeholder="Enter your account number" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="routing_number">Routing Number</Label>
                      <Input id="routing_number" placeholder="Enter your routing number" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_holder">Account Holder Name</Label>
                    <Input id="account_holder" placeholder="Enter the account holder name" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="ml-auto">Save Payment Info</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Properties Tab */}
            <TabsContent value="properties">
              <Card>
                <CardHeader>
                  <CardTitle>My Properties</CardTitle>
                  <CardDescription>Manage your property listings</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingProperties ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading properties...</span>
                    </div>
                  ) : properties.length === 0 ? (
                    <div className="text-center py-8">
                      <Building className="h-12 w-12 mx-auto text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No properties yet</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        You haven't added any properties to your account yet.
                      </p>
                      <Button className="mt-4" onClick={() => navigate("/add-property")}>
                        Add Your First Property
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {properties.map((property: any) => (
                        <div key={property.id} className="border rounded-lg overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/3">
                              <img
                                src={property.thumbnail || "/placeholder.svg?height=200&width=300"}
                                alt={property.title}
                                className="h-48 w-full object-cover"
                              />
                            </div>
                            <div className="p-4 md:w-2/3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-lg">{property.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {property.address}, {property.city}, {property.region}
                                  </p>
                                </div>
                                <Badge
                                  className={`${
                                    property.status === "available"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                  }`}
                                >
                                  {property.status === "available" ? "Available" : "Unavailable"}
                                </Badge>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm">{property.description.substring(0, 100)}...</p>
                              </div>
                              <div className="mt-4 flex justify-between items-center">
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <span className="ml-1 font-medium">${property.price}/night</span>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/properties/${property.id}`)}
                                  >
                                    View Details
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/properties/${property.id}/edit`)}
                                  >
                                    Edit
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Showing {properties.length} of {properties.length} properties
                    </p>
                  </div>
                  <Button onClick={() => navigate("/add-property")}>Add New Property</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default OwnerProfilePage
