"use client"

import { Header } from "@/components/layout/Header"
import { TagManagementSection } from "@/components/preferences/TagManagementSection"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateEmail } from "@/features/auth/api/authApi"
import {
  userApi,
  type CreatePaymentDetailPayload,
  type PaymentDetail,
  type UpdatePasswordPayload,
  type UpdateUserInfoPayload,
} from "@/features/auth/api/userApi"
import { updateUserProfile } from "@/features/auth/slices/authSlice"
import KycVerificationForm from "@/features/tenant/components/KYCVerificationForm"
import { useToast } from "@/hooks/useToast"
import type { AppDispatch } from "@/store"
import type { CreateLocation, Location, UpdateLocation } from "@/types/location.types"
import type { User, UserKYC } from "@/types/user.types"
import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Info,
  Loader2,
  MapPin,
  Upload,
  XCircle,
} from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

const TenantProfilePage = () => {
  const { toast } = useToast()
  const dispatch = useDispatch<AppDispatch>()
  const user: User = useSelector((state: any) => state.auth.user)
  const [userKyc, setUserKyc] = useState<UserKYC | null>(null)
  const [isKycLoading, setIsKycLoading] = useState(false)

  // Personal info form state
  const [personalInfo, setPersonalInfo] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
  })

    // Location state
    const [userLocation, setUserLocation] = useState<Location | null>(null)
    const [locationForm, setLocationForm] = useState({
      address: "",
      city: "",
      country: "",
      region: "",
      postal_code: "",
      phone: "",
    })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  })

  // Email form state
  const [emailForm, setEmailForm] = useState({
    email: "",
  })

  // Payment details state
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail | null>(null)
  const [paymentForm, setPaymentForm] = useState({
    bank_name: "",
    account_number: "",
    account_name: "",
  })

  // Loading states
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)
  // Error states
  const [personalInfoErrors, setPersonalInfoErrors] = useState<Record<string, string>>({})
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [emailError, setEmailError] = useState<string | null>(null)
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({})
  const [locationErrors, setLocationErrors] = useState<Record<string, string>>({})
  // Profile picture upload states
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  const [isUploadingProfilePicture, setIsUploadingProfilePicture] = useState(false)
  

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserDataAndKyc = async () => {
      if (!user?.id) return

      setIsLoadingProfile(true)
      setIsKycLoading(true)
      setIsLoadingPayment(true)
      setIsLoadingLocation(true)

      try {
        const userData = await userApi.getCurrentUser()
        setPersonalInfo({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          email: userData.email || "",
          username: userData.username || "",
        })
        // Update Redux store with the latest user data
        dispatch(updateUserProfile(userData))

        const kycData = await userApi.getUserKyc(user.id)
        setUserKyc(kycData)        // Fetch payment details
        const paymentData = await userApi.getUserPaymentDetails(user.id)
        setPaymentDetails(paymentData || null)
        if (paymentData) {
          setPaymentForm({
            bank_name: paymentData.bank_name,
            account_number: paymentData.account_number,
            account_name: paymentData.account_name,
          })
        }

        // Fetch location data
        const locationData = await userApi.getUserLocation()
        setUserLocation(locationData)
        if (locationData) {
          setLocationForm({
            address: locationData.address || "",
            city: locationData.city || "",
            country: locationData.country || "",
            region: locationData.region || "",
            postal_code: locationData.postal_code || "",
            phone: locationData.phone || "",
          })
        }
      } catch (error: any) {
        toast({
          title: "Error fetching profile data",
          description:
            error.response?.data?.message || error.message || "Failed to load your profile or KYC information",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProfile(false)
        setIsKycLoading(false)
        setIsLoadingPayment(false)
        setIsLoadingLocation(false)

      }
    }

    fetchUserDataAndKyc()
  }, [user?.id, toast, dispatch])

  // Handle location form changes
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLocationForm((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (locationErrors[name]) {
      setLocationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validate location form
  const validateLocationForm = () => {
    const errors: Record<string, string> = {}

    if (!locationForm.address.trim()) {
      errors.address = "Address is required"
    }

    if (!locationForm.city.trim()) {
      errors.city = "City is required"
    }

    if (!locationForm.country.trim()) {
      errors.country = "Country is required"
    }

    if (!locationForm.region.trim()) {
      errors.region = "Region/State is required"
    }

    if (!locationForm.postal_code.trim()) {
      errors.postal_code = "Postal code is required"
    }

    if (!locationForm.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(locationForm.phone)) {
      errors.phone = "Please enter a valid phone number"
    }

    setLocationErrors(errors)
    return Object.keys(errors).length === 0
  }

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

  // Handle email form changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setEmailForm({ email: value })
    setEmailError(null)
  }

  // Handle payment form changes
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPaymentForm((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (paymentErrors[name]) {
      setPaymentErrors((prev) => {
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

  // Validate payment form
  const validatePaymentForm = () => {
    const errors: Record<string, string> = {}

    if (!paymentForm.bank_name.trim()) {
      errors.bank_name = "Bank name is required"
    }

    if (!paymentForm.account_number.trim()) {
      errors.account_number = "Account number is required"
    }

    if (!paymentForm.account_name.trim()) {
      errors.account_name = "Account holder name is required"
    }

    setPaymentErrors(errors)
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
        username: personalInfo.username,
      }

      const updatedUser = await userApi.updateUserInfo(user.id, payload)

      // Update Redux store with new user data
      dispatch(updateUserProfile(updatedUser))

      // Update local state to match the updated user data
      setPersonalInfo((prev) => ({
        ...prev,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        username: updatedUser.username,
      }))

      toast({
        title: "Profile updated",
        description: "Your personal information has been updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.response?.data?.message || error.message || "Failed to update your profile information",
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
        description: error.response?.data?.message || error.message || "Failed to update your password",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Handle email form submission
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)
    if (!emailForm.email.trim()) {
      setEmailError("Email is required")
      return
    }
    if (!/\S+@\S+\.\S+/.test(emailForm.email)) {
      setEmailError("Email is invalid")
      return
    }
    setIsUpdatingEmail(true)
    try {
      await updateEmail(user.id, emailForm.email)
      dispatch(updateUserProfile({ ...user, email: emailForm.email }))
      toast({
        title: "Email updated",
        description:
          "Your email has been updated successfully. Please check your inbox to verify the new email address.",
      })
    } catch (error: any) {
      setEmailError(error.response?.data?.message || error.message || "Failed to update email")
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  // Handle payment details submission
  const handleUpdatePaymentDetails = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePaymentForm()) return

    setIsUpdatingPayment(true)
    try {
      const payload: CreatePaymentDetailPayload = {
        bank_name: paymentForm.bank_name,
        account_number: paymentForm.account_number,
        account_name: paymentForm.account_name,
      }

      const updatedPaymentDetails = await userApi.createPaymentDetail(user.id, payload)
      setPaymentDetails(updatedPaymentDetails)

      toast({
        title: "Payment details updated",
        description: "Your payment information has been saved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update your payment details",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPayment(false)
    }
  }

  // Handle payment details deletion
  const handleDeletePaymentDetails = async () => {
    if (!paymentDetails) return

    setIsUpdatingPayment(true)
    try {
      await userApi.deletePaymentDetail(user.id, paymentDetails.id)
      setPaymentDetails(null)
      setPaymentForm({
        bank_name: "",
        account_number: "",
        account_name: "",
      })

      toast({
        title: "Payment details removed",
        description: "Your payment information has been deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete your payment details",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPayment(false)
    }
  }

    // Handle create location
    const handleCreateLocation = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!user) {
        toast({ title: "Error", description: "User not found. Please log in again.", variant: "destructive" })
        return
      }
      if (!validateLocationForm()) return
  
      setIsUpdatingLocation(true)
      try {
        const payload: CreateLocation = {
          address: locationForm.address,
          city: locationForm.city,
          country: locationForm.country,
          region: locationForm.region,
          postal_code: locationForm.postal_code,
          phone: locationForm.phone,
        }
  
        const newLocation = await userApi.createUserLocation(payload)
        setUserLocation(newLocation)
  
        toast({
          title: "Location added",
          description: "Your location details have been saved successfully",
        })
      } catch (error: any) {
        toast({
          title: "Create failed",
          description: error.response.data.message || error.message || "Failed to create your location details",
          variant: "destructive",
        })
      } finally {
        setIsUpdatingLocation(false)
      }
    }
  
    // Handle update location
    const handleUpdateLocation = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!user) {
        toast({ title: "Error", description: "User not found. Please log in again.", variant: "destructive" })
        return
      }
      if (!validateLocationForm()) return
  
      setIsUpdatingLocation(true)
      try {
        const payload: UpdateLocation = {
          address: locationForm.address,
          city: locationForm.city,
          country: locationForm.country,
          region: locationForm.region,
          postal_code: locationForm.postal_code,
          phone: locationForm.phone,
        }
  
        const updatedLocation = await userApi.updateUserLocation(user.id, payload)
        setUserLocation(updatedLocation)
  
        toast({
          title: "Location updated",
          description: "Your location details have been updated successfully",
        })
      } catch (error: any) {
        toast({
          title: "Update failed",
          description: error.response.data.message || error.message || "Failed to update your location details",
          variant: "destructive",
        })
      } finally {
        setIsUpdatingLocation(false)
      }    }

  // Profile picture handling functions
  const handleProfilePictureSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a JPEG, PNG, or WebP image file",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        })
        return      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setProfilePicturePreview(previewUrl)
      
      // Auto-upload the selected image
      handleProfilePictureUpload(file)
    }
  }

  const handleProfilePictureUpload = async (file: File) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not found. Please log in again.",
        variant: "destructive",
      })
      return
    }    
    setIsUploadingProfilePicture(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      const profilePictureResult = await userApi.uploadProfilePicture(user.id, formData)
      
      // Update Redux store with new profile picture URL
      dispatch(updateUserProfile({ ...user, profile_picture: profilePictureResult.image }))
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      })
      
      // Clean up preview URL since we now have the uploaded image
      if (profilePicturePreview) {
        URL.revokeObjectURL(profilePicturePreview)
        setProfilePicturePreview(null)      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.response?.data?.message || error.message || "Failed to upload profile picture",
        variant: "destructive",
      })
      
      // Clean up on error
      if (profilePicturePreview) {
        URL.revokeObjectURL(profilePicturePreview)
        setProfilePicturePreview(null)
      }
    } finally {
      setIsUploadingProfilePicture(false)
    }
  }

  const triggerProfilePictureSelect = () => {
    const fileInput = document.getElementById('tenant-profile-picture-input') as HTMLInputElement
    fileInput?.click()
  }

  if (isLoadingProfile || isKycLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6">                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage 
                      src={profilePicturePreview || user?.profile_picture || ""} 
                      alt={user?.username || "User"} 
                    />
                    <AvatarFallback className="text-2xl">
                      {user?.first_name?.[0]}
                      {user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Hidden file input */}
                  <input
                    id="tenant-profile-picture-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleProfilePictureSelect}
                    className="hidden"
                  />
                  
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute -top-12 -right-12 rounded-full"
                      onClick={triggerProfilePictureSelect}
                      disabled={isUploadingProfilePicture}
                    >
                      {isUploadingProfilePicture ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <h2 className="text-xl font-bold mt-2">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <p className="text-muted-foreground">{user?.email}</p>

                  {user?.kyc_verified ? (
                    <Badge
                      variant="outline"
                      className="mt-2 bg-green-50 text-green-700 border-green-200 flex items-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      KYC Verified
                    </Badge>
                  ) : userKyc && userKyc.id ? (
                    <Badge
                      variant="outline"
                      className="mt-2 bg-yellow-50 text-yellow-700 border-yellow-300 flex items-center"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      KYC Pending Review
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="mt-2 bg-red-50 text-red-700 border-red-200 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" />
                      KYC Unverified
                    </Badge>
                  )}

                  {user?.is_verified ? (
                    <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-blue-200">
                      Email Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="mt-2 bg-gray-50 text-gray-700 border-gray-200">
                      Email Not Verified
                    </Badge>
                  )}

                  {/* Payment Status Badge */}
                  {paymentDetails ? (
                    <Badge
                      variant="outline"
                      className="mt-2 bg-green-50 text-green-700 border-green-200 flex items-center"
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Payment Setup
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="mt-2 bg-orange-50 text-orange-700 border-orange-200 flex items-center"
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Payment Pending
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

                </div>

                {/* <div className="mt-8 pt-6 border-t">
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
                </div> */}
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="md:col-span-2">
            <Tabs defaultValue="personal-info">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
                <TabsTrigger value="kyc-documents">KYC Documents</TabsTrigger>
                <TabsTrigger value="payment-details">Payment Details</TabsTrigger>
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
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isUpdatingProfile} className="ml-auto">
                        {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </CardFooter>
                  </form>
                </Card>

                {/* Email Update Card */}
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Email Address</CardTitle>
                    <CardDescription>Update your email address</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleUpdateEmail}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">New Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={emailForm.email}
                          onChange={handleEmailChange}
                          className={emailError ? "border-red-500" : ""}
                        />
                        {emailError && <p className="text-sm text-red-500">{emailError}</p>}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isUpdatingEmail} className="ml-auto">
                        {isUpdatingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Email
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

                {/* Location Details Card */}
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location Details
                    </CardTitle>
                    <CardDescription>
                      {userLocation ? "Update your location information" : "Add your location information"}
                    </CardDescription>
                  </CardHeader>
                  {isLoadingLocation ? (
                    <CardContent>
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Loading location details...</span>
                      </div>
                    </CardContent>
                  ) : userLocation ? (
                    // Display existing location with update form
                    <form onSubmit={handleUpdateLocation}>
                      <CardContent className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <h3 className="font-medium text-green-800">Location Details Configured</h3>
                          </div>
                          <p className="text-sm text-green-700 mt-1">
                            Your location information is set up. You can update it below.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              name="address"
                              value={locationForm.address}
                              onChange={handleLocationChange}
                              placeholder="Enter your street address"
                              className={locationErrors.address ? "border-red-500" : ""}
                            />
                            {locationErrors.address && (
                              <p className="text-sm text-red-500">{locationErrors.address}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              name="city"
                              value={locationForm.city}
                              onChange={handleLocationChange}
                              placeholder="Enter your city"
                              className={locationErrors.city ? "border-red-500" : ""}
                            />
                            {locationErrors.city && (
                              <p className="text-sm text-red-500">{locationErrors.city}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              name="country"
                              value={locationForm.country}
                              onChange={handleLocationChange}
                              placeholder="Enter your country"
                              className={locationErrors.country ? "border-red-500" : ""}
                            />
                            {locationErrors.country && (
                              <p className="text-sm text-red-500">{locationErrors.country}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="region">Region/State</Label>
                            <Input
                              id="region"
                              name="region"
                              value={locationForm.region}
                              onChange={handleLocationChange}
                              placeholder="Enter your region or state"
                              className={locationErrors.region ? "border-red-500" : ""}
                            />
                            {locationErrors.region && (
                              <p className="text-sm text-red-500">{locationErrors.region}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="postal_code">Postal Code</Label>
                            <Input
                              id="postal_code"
                              name="postal_code"
                              value={locationForm.postal_code}
                              onChange={handleLocationChange}
                              placeholder="Enter your postal code"
                              className={locationErrors.postal_code ? "border-red-500" : ""}
                            />
                            {locationErrors.postal_code && (
                              <p className="text-sm text-red-500">{locationErrors.postal_code}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={locationForm.phone}
                              onChange={handleLocationChange}
                              placeholder="Enter your phone number"
                              className={locationErrors.phone ? "border-red-500" : ""}
                            />
                            {locationErrors.phone && (
                              <p className="text-sm text-red-500">{locationErrors.phone}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button type="submit" disabled={isUpdatingLocation}>
                          {isUpdatingLocation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Update Location
                        </Button>
                      </CardFooter>
                    </form>
                  ) : (
                    // Create new location form
                    <form onSubmit={handleCreateLocation}>
                      <CardContent className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                          <div className="flex items-center">
                            <Info className="h-5 w-5 text-blue-600 mr-2" />
                            <h3 className="font-medium text-blue-800">Add Location Information</h3>
                          </div>
                          <p className="text-sm text-blue-700 mt-1">
                            Add your location details to help tenants find your properties.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Input
                              id="address"
                              name="address"
                              value={locationForm.address}
                              onChange={handleLocationChange}
                              placeholder="Enter your street address"
                              className={locationErrors.address ? "border-red-500" : ""}
                            />
                            {locationErrors.address && (
                              <p className="text-sm text-red-500">{locationErrors.address}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              name="city"
                              value={locationForm.city}
                              onChange={handleLocationChange}
                              placeholder="Enter your city"
                              className={locationErrors.city ? "border-red-500" : ""}
                            />
                            {locationErrors.city && (
                              <p className="text-sm text-red-500">{locationErrors.city}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">Country *</Label>
                            <Input
                              id="country"
                              name="country"
                              value={locationForm.country}
                              onChange={handleLocationChange}
                              placeholder="Enter your country"
                              className={locationErrors.country ? "border-red-500" : ""}
                            />
                            {locationErrors.country && (
                              <p className="text-sm text-red-500">{locationErrors.country}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="region">Region/State *</Label>
                            <Input
                              id="region"
                              name="region"
                              value={locationForm.region}
                              onChange={handleLocationChange}
                              placeholder="Enter your region or state"
                              className={locationErrors.region ? "border-red-500" : ""}
                            />
                            {locationErrors.region && (
                              <p className="text-sm text-red-500">{locationErrors.region}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="postal_code">Postal Code *</Label>
                            <Input
                              id="postal_code"
                              name="postal_code"
                              value={locationForm.postal_code}
                              onChange={handleLocationChange}
                              placeholder="Enter your postal code"
                              className={locationErrors.postal_code ? "border-red-500" : ""}
                            />
                            {locationErrors.postal_code && (
                              <p className="text-sm text-red-500">{locationErrors.postal_code}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={locationForm.phone}
                              onChange={handleLocationChange}
                              placeholder="Enter your phone number"
                              className={locationErrors.phone ? "border-red-500" : ""}
                            />
                            {locationErrors.phone && (
                              <p className="text-sm text-red-500">{locationErrors.phone}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button type="submit" disabled={isUpdatingLocation} className="ml-auto">
                          {isUpdatingLocation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Add Location
                        </Button>
                      </CardFooter>
                    </form>
                  )}
                </Card>
              </TabsContent>

              {/* KYC Documents Tab */}
              <TabsContent value="kyc-documents">
                <Card>
                  <CardHeader>
                    <CardTitle>KYC Documents</CardTitle>
                    <CardDescription>
                      {user?.kyc_verified
                        ? "Your identity has been verified successfully."
                        : "Verify your identity by uploading your ID documents."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user?.kyc_verified ? (
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

              {/* Payment Details Tab */}
              <TabsContent value="payment-details">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Manage your payment information for rental transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingPayment ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Loading payment details...</span>
                      </div>
                    ) : paymentDetails ? (
                      <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <h3 className="font-medium text-green-800">Payment Details Configured</h3>
                          </div>
                          <p className="text-sm text-green-700 mt-1">
                            Your payment information is set up for rental transactions.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Bank Name</Label>
                            <div className="p-3 bg-gray-50 rounded-md">
                              <p className="text-sm font-medium">{paymentDetails.bank_name}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Account Holder Name</Label>
                            <div className="p-3 bg-gray-50 rounded-md">
                              <p className="text-sm font-medium">{paymentDetails.account_name}</p>
                            </div>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Account Number</Label>
                            <div className="p-3 bg-gray-50 rounded-md">
                              <p className="text-sm font-medium">****{paymentDetails.account_number.slice(-4)}</p>
                            </div>
                          </div>
                        </div>

                        {/* <div className="flex justify-end">
                          <Button
                            variant="outline"
                            onClick={handleDeletePaymentDetails}
                            disabled={isUpdatingPayment}
                            className="text-red-600 hover:text-red-700"
                          >
                            {isUpdatingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Remove Payment Details
                          </Button>
                        </div> */}
                      </div>
                    ) : (
                      <form onSubmit={handleUpdatePaymentDetails} className="space-y-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                          <div className="flex items-center">
                            <Info className="h-5 w-5 text-amber-600 mr-2" />
                            <h3 className="font-medium text-amber-800">Payment Setup Optional</h3>
                          </div>
                          <p className="text-sm text-amber-700 mt-1">
                            Add your bank details for easier payment processing during rentals.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="bank_name">Bank Name</Label>
                            <Input
                              id="bank_name"
                              name="bank_name"
                              value={paymentForm.bank_name}
                              onChange={handlePaymentChange}
                              placeholder="e.g., Commercial Bank of Ethiopia"
                              className={paymentErrors.bank_name ? "border-red-500" : ""}
                            />
                            {paymentErrors.bank_name && (
                              <p className="text-sm text-red-500">{paymentErrors.bank_name}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="account_name">Account Holder Name</Label>
                            <Input
                              id="account_name"
                              name="account_name"
                              value={paymentForm.account_name}
                              onChange={handlePaymentChange}
                              placeholder="Full name as on bank account"
                              className={paymentErrors.account_name ? "border-red-500" : ""}
                            />
                            {paymentErrors.account_name && (
                              <p className="text-sm text-red-500">{paymentErrors.account_name}</p>
                            )}
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="account_number">Account Number</Label>
                            <Input
                              id="account_number"
                              name="account_number"
                              value={paymentForm.account_number}
                              onChange={handlePaymentChange}
                              placeholder="Enter your bank account number"
                              className={paymentErrors.account_number ? "border-red-500" : ""}
                            />
                            {paymentErrors.account_number && (
                              <p className="text-sm text-red-500">{paymentErrors.account_number}</p>
                            )}
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                          <h4 className="font-medium text-blue-800 mb-2">Supported Banks</h4>
                          <p className="text-sm text-blue-700">
                            Awash Bank, Bank of Abyssinia, CBEBirr, Commercial Bank of Ethiopia, Telebirr
                          </p>
                        </div>

                        <Button type="submit" disabled={isUpdatingPayment} className="w-full">
                          {isUpdatingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Payment Details
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">                  <div>
                    <h3 className="text-lg font-medium mb-4">Interest Tags</h3>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Manage your interests to get personalized rental recommendations.
                      </p>
                      <TagManagementSection />
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive updates about your bookings via email</p>
                        </div>
              {/* <TabsContent value="preferences">
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
                            <p className="text-sm text-muted-foreground">
                              Receive updates about your bookings via email
                            </p>
                          </div> */}
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
