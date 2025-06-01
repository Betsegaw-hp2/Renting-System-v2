"use client"

import { AuthLayout } from "@/components/layout/AuthLayout"
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
	type UpdatePasswordPayload,
	type UpdateUserInfoPayload,
} from "@/features/auth/api/userApi"
import { updateUserProfile } from "@/features/auth/slices/authSlice"
import { useToast } from "@/hooks/useToast"
import type { AppDispatch } from "@/store"
import type { CreateLocation, Location, UpdateLocation } from "@/types/location.types"
import type { User } from "@/types/user.types"
import {
	Calendar,
	CheckCircle,
	Info,
	Loader2,
	MapPin,
	Upload
} from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

const AdminProfilePage = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const user: User = useSelector((state: any) => state.auth.user)

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


  // Loading states
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)

  // Error states
  const [personalInfoErrors, setPersonalInfoErrors] = useState<Record<string, string>>({})
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [emailError, setEmailError] = useState<string | null>(null)
  const [locationErrors, setLocationErrors] = useState<Record<string, string>>({})
  

  // Fetch user data on component mount
  useEffect(() => {
	const fetchUserDataAndKyc = async () => {
	  if (!user?.id) return

	  setIsLoadingProfile(true)
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
	// <div className="min-h-screen bg-gray-50">
	<AuthLayout>
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

				 

				  {user?.is_verified ? (
					<Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-blue-200">
					  Email Verified
					</Badge>
				  ) : (
					<Badge variant="outline" className="mt-2 bg-gray-50 text-gray-700 border-gray-200">
					  Email Not Verified
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

			</Tabs>
		  </div>
		</div>
	  </div>
	</AuthLayout>
	// </div>
  )
}

export default AdminProfilePage
