"use client"

import type React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, HomeIcon, Loader2, Search, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { Footer } from "../../../components/layout/Footer"
import { Header } from "../../../components/layout/Header"
import { ListingCard } from "../../../components/listings/ListingCard"
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardFooter } from "../../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { useToast } from "../../../hooks/useToast"
import type { RootState } from "../../../store"
import { tenantApi, type Booking, type FeaturedListing } from "../api/tenantApi"
import { SearchFilters, type SearchFilters as SearchFiltersType } from "../../../components/search/SearchFilters"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from "../../../components/ui/carousel"
import { Input } from "@/components/ui/input"

export default function TenantHomePage() {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const { toast } = useToast()

  const [recommendedListings, setRecommendedListings] = useState<FeaturedListing[]>([])
  const [trendingListings, setTrendingListings] = useState<FeaturedListing[]>([])
  const [savedListings, setSavedListings] = useState<FeaturedListing[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("recommended")
  const [featuredListings, setFeaturedListings] = useState<FeaturedListing[]>([])
  const [filteredListings, setFilteredListings] = useState<FeaturedListing[]>([])



  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch data in parallel for better performance
        const [recommendedData, trendingData, savedData, bookingsData] = await Promise.all([
          // If user is logged in, fetch personalized recommendations
          user ? tenantApi.getRecommendedListings(user.id) : tenantApi.getFeaturedListings(),
          tenantApi.getTrendingListings(),
          tenantApi.getSavedListings(),
          user ? tenantApi.getUserBookings(user.id) : Promise.resolve([]),
        ])

        setRecommendedListings(recommendedData)
        setTrendingListings(trendingData)
        setSavedListings(savedData)
        setBookings(bookingsData)
      } catch (err) {
        console.error("Error fetching home data:", err)
        setError("Failed to load some data. Please try refreshing the page.")
        toast({
          title: "Error",
          description: "There was a problem loading your data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, toast])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/browse?query=${encodeURIComponent(searchQuery)}`)
  }

  const handleSaveToggle = async (listingId: string, isSaved: boolean) => {
    try {
      if (isSaved) {
        // Add to saved listings
        await tenantApi.saveListing(listingId)

        // Find the listing in either recommended or trending listings
        const listing = [...recommendedListings, ...trendingListings].find((l) => l.id === listingId)

        if (listing && savedListings && !savedListings.some((l) => l.id === listingId)) {
          setSavedListings((prev) => [...prev, listing])
        }
      } else {
        // Remove from saved listings
        await tenantApi.removeSavedListing(listingId)
        setSavedListings((prev) => (prev ?? []).filter((l) => l.id !== listingId))

      }
    } catch (error) {
      console.error("Error updating saved listings:", error)
    }
  }

  // Check if a listing is in the saved listings
  const isListingSaved = (listingId: string) => {
    return savedListings?.some((listing) => listing.id === listingId)
  }

  const handleCancelBooking = async (listingId: string, bookingId: string) => {
    try {
      await tenantApi.deleteBooking(listingId, bookingId)
      setBookings((prev) => (prev ?? []).filter((booking) => booking.id !== bookingId))
      toast({
        title: "Success",
        description: "Booking cancelled successfully.",
      })
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section with Carousel */}
        <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
          <Carousel className="h-full" itemsPerSlide={1}>
            <CarouselContent className="h-full">
              <CarouselItem className="relative h-[90vh] px-0">
                <div className="relative h-full min-h-[60px] overflow-hidden">
                  <img
                    src="/images/hero-1.jpg"
                    alt="Minimalist organized living space with rustic wooden shelves"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                      <h1 className="text-4xl md:text-6xl font-bold mb-4">Find Your Perfect Space</h1>
                      <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        Discover beautifully organized and thoughtfully designed rental spaces
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem className="relative h-[80vh] px-0">
                <div className="relative h-full w-full">
                  <img
                    src="/images/hero-2.jpg"
                    alt="Modern container home with sustainable design"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                      <h1 className="text-4xl md:text-6xl font-bold mb-4">Sustainable Living</h1>
                      <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        Experience eco-friendly homes designed for modern living
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem className="relative h-[80vh] px-0">
                <div className="relative h-full w-full">
                  <img
                    src="/images/hero-3.jpg"
                    alt="Tropical themed interior with warm lighting and plants"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                      <h1 className="text-4xl md:text-6xl font-bold mb-4">Tropical Escapes</h1>
                      <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        Unwind in serene spaces that bring nature indoors
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>

            <CarouselPrevious className="left-6 h-12 w-12 bg-white/20 border-white/30 text-white hover:bg-white/30" />
            <CarouselNext className="right-6 h-12 w-12 bg-white/20 border-white/30 text-white hover:bg-white/30" />

            <CarouselDots count={3} className="absolute bottom-6 left-1/2 transform -translate-x-1/2" />
          </Carousel>

          {/* Welcome Message Overlay */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-lg px-6 py-3 border border-white/20">
              <p className="text-white text-sm font-medium">Welcome back, {user?.first_name || "User"}! 👋</p>
            </div>
          </div>

          {/* Search Section */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 mb-8 z-[5]">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for rentals in your area..."
                  className="pl-10 bg-white/90 text-gray-900 h-12 w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 rounded-lg">
                Search
              </Button>
            </form>
          </div>
        </section>

        {/* Search Section */}
        <section className="bg-gray-50 py-8">

        </section>

        {/* Main Content */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-8 bg-gray-100 border">
                <TabsTrigger value="recommended" className="text-sm md:text-base">
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Recommended
                </TabsTrigger>
                <TabsTrigger value="bookings" className="text-sm md:text-base">
                  <BookOpen className="h-4 w-4 mr-2" />
                  My Bookings
                </TabsTrigger>
                <TabsTrigger value="saved" className="text-sm md:text-base">
                  <Star className="h-4 w-4 mr-2" />
                  Saved Listings
                </TabsTrigger>
              </TabsList>

              {/* Recommended Listings Tab */}
              <TabsContent value="recommended" className="space-y-8">
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

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
                  ) : recommendedListings?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {recommendedListings.map((listing) => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          showSaveButton={true}
                          isSaved={isListingSaved(listing.id)}
                          onSaveToggle={handleSaveToggle}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <HomeIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Recommendations Yet</h3>
                        <p className="text-gray-500 mb-6">
                          We'll show personalized recommendations based on your preferences and browsing history.
                        </p>
                        <Button onClick={() => navigate("/browse")}>Browse All Listings</Button>
                      </CardContent>
                    </Card>
                  )}

                  {recommendedListings?.length > 0 && (
                    <div className="mt-8 text-center">
                      <Button variant="outline" onClick={() => navigate("/browse")}>
                        View All Listings
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-6">Trending Now</h2>

                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : trendingListings?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {trendingListings.map((listing) => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          showSaveButton={true}
                          isSaved={isListingSaved(listing.id)}
                          onSaveToggle={handleSaveToggle}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500">No trending listings available at the moment.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* My Bookings Tab */}
              <TabsContent value="bookings" className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">My Bookings</h2>

                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : bookings?.length > 0 ? (
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {bookings.map((booking) => (
                            <div key={booking.id} className="p-4">
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold">Booking #{booking.id.substring(0, 8)}</h3>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${booking.status === "completed"
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
                                <Link to={`/messages/${booking.listing_id}/${booking.owner_id}`}>
                                  <Button variant="outline" size="sm">
                                    Message Owner
                                  </Button>
                                </Link>
                                {booking.status === "pending" && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleCancelBooking(booking.listing_id, booking.id)}
                                  >
                                    Cancel
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/listings/${booking.listing_id}/bookings/${booking.id}`)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="bg-gray-50">
                        <Button variant="outline" className="w-full" onClick={() => navigate("/tenant/bookings")}>
                          View All Bookings
                        </Button>
                      </CardFooter>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
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

              {/* Saved Listings Tab */}
              <TabsContent value="saved" className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Saved Listings</h2>

                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : savedListings?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savedListings.map((listing) => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          showSaveButton={true}
                          isSaved={true}
                          onSaveToggle={handleSaveToggle}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Saved Listings</h3>
                        <p className="text-gray-500 mb-6">
                          You haven't saved any listings yet. Browse and save listings you're interested in.
                        </p>
                        <Button onClick={() => navigate("/browse")}>Browse Listings</Button>
                      </CardContent>
                    </Card>
                  )}

                  {savedListings?.length > 0 && (
                    <div className="mt-6 text-center">
                      <Button variant="outline" onClick={() => navigate("/tenant/saved")}>
                        View All Saved Listings
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
