"use client"

import type React from "react"

import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  DollarSign,
  Heart,
  HomeIcon,
  PieChart,
  Search,
  Star,
  TrendingUp,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { mockHomeApi } from "../api/mockHomeApi"
import { Header } from "../components/layout/Header"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Skeleton } from "../components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { usePermissions } from "../hooks/usePermissions"
import type { RootState } from "../store"
import type { AdminStats, Booking, ListingWithCategory, TrendingListing, UserListingStats } from "../types/listing.types"
import { UserRole } from "../types/user.types"

export default function HomePage() {
  const navigate = useNavigate()
  const { user, is_authenticated } = useSelector((state: RootState) => state.auth)
  const permissions = usePermissions()
  const [recommendedListings, setRecommendedListings] = useState<ListingWithCategory[]>([])
  const [trendingListings, setTrendingListings] = useState<TrendingListing[]>([])
  const [userListings, setUserListings] = useState<ListingWithCategory[]>([])
  const [rentalHistory, setRentalHistory] = useState<Booking[]>([])
  const [userStats, setUserStats] = useState<UserListingStats | null>(null)
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Redirect unauthenticated users to landing page
    if (!is_authenticated) {
      navigate("/")
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch recommended listings for all users
        if (user) {
          const listings = await mockHomeApi.getRecommendedListings(user.id)
          setRecommendedListings(listings)

          // Fetch trending listings for all users
          const trending = await mockHomeApi.getTrendingListings()
          setTrendingListings(trending)

          // Fetch role-specific data
          if (user.role === UserRole.PROPERTY_OWNER) {
            const ownedListings = await mockHomeApi.getUserListings(user.id)
            setUserListings(ownedListings)

            const stats = await mockHomeApi.getUserListingStats(user.id)
            setUserStats(stats)
          } else if (user.role === UserRole.TENANT) {
            const history = await mockHomeApi.getUserRentalHistory(user.id)
            setRentalHistory(history)
          } else if (user.role === UserRole.ADMIN) {
            const stats = await mockHomeApi.getAdminStats()
            setAdminStats(stats)
          }
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [is_authenticated, user, navigate])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/browse?query=${encodeURIComponent(searchQuery)}`)
  }

  // Determine default tab based on user role
  const getDefaultTab = () => {
    if (permissions.isOwner) return "myProperties"
    if (permissions.isAdmin) return "dashboard"
    if (permissions.isTenant) return "bookings"
    return "recommended"
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSidebarToggle={false} />

      <main className="flex-1 bg-gray-50">
        {/* Hero Section with Search */}
        <section className="bg-blue-600 py-12 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-4">Welcome back, {user?.first_name || "User"}!</h1>
              <p className="text-blue-100 mb-8">
                {permissions.isOwner
                  ? "Manage your properties and view booking requests"
                  : permissions.isAdmin
                    ? "Monitor platform activity and manage users"
                    : "Find your perfect rental and manage your bookings"}
              </p>

              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for rentals..."
                    className="pl-10 bg-white text-gray-900 h-12 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" className="bg-white text-blue-600 hover:bg-blue-50 h-12">
                  Search
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Role-specific alerts */}
        {(permissions.isAdmin || permissions.isOwner) && (
          <div className="container mx-auto px-4 mt-6">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Role Restriction Notice</AlertTitle>
              <AlertDescription>
                {permissions.isAdmin
                  ? "As an administrator, you cannot book properties. Please create a tenant account if you wish to make bookings."
                  : "As a property owner, you cannot book properties with this account. Please create a tenant account if you wish to make bookings."}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue={getDefaultTab()} className="w-full">
              <TabsList className="mb-8">
                {/* Common tabs for all users */}
                <TabsTrigger value="recommended" className="text-sm md:text-base">
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Recommended
                </TabsTrigger>

                {/* Owner-specific tabs */}
                {permissions.isOwner && (
                  <>
                    <TabsTrigger value="myProperties" className="text-sm md:text-base">
                      <Building2 className="h-4 w-4 mr-2" />
                      My Properties
                    </TabsTrigger>
                    <TabsTrigger value="bookingRequests" className="text-sm md:text-base">
                      <Calendar className="h-4 w-4 mr-2" />
                      Booking Requests
                    </TabsTrigger>
                  </>
                )}

                {/* Tenant-specific tabs */}
                {permissions.isTenant && (
                  <>
                    <TabsTrigger value="bookings" className="text-sm md:text-base">
                      <BookOpen className="h-4 w-4 mr-2" />
                      My Bookings
                    </TabsTrigger>
                    <TabsTrigger value="saved" className="text-sm md:text-base">
                      <Heart className="h-4 w-4 mr-2" />
                      Saved Listings
                    </TabsTrigger>
                  </>
                )}

                {/* Admin-specific tabs */}
                {permissions.isAdmin && (
                  <TabsTrigger value="dashboard" className="text-sm md:text-base">
                    <PieChart className="h-4 w-4 mr-2" />
                    Dashboard
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Recommended Listings Tab - For All Users */}
              <TabsContent value="recommended" className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>

                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[...Array(4)].map((_, index) => (
                        <Card key={index} className="overflow-hidden">
                          <Skeleton className="h-48 w-full" />
                          <CardContent className="p-4">
                            <Skeleton className="h-4 w-1/4 mb-2" />
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2 mb-4" />
                            <Skeleton className="h-4 w-full mb-4" />
                            <div className="flex justify-between">
                              <Skeleton className="h-6 w-1/4" />
                              <Skeleton className="h-8 w-1/4" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* {recommendedListings.map((listing) => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          showFavorite={permissions.isTenant}
                        />
                      ))} */}
                    </div>
                  )}

                  <div className="mt-8 text-center">
                    <Button variant="outline" onClick={() => navigate("/browse")}>
                      View All Listings
                    </Button>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading
                      ? [...Array(4)].map((_, index) => (
                          <Card key={index} className="overflow-hidden">
                            <Skeleton className="h-48 w-full" />
                            <CardContent className="p-4">
                              <Skeleton className="h-4 w-1/4 mb-2" />
                              <Skeleton className="h-6 w-3/4 mb-2" />
                              <Skeleton className="h-4 w-1/2 mb-4" />
                              <div className="flex justify-between">
                                <Skeleton className="h-6 w-1/4" />
                                <Skeleton className="h-8 w-1/4" />
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      : trendingListings.map((listing) => (
                          // <ListingCard
                          //   key={listing.id}
                          //   listing={listing}
                          //   showFavorite={permissions.isTenant}
                          // />
                          <></>
                        ))}
                  </div>
                </div>
              </TabsContent>

              {/* My Properties Tab - For Owners */}
              {permissions.isOwner && (
                <TabsContent value="myProperties" className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">My Properties</h2>
                      <Button onClick={() => navigate("/owner/listings/new")}>Add New Property</Button>
                    </div>

                    {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(2)].map((_, index) => (
                          <Card key={index} className="overflow-hidden">
                            <Skeleton className="h-48 w-full" />
                            <CardContent className="p-4">
                              <Skeleton className="h-6 w-3/4 mb-2" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : userListings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userListings.map((listing) => (
                          <Card key={listing.id} className="overflow-hidden">
                            <div className="aspect-video relative">
                              <img
                                src={listing.media[0]?.media_url || "/placeholder.svg?height=200&width=300"}
                                alt={listing.title}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-bold text-lg mb-1">{listing.title}</h3>
                              <p className="text-gray-600 mb-4">{listing.description}</p>
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-lg">${listing.price}/month</span>
                                <Button
                                  variant="outline"
                                  onClick={() => navigate(`/owner/listings/${listing.id}/edit`)}
                                >
                                  Manage
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-xl font-semibold mb-2">No Properties Listed</h3>
                          <p className="text-gray-500 mb-6">
                            You haven't listed any properties yet. Create your first listing to start receiving booking
                            requests.
                          </p>
                          <Button onClick={() => navigate("/owner/listings/new")}>Add Your First Property</Button>
                        </CardContent>
                      </Card>
                    )}

                    {userListings.length > 0 && (
                      <div className="mt-8">
                        <Card>
                          <CardHeader>
                            <CardTitle>Performance Overview</CardTitle>
                            <CardDescription>How your properties are performing</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {isLoading ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[...Array(3)].map((_, index) => (
                                  <Skeleton key={index} className="h-24 w-full" />
                                ))}
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Search className="h-5 w-5 text-blue-600" />
                                    <span className="font-medium">Total Views</span>
                                  </div>
                                  <p className="text-2xl font-bold">{userStats?.total_views}</p>
                                  <p className="text-sm text-green-600">
                                    +{userStats?.recent_views} in the last 30 days
                                  </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <span className="font-medium">Booking Requests</span>
                                  </div>
                                  <p className="text-2xl font-bold">{userStats?.total_bookings}</p>
                                  <p className="text-sm text-green-600">
                                    +{userStats?.recent_bookings} in the last 30 days
                                  </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Star className="h-5 w-5 text-blue-600" />
                                    <span className="font-medium">Average Rating</span>
                                  </div>
                                  <p className="text-2xl font-bold">{userStats?.average_rating}/5</p>
                                  <p className="text-sm text-gray-500">Based on {userStats?.total_reviews} reviews</p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" className="w-full" onClick={() => navigate("/owner/analytics")}>
                              View Detailed Analytics
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              {/* Booking Requests Tab - For Owners */}
              {permissions.isOwner && (
                <TabsContent value="bookingRequests" className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Booking Requests</h2>

                    {isLoading ? (
                      <Card>
                        <CardContent className="p-0">
                          <div className="divide-y">
                            {[...Array(3)].map((_, index) => (
                              <div key={index} className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <Skeleton className="h-6 w-1/3" />
                                  <Skeleton className="h-6 w-1/4" />
                                </div>
                                <div className="flex justify-between items-center">
                                  <Skeleton className="h-4 w-1/4" />
                                  <Skeleton className="h-4 w-1/5" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="p-0">
                          <div className="divide-y">
                            {rentalHistory.length > 0 ? (
                              rentalHistory.map((booking) => (
                                <div key={booking.id} className="p-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold">Booking Request #{booking.id.substring(0, 8)}</h3>
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        booking.status === "completed"
                                          ? "bg-green-100 text-green-800"
                                          : booking.status === "booked"
                                            ? "bg-blue-100 text-blue-800"
                                            : booking.status === "pending"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>
                                      {new Date(booking.start_date).toLocaleDateString()} to{" "}
                                      {new Date(booking.end_date).toLocaleDateString()}
                                    </span>
                                    <span className="font-medium text-gray-900">${booking.total_amount}</span>
                                  </div>
                                  <div className="mt-4 flex gap-2 justify-end">
                                    <Button variant="outline" size="sm">
                                      Message
                                    </Button>
                                    {booking.status === "pending" && (
                                      <>
                                        <Button variant="destructive" size="sm">
                                          Decline
                                        </Button>
                                        <Button size="sm">Accept</Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-12 text-center">
                                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No Booking Requests</h3>
                                <p className="text-gray-500">
                                  You don't have any booking requests yet. They will appear here when tenants book your
                                  properties.
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        {rentalHistory.length > 0 && (
                          <CardFooter className="bg-gray-50">
                            <Button variant="outline" className="w-full" onClick={() => navigate("/owner/bookings")}>
                              View All Booking Requests
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    )}
                  </div>
                </TabsContent>
              )}

              {/* My Bookings Tab - For Tenants */}
              {permissions.isTenant && (
                <TabsContent value="bookings" className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
                    {isLoading ? (
                      <Card>
                        <CardContent className="p-0">
                          <div className="divide-y">
                            {[...Array(3)].map((_, index) => (
                              <div key={index} className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <Skeleton className="h-6 w-1/3" />
                                  <Skeleton className="h-6 w-1/4" />
                                </div>
                                <div className="flex justify-between items-center">
                                  <Skeleton className="h-4 w-1/4" />
                                  <Skeleton className="h-4 w-1/5" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ) : rentalHistory.length > 0 ? (
                      <Card>
                        <CardContent className="p-0">
                          <div className="divide-y">
                            {rentalHistory.map((booking) => (
                              <div key={booking.id} className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <h3 className="font-bold">Booking #{booking.id.substring(0, 8)}</h3>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      booking.status === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : booking.status === "booked"
                                        ? "bg-blue-100 text-blue-800"
                                        : booking.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                  <span>
                                    {new Date(booking.start_date).toLocaleDateString()} to {new Date(booking.end_date).toLocaleDateString()}
                                  </span>
                                  <span className="font-medium text-gray-900">${booking.total_amount}</span>
                                </div>
                                <div className="mt-4 flex gap-2 justify-end">
                                  <Button variant="outline" size="sm">
                                    Message Owner
                                  </Button>
                                  {booking.status === "pending" && (
                                    <Button variant="destructive" size="sm">
                                      Cancel
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/tenant/bookings/${booking.id}`)}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                        {rentalHistory.length > 0 && (
                          <CardFooter className="bg-gray-50">
                            <Button variant="outline" className="w-full" onClick={() => navigate("/tenant/bookings")}>
                              View All Bookings
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
                          <p className="text-gray-500 mb-6">
                            You haven't made any bookings yet. Browse listings to find your perfect rental.
                          </p>
                          <Button onClick={() => navigate("/browse")}>Browse Listings</Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              )}

              {/* Booking Requests Tab - For Owners */}
              {permissions.isOwner && (
                <TabsContent value="bookingRequests" className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Booking Requests</h2>

                    {isLoading ? (
                      <Card>
                        <CardContent className="p-0">
                          <div className="divide-y">
                            {[...Array(3)].map((_, index) => (
                              <div key={index} className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <Skeleton className="h-6 w-1/3" />
                                  <Skeleton className="h-6 w-1/4" />
                                </div>
                                <div className="flex justify-between items-center">
                                  <Skeleton className="h-4 w-1/4" />
                                  <Skeleton className="h-4 w-1/5" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="p-0">
                          <div className="divide-y">
                            {rentalHistory.length > 0 ? (
                              rentalHistory.map((booking) => (
                                <div key={booking.id} className="p-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold">Booking Request #{booking.id.substring(0, 8)}</h3>
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        booking.status === "completed"
                                          ? "bg-green-100 text-green-800"
                                          : booking.status === "booked"
                                            ? "bg-blue-100 text-blue-800"
                                            : booking.status === "pending"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>
                                      {new Date(booking.start_date).toLocaleDateString()} to{" "}
                                      {new Date(booking.end_date).toLocaleDateString()}
                                    </span>
                                    <span className="font-medium text-gray-900">${booking.total_amount}</span>
                                  </div>
                                  <div className="mt-4 flex gap-2 justify-end">
                                    <Button variant="outline" size="sm">
                                      Message
                                    </Button>
                                    {booking.status === "pending" && (
                                      <>
                                        <Button variant="destructive" size="sm">
                                          Decline
                                        </Button>
                                        <Button size="sm">Accept</Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-12 text-center">
                                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No Booking Requests</h3>
                                <p className="text-gray-500">
                                  You don't have any booking requests yet. They will appear here when tenants book your
                                  properties.
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        {rentalHistory.length > 0 && (
                          <CardFooter className="bg-gray-50">
                            <Button variant="outline" className="w-full" onClick={() => navigate("/owner/bookings")}>
                              View All Booking Requests
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    )}
                  </div>
                </TabsContent>
              )}

              {/* My Bookings Tab - For Tenants */}
              {permissions.isTenant && (
                <TabsContent value="bookings" className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">My Bookings</h2>

                    {isLoading ? (
                      <Card>
                        <CardContent className="p-0">
                          <div className="divide-y">
                            {[...Array(3)].map((_, index) => (
                              <div key={index} className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <Skeleton className="h-6 w-1/3" />
                                  <Skeleton className="h-6 w-1/4" />
                                </div>
                                <div className="flex justify-between items-center">
                                  <Skeleton className="h-4 w-1/4" />
                                  <Skeleton className="h-4 w-1/5" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="p-0">
                          <div className="divide-y">
                            {rentalHistory.length > 0 ? (
                              rentalHistory.map((booking) => (
                                <div key={booking.id} className="p-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold">Booking #{booking.id.substring(0, 8)}</h3>
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        booking.status === "completed"
                                          ? "bg-green-100 text-green-800"
                                          : booking.status === "booked"
                                            ? "bg-blue-100 text-blue-800"
                                            : booking.status === "pending"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>
                                      {new Date(booking.start_date).toLocaleDateString()} to{" "}
                                      {new Date(booking.end_date).toLocaleDateString()}
                                    </span>
                                    <span className="font-medium text-gray-900">${booking.total_amount}</span>
                                  </div>
                                  <div className="mt-4 flex gap-2 justify-end">
                                    <Button variant="outline" size="sm">
                                      Message Owner
                                    </Button>
                                    {booking.status === "pending" && (
                                      <Button variant="destructive" size="sm">
                                        Cancel
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => navigate(`/tenant/bookings/${booking.id}`)}
                                    >
                                      View Details
                                    </Button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-12 text-center">
                                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
                                <p className="text-gray-500 mb-6">
                                  You haven't made any bookings yet. Browse listings to find your perfect rental.
                                </p>
                                <Button onClick={() => navigate("/browse")}>Browse Listings</Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        {rentalHistory.length > 0 && (
                          <CardFooter className="bg-gray-50">
                            <Button variant="outline" className="w-full" onClick={() => navigate("/tenant/bookings")}>
                              View All Bookings
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    )}
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-6">Upcoming Payments</h2>
                    <Card>
                      <CardContent className="p-4">
                        {isLoading ? (
                          <div className="space-y-4">
                            {[...Array(2)].map((_, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <div>
                                  <Skeleton className="h-5 w-40 mb-1" />
                                  <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-8 w-24" />
                              </div>
                            ))}
                          </div>
                        ) : rentalHistory.some((booking) => booking.status === "booked") ? (
                          <div className="space-y-4">
                            {rentalHistory
                              .filter((booking) => booking.status === "booked")
                              .slice(0, 2)
                              .map((booking) => (
                                <div key={booking.id} className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">
                                      Due on {new Date(booking.start_date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-500">Booking #{booking.id.substring(0, 8)}</p>
                                  </div>
                                  <Button size="sm">${booking.total_amount}</Button>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-40 text-gray-500">
                            No upcoming payments due
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              )}

              {/* Saved Listings Tab - For Tenants */}
              {permissions.isTenant && (
                <TabsContent value="saved" className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Saved Listings</h2>

                    {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, index) => (
                          <Card key={index} className="overflow-hidden">
                            <Skeleton className="h-48 w-full" />
                            <CardContent className="p-4">
                              <Skeleton className="h-4 w-1/4 mb-2" />
                              <Skeleton className="h-6 w-3/4 mb-2" />
                              <Skeleton className="h-4 w-1/2 mb-4" />
                              <Skeleton className="h-4 w-full mb-4" />
                              <div className="flex justify-between">
                                <Skeleton className="h-6 w-1/4" />
                                <Skeleton className="h-8 w-1/4" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : recommendedListings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendedListings.slice(0, 3).map((listing) => (
                          // <ListingCard
                          //   key={listing.id}
                          //   listing={listing}
                          //   showFavorite={true}
                          //   isFavorite={true}
                          // />
                          <h1>listing</h1>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-xl font-semibold mb-2">No Saved Listings</h3>
                          <p className="text-gray-500 mb-6">
                            You haven't saved any listings yet. Browse and save listings you're interested in.
                          </p>
                          <Button onClick={() => navigate("/browse")}>Browse Listings</Button>
                        </CardContent>
                      </Card>
                    )}

                    {recommendedListings.length > 0 && (
                      <div className="mt-6 text-center">
                        <Button variant="outline" onClick={() => navigate("/tenant/saved")}>
                          View All Saved Listings
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              {/* Admin Dashboard Tab */}
              {permissions.isAdmin && (
                <TabsContent value="dashboard" className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Platform Overview</h2>

                    {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                          <Card key={index}>
                            <CardContent className="p-6">
                              <Skeleton className="h-5 w-1/2 mb-4" />
                              <Skeleton className="h-8 w-1/3 mb-2" />
                              <Skeleton className="h-4 w-1/4" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-2 text-gray-500">
                              <Users className="h-5 w-5" />
                              <span>Total Users</span>
                            </div>
                            <p className="text-3xl font-bold mb-1">{adminStats?.total_users.toLocaleString()}</p>
                            <p className="text-sm text-green-600">
                              <TrendingUp className="h-4 w-4 inline mr-1" />
                              {adminStats?.new_users_this_month} new this month
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-2 text-gray-500">
                              <Building2 className="h-5 w-5" />
                              <span>Total Listings</span>
                            </div>
                            <p className="text-3xl font-bold mb-1">{adminStats?.total_listings.toLocaleString()}</p>
                            <p className="text-sm text-green-600">
                              <TrendingUp className="h-4 w-4 inline mr-1" />
                              {adminStats?.new_listings_this_month} new this month
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-2 text-gray-500">
                              <Calendar className="h-5 w-5" />
                              <span>Active Rentals</span>
                            </div>
                            <p className="text-3xl font-bold mb-1">{adminStats?.active_rentals.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Across all categories</p>
                          </CardContent>
                        </Card>

                        <Card className="md:col-span-3">
                          <CardHeader>
                            <CardTitle>Revenue Overview</CardTitle>
                            <CardDescription>Platform revenue from fees and subscriptions</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="flex items-center gap-2 mb-2 text-gray-500">
                                  <DollarSign className="h-5 w-5" />
                                  <span>Total Revenue</span>
                                </div>
                                <p className="text-3xl font-bold">${adminStats?.revenue.toLocaleString()}</p>
                              </div>

                              <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="flex items-center gap-2 mb-2 text-gray-500">
                                  <BarChart3 className="h-5 w-5" />
                                  <span>Average Per Listing</span>
                                </div>
                                <p className="text-3xl font-bold">
                                  ${Math.round(adminStats?.revenue || 0 / (adminStats?.total_listings || 0)).toLocaleString()}
                                </p>
                              </div>

                              <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="flex items-center gap-2 mb-2 text-gray-500">
                                  <TrendingUp className="h-5 w-5" />
                                  <span>Growth Rate</span>
                                </div>
                                <p className="text-3xl font-bold">+12.4%</p>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="bg-gray-50">
                            <Button variant="outline" className="w-full" onClick={() => navigate("/admin/analytics")}>
                              View Detailed Analytics
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent User Registrations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {isLoading ? (
                            [...Array(5)].map((_, index) => (
                              <div key={index} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1">
                                  <Skeleton className="h-5 w-1/3 mb-1" />
                                  <Skeleton className="h-4 w-1/4" />
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">User data will appear here</div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => navigate("/admin/users")}>
                          View All Users
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Listings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {isLoading ? (
                            [...Array(5)].map((_, index) => (
                              <div key={index} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded" />
                                <div className="flex-1">
                                  <Skeleton className="h-5 w-2/3 mb-1" />
                                  <Skeleton className="h-4 w-1/2" />
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">Listing data will appear here</div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => navigate("/admin/listings")}>
                          View All Listings
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </section>
      </main>
  </div>
  )
}
