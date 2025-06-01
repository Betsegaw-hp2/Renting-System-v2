"use client"

import type { FeaturedListing } from "@/api/publicApi"
import { Header } from "@/components/layout/Header"
import { TagManagementSection } from "@/components/preferences/TagManagementSection"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { updateEmail } from "@/features/auth/api/authApi"
import {
  userApi,
  type CreatePaymentDetailPayload,
  type PaymentDetail,
  type UpdatePasswordPayload,
  type UpdateUserPayload
} from "@/features/auth/api/userApi"
import { ownerApi } from "@/features/owner/api/ownerApi"
import { useToast } from "@/hooks/useToast"
import type { CreateLocation, Location, UpdateLocation } from "@/types/location.types"
import {
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Home,
  Info,
  Loader2,
  MapPin,
  Star,
  Upload,
  Users,
  XCircle,
} from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { updateUserProfile } from "@/features/auth/slices/authSlice"
import KycVerificationForm from "@/features/tenant/components/KYCVerificationForm"
import type { AppDispatch } from "@/store"
import type { User, UserKYC } from "@/types/user.types"; // Ensure User is imported

const OwnerProfilePage = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: { auth: { user: User | null } }) => state.auth.user) // Typed user state
  // Personal info form state
  const [personalInfo, setPersonalInfo] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    phone_number: "",
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

  // Properties state
  const [properties, setProperties] = useState<FeaturedListing[]>([])
  const [businessStats, setBusinessStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    totalBookings: 0,
    averageRating: 0,
    totalRevenue: 0,
  })

  // KYC state
  const [userKyc, setUserKyc] = useState<UserKYC | null>(null)
  const [isKycLoading, setIsKycLoading] = useState(false)
  // Loading states
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingProperties, setIsLoadingProperties] = useState(false)
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

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return; // This guard ensures user and user.id are valid      setIsLoadingProfile(true)
      setIsKycLoading(true)
      setIsLoadingPayment(true)
      setIsLoadingLocation(true)
      try {
        const userDataResponse = await userApi.getCurrentUser()
        if (!userDataResponse) {
          toast({
            title: "Error",
            description: "Failed to fetch user data",
            variant: "destructive",
          })
          setIsLoadingProfile(false)
          setIsKycLoading(false)
          setIsLoadingPayment(false)
          setIsLoadingLocation(false)
          return
        }
        setPersonalInfo({
          first_name: userDataResponse.first_name || "",
          last_name: userDataResponse.last_name || "",
          email: userDataResponse.email || "",
          username: userDataResponse.username || "",
          phone_number: userDataResponse.phone_number || "",        })
        dispatch(updateUserProfile(userDataResponse))
        
        // user.id is safe here due to the initial guard        
        const kycData = await userApi.getUserKyc(user.id)
        setUserKyc(kycData)

        const paymentData = await userApi.getUserPaymentDetails(user.id)
        setPaymentDetails(paymentData)
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
          title: "Error fetching profile",
          description: error.response.data.message || error.message || "Failed to load your profile information",
          variant: "destructive",
        })      
      } finally {
        setIsLoadingProfile(false)
        setIsKycLoading(false)
        setIsLoadingPayment(false)
        setIsLoadingLocation(false)
      }
    }

    fetchUserData()
  }, [user?.id, dispatch, toast]) // Corrected dependencies

  // Sync form state with Redux user state
  useEffect(() => {
    if (user) {
      setPersonalInfo({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        username: user.username || "",
        phone_number: user.phone_number || "",
      })
      setEmailForm({
        email: user.email || "",
      })
    }
  }, [user])

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
          description: error.response.data.message || error.message || "Failed to load your properties",
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

  // Handle country select change
  const handleCountryChange = (value: string) => {
    setLocationForm((prev) => ({ ...prev, country: value }))

    // Clear error for country field if it exists
    if (locationErrors.country) {
      setLocationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.country
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
    }    if (!personalInfo.username.trim()) {
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

  // Handle personal info form submission
  const handleUpdatePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({ title: "Error", description: "User not found. Please log in again.", variant: "destructive" })
      return
    }
    if (!validatePersonalInfo()) return

    setIsUpdatingProfile(true)
    try {
      const payload: UpdateUserPayload = {
        first_name: personalInfo.first_name,
        last_name: personalInfo.last_name,
        username: personalInfo.username,
        // phone_number is not part of UpdateUserPayload based on its definition
      }

      const updatedUser = await userApi.updateUser(user.id, payload)
      dispatch(updateUserProfile(updatedUser))
      setPersonalInfo((prev) => ({
        ...prev,
        first_name: updatedUser.first_name || prev.first_name,
        last_name: updatedUser.last_name || prev.last_name,
        username: updatedUser.username || prev.username,
        phone_number: updatedUser.phone_number || prev.phone_number,
      }))
      toast({
        title: "Profile updated",
        description: "Your personal information has been updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.response.data.message || error.message || "Failed to update your profile information",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // Handle password form submission
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({ title: "Error", description: "User not found. Please log in again.", variant: "destructive" })
      return
    }
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
        description: error.response.data.message || error.message || "Failed to update your password",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Handle email form submission
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({ title: "Error", description: "User not found. Please log in again.", variant: "destructive" })
      return
    }
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

      // Update Redux store with new email
      dispatch(updateUserProfile({ ...user, email: emailForm.email }))

      toast({
        title: "Email updated",
        description:
          "Your email has been updated successfully. Please check your inbox to verify the new email address.",
      })
    } catch (error: any) {
      setEmailError(error.response.data.message || error.message || "Failed to update email")
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  // Handle payment details submission
  const handleUpdatePaymentDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({ title: "Error", description: "User not found. Please log in again.", variant: "destructive" })
      return
    }
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
        description: error.response.data.message || error.message || "Failed to update your payment details",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPayment(false)
    }
  }

  // Handle payment details deletion
  const handleDeletePaymentDetails = async () => {
    if (!user) {
      toast({ title: "Error", description: "User not found. Please log in again.", variant: "destructive" })
      return
    }
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
        description: error.response.data.message || error.message || "Failed to delete your payment details",
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
    <>
      <Header />
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
                  <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-blue-200">                  Property Owner
                  </Badge>

                  {/* KYC Status Badge */}
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
                      <p className="text-sm text-muted-foreground">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</p>
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
                                star <= businessStats.averageRating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
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
              <TabsList className="grid grid-cols-5 mb-8"> {/* Changed to grid-cols-5 */}
                <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
                <TabsTrigger value="kyc-verification">KYC</TabsTrigger>
                <TabsTrigger value="payment-details">Payment Details</TabsTrigger>
                <TabsTrigger value="properties">My Properties</TabsTrigger>
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
                      </div>                      <div className="space-y-2">
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
                  </form>                </Card>

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

              {/* KYC Verification Tab */}
              <TabsContent value="kyc-verification">
                <Card>
                  <CardHeader>
                    <CardTitle>KYC Verification</CardTitle>
                    <CardDescription>
                      {user?.kyc_verified
                        ? "Your identity has been verified successfully."
                        : "Verify your identity by uploading your ID documents."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isKycLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Loading KYC status...</span>
                      </div>
                    ) : user?.kyc_verified ? (
                      <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
                        <div className="bg-green-100 rounded-full p-2 mr-4">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-green-800">Verification Complete</h3>
                          <p className="text-sm text-green-700">Your identity has been verified successfully.</p>
                        </div>
                      </div>
                    ) : userKyc && userKyc.id && !user?.kyc_verified ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex flex-col items-start">
                        <div className="flex items-center mb-2">
                          <div className="bg-yellow-100 rounded-full p-2 mr-4">
                            <Clock className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-yellow-800">KYC Pending Review</h3>
                            <p className="text-sm text-yellow-700">Your KYC documents are pending review.</p>
                          </div>
                        </div>
                        <p className="text-sm text-yellow-700 mb-4">You can update your submission if needed.</p>
                        <div className="mt-2 w-full">
                          <KycVerificationForm />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full"> {/* Wrapper for consistent styling/layout */}
                        <KycVerificationForm />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Details Tab */}
              <TabsContent value="payment-details">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Manage your payment information for receiving rental payments</CardDescription>
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
                            Your payment information is set up and ready to receive payments.
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

                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            onClick={handleDeletePaymentDetails}
                            disabled={isUpdatingPayment}
                            className="text-red-600 hover:text-red-700"
                          >
                            {isUpdatingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Remove Payment Details
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleUpdatePaymentDetails} className="space-y-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                          <div className="flex items-center">
                            <Info className="h-5 w-5 text-amber-600 mr-2" />
                            <h3 className="font-medium text-amber-800">Payment Setup Required</h3>
                          </div>
                          <p className="text-sm text-amber-700 mt-1">
                            Add your bank details to receive rental payments from tenants.
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
                                        : "bg-red-50 text-red-700 border-red-200"
                                    }`}
                                  >
                                    {property.status === "available" ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {property.tags.map((tag: string) => (
                                    <Badge key={tag} variant="outline" className="text-muted-foreground">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="mt-4 flex gap-2">
                                  <Button
                                    onClick={() => navigate(`/properties/${property.id}/edit`)}
                                    className="flex-1"
                                  >
                                    Edit Property
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      // Handle property deletion
                                    }}
                                    variant="outline"
                                    className="flex-1 text-red-600 hover:text-red-700"
                                  >
                                    Delete Property
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Manage your account preferences and settings.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TagManagementSection />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}

export default OwnerProfilePage
