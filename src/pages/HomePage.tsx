"use client"

import type { FeaturedListing } from "@/api/publicApi"
import { ListingCard } from "@/components/listings/ListingCard"
import type { RootState } from "@/store"
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  DollarSign,
  HomeIcon,
  PieChart,
  Search,
  TrendingUp,
  Users,
} from "lucide-react"
import type React from "react"
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
import OwnerHomePage from "../features/owner/pages/OwnerHomePage"
import TenantHomePage from "../features/tenant/pages/TenantHomePage"
import type { AdminStats, UserListingStats } from "../types/listing.types"
import { UserRole } from "../types/user.types"

export default function HomePage() {
  const navigate = useNavigate()
  const { user, is_authenticated } = useSelector((state: RootState) => state.auth)
  const permissions = usePermissions()

  // State and logic for admin
  const [recommendedListings, setRecommendedListings] = useState<FeaturedListing[]>([])
  const [trendingListings, setTrendingListings] = useState<FeaturedListing[]>([])
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Redirect unauthenticated users to landing page
    if (!is_authenticated) {
      navigate("/")
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        if (user && user.role === UserRole.ADMIN) {
          // Fetch recommended and trending listings for admins
          const listings = await mockHomeApi.getRecommendedListings(user.id)
          setRecommendedListings(listings)
          const trending = await mockHomeApi.getTrendingListings()
          setTrendingListings(trending)

          // Fetch admin-specific data
          const stats = await mockHomeApi.getAdminStats()
          setAdminStats(stats)
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (permissions.isAdmin) {
      fetchData()
    }
  }, [is_authenticated, user, navigate, permissions.isAdmin])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/browse?query=${encodeURIComponent(searchQuery)}`)
  }

  // Render role-specific home pages
  if (permissions.isTenant) {
    return <TenantHomePage />
  }

  if (permissions.isOwner) {
    return <OwnerHomePage />
  }

  // Admin view
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
        <div className="container mx-auto px-4 mt-6">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Role Restriction Notice</AlertTitle>
            <AlertDescription>
              As an administrator, you cannot book properties. Please create a tenant account if you wish to make
              bookings.
            </AlertDescription>
          </Alert>
        </div>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="recommended" className="text-sm md:text-base">
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Recommended
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="text-sm md:text-base">
                  <PieChart className="h-4 w-4 mr-2" />
                  Dashboard
                </TabsTrigger>
              </TabsList>

              {/* Recommended Listings Tab - For Admins */}
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
                      {recommendedListings.map((listing) => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          showSaveButton={false} // No save for admins
                        />
                      ))}
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
                          <ListingCard
                            key={listing.id}
                            listing={listing}
                            showSaveButton={false} // No save for admins
                          />
                        ))}
                  </div>
                </div>
              </TabsContent>

              {/* Admin Dashboard Tab */}
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
                          <p className="text-3xl font-bold">{adminStats?.total_users.toLocaleString()}</p>
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
                          <p className="text-3xl font-bold">{adminStats?.total_listings.toLocaleString()}</p>
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
                          <p className="text-3xl font-bold">{adminStats?.active_rentals.toLocaleString()}</p>
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
                                $
                                {Math.round(
                                  adminStats?.revenue || 0 / (adminStats?.total_listings || 1),
                                ).toLocaleString()}
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
            </Tabs>
          </div>
        </section>
      </main>
    </div>
  )
}
