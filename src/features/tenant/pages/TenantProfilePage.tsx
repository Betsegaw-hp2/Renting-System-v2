"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { BookMarked, Calendar, CreditCard, Download, Home, Settings, Shield, Star, Upload, User, X } from "lucide-react"
import { Header } from "../../../components/layout/Header"
import { Footer } from "../../../components/layout/Footer"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Badge } from "../../../components/ui/badge"
import {  type FeaturedListing, type Booking } from "../../../api/publicApi"
import { UserRole } from "../../../types/user.types"
import { useToast } from "../../../hooks/useToast"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Label } from "../../../components/ui/label"
import { tenantApi } from "../api/tenantApi"

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string
  profilePicture?: string
  role: UserRole
  createdAt: string
  phoneNumber?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  bio?: string
  isVerified: boolean
  tenantRating: number
}

export default function TenantProfilePage() {
  const [activeTab, setActiveTab] = useState("personal")
  const [savedListings, setSavedListings] = useState<FeaturedListing[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  // Mock user profile data - in a real app, this would come from your auth system
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "user-123",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    username: "johndoe",
    profilePicture: "/placeholder.svg?height=200&width=200",
    role: UserRole.TENANT,
    createdAt: "2023-01-15T10:30:00Z",
    phoneNumber: "+1 (555) 123-4567",
    address: "123 Main St, Apt 4B",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    bio: "I'm a software engineer looking for a quiet place to live while I work remotely.",
    isVerified: true,
    tenantRating: 5.0,
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch saved listings
        const savedListingsData = await tenantApi.getSavedListings()
        setSavedListings(savedListingsData)

        // Fetch bookings
        // const bookingsData = await publicApi.getUserBookings()
        // setBookings(bookingsData)
      } catch (err) {
        console.error("Error fetching profile data:", err)
        setError("Failed to load profile data. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [toast])

  const handleRemoveSavedListing = async (listingId: string) => {
    try {
      await tenantApi.removeSavedListing(listingId)
      setSavedListings(savedListings.filter((listing) => listing.id !== listingId))
      toast({
        title: "Success",
        description: "Listing removed from saved items",
      })
    } catch (err) {
      console.error("Error removing saved listing:", err)
      toast({
        title: "Error",
        description: "Failed to remove listing from saved items",
        variant: "destructive",
      })
    }
  }

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send the updated profile to your API
    toast({
      title: "Success",
      description: "Profile updated successfully",
    })
    setIsEditing(false)
  }

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send the password update to your API
    toast({
      title: "Success",
      description: "Password updated successfully",
    })
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM yyyy")
    } catch (e) {
      return "Invalid date"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "booked":
        return "bg-green-100 text-green-800 border-green-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and account settings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Profile Sidebar */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 bg-gray-200">
                      {userProfile.profilePicture ? (
                        <img
                          src={userProfile.profilePicture || "/placeholder.svg"}
                          alt={`${userProfile.firstName} ${userProfile.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <User className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-0 right-0 bg-white rounded-full shadow-md hover:bg-gray-100"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <h2 className="text-xl font-bold mb-1">
                      {userProfile.firstName} {userProfile.lastName}
                    </h2>
                    <p className="text-gray-500 mb-2">{userProfile.email}</p>
                    <div className="flex items-center mb-4">
                      {userProfile.isVerified && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                        >
                          <Shield className="h-3 w-3" /> KYC Verified
                        </Badge>
                      )}
                    </div>
                    <div className="w-full space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Member Since</span>
                        <span className="text-sm font-medium">{formatDate(userProfile.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Location</span>
                        <span className="text-sm font-medium">
                          {userProfile.city}, {userProfile.state}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Tenant Rating</span>
                        <div className="flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < userProfile.tenantRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="ml-1 text-sm font-medium">{userProfile.tenantRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full mt-6 space-y-2">
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/tenant/home">
                          <Home className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/tenant/bookings">
                          <Calendar className="w-4 h-4 mr-2" />
                          My Bookings
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/tenant/saved">
                          <BookMarked className="w-4 h-4 mr-2" />
                          Saved Listings
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Account Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Download My Data
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      <X className="w-4 h-4 mr-2" />
                      Deactivate Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 grid grid-cols-3">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="kyc">KYC Documents</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                {/* Personal Info Tab */}
                <TabsContent value="personal">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Personal Information</CardTitle>
                        <p className="text-sm text-gray-500">Update your personal details</p>
                      </div>
                      {!isEditing && (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleProfileUpdate}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={userProfile.firstName}
                              onChange={(e) => setUserProfile({ ...userProfile, firstName: e.target.value })}
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={userProfile.lastName}
                              onChange={(e) => setUserProfile({ ...userProfile, lastName: e.target.value })}
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={userProfile.email}
                              onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                              id="phoneNumber"
                              value={userProfile.phoneNumber || ""}
                              onChange={(e) => setUserProfile({ ...userProfile, phoneNumber: e.target.value })}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              value={userProfile.address || ""}
                              onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={userProfile.city || ""}
                              onChange={(e) => setUserProfile({ ...userProfile, city: e.target.value })}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="state">State</Label>
                              <Input
                                id="state"
                                value={userProfile.state || ""}
                                onChange={(e) => setUserProfile({ ...userProfile, state: e.target.value })}
                                disabled={!isEditing}
                              />
                            </div>
                            <div>
                              <Label htmlFor="zipCode">Zip Code</Label>
                              <Input
                                id="zipCode"
                                value={userProfile.zipCode || ""}
                                onChange={(e) => setUserProfile({ ...userProfile, zipCode: e.target.value })}
                                disabled={!isEditing}
                              />
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={userProfile.bio || ""}
                              onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                              disabled={!isEditing}
                              rows={4}
                            />
                          </div>
                        </div>
                        {isEditing && (
                          <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                          </div>
                        )}
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Password & Security</CardTitle>
                      <p className="text-sm text-gray-500">Update your password and security settings</p>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePasswordUpdate}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input id="currentPassword" type="password" />
                          </div>
                          <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" type="password" />
                          </div>
                          <div>
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input id="confirmPassword" type="password" />
                          </div>
                        </div>
                        <div className="flex justify-end mt-6">
                          <Button type="submit">Update Password</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* KYC Documents Tab */}
                <TabsContent value="kyc">
                  <Card>
                    <CardHeader>
                      <CardTitle>KYC Documents</CardTitle>
                      <p className="text-sm text-gray-500">Manage your verification documents</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <Shield className="h-5 w-5 text-green-600 mr-2" />
                            <div>
                              <h3 className="font-medium text-green-800">Verification Complete</h3>
                              <p className="text-sm text-green-700">Your account is fully verified</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            Verified
                          </Badge>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Submitted Documents</h3>
                          <div className="space-y-3">
                            <div className="border rounded-lg p-3 flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="bg-blue-100 p-2 rounded-md mr-3">
                                  <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium">ID Verification</h4>
                                  <p className="text-sm text-gray-500">Passport or Driver's License</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                Approved
                              </Badge>
                            </div>
                            <div className="border rounded-lg p-3 flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="bg-blue-100 p-2 rounded-md mr-3">
                                  <Home className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium">Proof of Address</h4>
                                  <p className="text-sm text-gray-500">Utility bill or bank statement</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                Approved
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences">
                  <Card>
                    <CardHeader>
                      <CardTitle>Preferences</CardTitle>
                      <p className="text-sm text-gray-500">Manage your account preferences and settings</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-medium mb-3">Notification Settings</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="emailNotifications" className="flex items-center gap-2 cursor-pointer">
                                <span>Email Notifications</span>
                              </Label>
                              <input type="checkbox" id="emailNotifications" className="toggle" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="smsNotifications" className="flex items-center gap-2 cursor-pointer">
                                <span>SMS Notifications</span>
                              </Label>
                              <input type="checkbox" id="smsNotifications" className="toggle" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="marketingEmails" className="flex items-center gap-2 cursor-pointer">
                                <span>Marketing Emails</span>
                              </Label>
                              <input type="checkbox" id="marketingEmails" className="toggle" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-3">Payment Preferences</h3>
                          <div className="space-y-4">
                            <div className="border rounded-lg p-3 flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="bg-gray-100 p-2 rounded-md mr-3">
                                  <CreditCard className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium">Credit Card</h4>
                                  <p className="text-sm text-gray-500">**** **** **** 4567</p>
                                </div>
                              </div>
                              <Badge>Default</Badge>
                            </div>
                            <Button variant="outline" className="w-full">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Add Payment Method
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-3">Language & Region</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="language">Language</Label>
                              <select id="language" className="w-full p-2 border rounded-md">
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor="currency">Currency</Label>
                              <select id="currency" className="w-full p-2 border rounded-md">
                                <option value="usd">USD ($)</option>
                                <option value="eur">EUR (€)</option>
                                <option value="gbp">GBP (£)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
