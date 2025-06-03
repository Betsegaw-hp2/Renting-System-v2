"use client"

import type { FeaturedListing } from "@/api/publicApi"
import { KYCVerificationDialog } from "@/components/kyc/KYCVerificationDialog"
import { Header } from "@/components/layout/Header"
import { ListingCard } from "@/components/listings/ListingCard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/contexts/UserContext"
import ChatDialog from "@/features/messages/components/ChatDialog"
import { AddPropertyDialog } from "@/features/owner/components/AddPropertyDialog"
import { tenantApi } from "@/features/tenant/api/tenantApi"
import { useToast } from "@/hooks/useToast"
import type { RootState } from "@/store"
import { type Booking, ListingStatus, type UserListingStats } from "@/types/listing.types"
import {
  AlertTriangle,
  Building2,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  Grid3X3,
  HomeIcon,
  List,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  Star,
  Trash,
  TrendingUp,
  Users
} from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { ownerApi } from "../api/ownerApi"


type ViewMode = "grid" | "list"

// Utility functions for localStorage
const getStoredViewMode = (): ViewMode => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("owner-properties-view")
    return (stored as ViewMode) || "grid"
  }
  return "grid"
}

const setStoredViewMode = (mode: ViewMode) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("owner-properties-view", mode)
  }
}

export default function OwnerHomePage() {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const { toast } = useToast()
  const { currentUser } = useUser();
  

  // State for owner-specific data
  const [recommendedListings, setRecommendedListings] = useState<FeaturedListing[]>([])
  const [trendingListings, setTrendingListings] = useState<FeaturedListing[]>([])
   const [bookings, setBookings] = useState<Booking[]>([])
  const [ownerListings, setOwnerListings] = useState<FeaturedListing[]>([])
  const [userStats] = useState<UserListingStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>(getStoredViewMode())
  const [listingToDelete, setListingToDelete] = useState<string | null>(null)
  const [showKYCDialog, setShowKYCDialog] = useState(false)

    // Chat dialog state for tenant
    const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
    const [selectedChatPartner, setSelectedChatPartner] = useState<{
      id: string;
      name: string;
      avatar?: string;
      listingId: string;
    } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        if (user) {
          // Fetch recommended and trending listings
          const listings = await tenantApi.getRecommendedListings(user.id)
          setRecommendedListings(listings)
          const trending = await tenantApi.getTrendingListings()
          setTrendingListings(trending)

          // Fetch owner-specific 
          // use listing id for getListingBookings          // Fetch all owner properties first to get their IDs
          const ownedListings = await ownerApi.getOwnerProperties(user.id)
          setOwnerListings(ownedListings)

          // Fetch bookings for each property owned by the user
          const allBookings = await ownerApi.getOwnerBookings(user.id);
          setBookings(allBookings);

          // const stats = await mockHomeApi.getUserListingStats(user.id)
          // setUserStats(stats)
        }
      } catch (error) {
        console.error("Error fetching owner homepage data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])
  const handleBookingUpdate = async (bookingId: string, status: "confirmed" | "cancelled") => {
    try {
      // Find the booking to get the listing ID
      const booking = bookings.find(b => b.id === bookingId)
      if (!booking) throw new Error("Booking not found")

      // Call backend to update booking status
      if (status === "confirmed") {
        await ownerApi.confirmBookingStatus(bookingId, booking.listing_id)
      } else {
        await ownerApi.cancelBooking(bookingId)
      }

      // Update local bookings state
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === bookingId 
            ? { ...b, status: status }
            : b
        )
      )

      toast({
        title: "Success",
        description: `Booking ${status === "confirmed" ? "accepted" : "declined"} successfully`,
      })
    } catch (error) {
      console.error("Error updating booking:", error)
      toast({
        title: "Error",
        description: `Failed to ${status === "confirmed" ? "accept" : "decline"} booking`,
        variant: "destructive",
      })    }
  }

  // KYC verification handler
  const handleAddProperty = () => {
    if (!user?.kyc_verified) {
      setShowKYCDialog(true)
      return false
    }
    return true
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/browse?query=${encodeURIComponent(searchQuery)}`)
  }

  // Refresh owner properties after adding a new property
  const handlePropertyAdded = async () => {
    if (user) {
      try {
        const ownedListings = await ownerApi.getOwnerProperties(user.id)
        setOwnerListings(ownedListings)
        // const stats = await mockHomeApi.getUserListingStats(user.id) // Assuming mockHomeApi might be replaced or updated
        // setUserStats(stats)
        toast({ title: "Success", description: "Property list refreshed." })
      } catch (error) {
        console.error("Error refreshing listings:", error)
        toast({ variant: "destructive", title: "Error", description: "Failed to refresh properties." })
      }
    }
  }

  const handleDeleteListing = async () => {
    if (!listingToDelete) return

    setIsLoading(true)
    try {
      await ownerApi.deleteListing(listingToDelete)
      setOwnerListings((prev) => prev.filter((l) => l.id !== listingToDelete))
      toast({
        title: "Listing Deleted",
        description: "The listing has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting listing:", error)
      toast({
        variant: "destructive",
        title: "Error Deleting Listing",
        description: "Failed to delete the listing. Please try again.",
      })
    } finally {
      setIsLoading(false)
      setListingToDelete(null) // Reset state and close dialog
    }
  }

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    setStoredViewMode(mode)
  }

    // Add this handler for opening chat dialog
  const openChatDialog = (partnerId: string, partnerName: string, partnerAvatar: string | undefined, listingId: string) => {
    setSelectedChatPartner({ id: partnerId, name: partnerName, avatar: partnerAvatar, listingId });
    setIsChatDialogOpen(true);
  };
  const closeChatDialog = () => {
    setIsChatDialogOpen(false);
    setSelectedChatPartner(null);
  };


  // Render properties in grid format
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {(ownerListings ?? []).map((listing) => (
        <AlertDialog key={`grid-alert-${listing.id}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-[300px] w-full overflow-hidden">
              <img
                src={listing.media[0]?.media_url || "/placeholder.svg?height=200&width=300"}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              <Badge
                className={`absolute top-3 right-3 ${
                  listing.status === "available"
                    ? "bg-green-500 hover:bg-green-600"
                    : listing.status === "booked"
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-500 hover:bg-gray-600"
                }`}
              >
                {listing.status?.charAt(0).toUpperCase() + listing.status?.slice(1)}
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg line-clamp-1">{listing.title}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/listings/${listing.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        onClick={() => setListingToDelete(listing.id)}
                        className="text-red-600 hover:!text-red-600 hover:!bg-red-50 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete Listing
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {listing.city}, {listing.country}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-blue-600">${listing.price}/month</span>
                <Button variant="outline" size="sm" onClick={() => navigate(`/owner/listings/${listing.id}/manage`)}>
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the listing "{listing.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setListingToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteListing}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </div>
  )
  // Render properties in list format
  const renderListView = () => (
    <div className="space-y-4">
      {(ownerListings ?? []).map((listing) => (
        <AlertDialog key={`list-alert-${listing.id}`}>
          <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-0">
              <div className="flex">
                <div className="w-48 h-32 flex-shrink-0">
                  <img
                    src={listing.media[0]?.media_url || "/placeholder.svg?height=128&width=192"}
                    alt={listing.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{listing.title}</h3>
                        <Badge
                          className={`${
                            listing.status === ListingStatus.AVAILABLE
                              ? "bg-green-500 hover:bg-green-600"
                              : listing.status === "booked"
                              ? "bg-blue-500 hover:bg-blue-600"
                              : "bg-gray-500 hover:bg-gray-600"
                          }`}
                        >
                          {listing.status?.charAt(0).toUpperCase() + listing.status?.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {listing.city}, {listing.country}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">{listing.description}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/listings/${listing.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            onClick={() => setListingToDelete(listing.id)}
                            className="text-red-600 hover:!text-red-600 hover:!bg-red-50 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Listing
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Revenue: $0</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>Bookings: 0</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>Views: 0</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/listings/${listing.id}`)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/owner/listings/${listing.id}/manage`)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the listing "{listing.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setListingToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteListing}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSidebarToggle={false} />
      <main className="flex-1 bg-gray-50">
        {/* Hero Section with Carousel */}
        <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
          <Carousel className="h-full" itemsPerSlide={1}>
            <CarouselContent className="h-full">
              {/* Slide 1 - Organized Living */}
              <CarouselItem className="relative h-[90vh] px-0">
                <div className="relative h-full min-h-[60px] overflow-hidden">
                  <img
                    src="/images/hero-1.jpg"
                    alt="Organized living space"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white max-w-4xl mx-auto px-4">
                      <h1 className="text-4xl md:text-6xl font-bold mb-4">List Your Property</h1>
                      <p className="text-xl md:text-2xl text-white/90 mb-8">
                        Turn your space into a profitable rental with our platform
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 2 - Modern Container Home */}
              <CarouselItem className="relative h-[90vh] px-0">
                <div className="relative h-full min-h-[60px] overflow-hidden">
                  <img
                    src="/images/hero-2.jpg"
                    alt="Modern sustainable home"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white max-w-4xl mx-auto px-4">
                      <h1 className="text-4xl md:text-6xl font-bold mb-4">Maximize Your Income</h1>
                      <p className="text-xl md:text-2xl text-white/90 mb-8">
                        Reach thousands of potential tenants and optimize your rental revenue
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 3 - Tropical Living */}
              <CarouselItem className="relative h-[90vh] px-0">
                <div className="relative h-full min-h-[60px] overflow-hidden">
                  <img
                    src="/images/hero-3.jpg"
                    alt="Tropical living space"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white max-w-4xl mx-auto px-4">
                      <h1 className="text-4xl md:text-6xl font-bold mb-4">Professional Management</h1>
                      <p className="text-xl md:text-2xl text-white/90 mb-8">
                        Streamline bookings, manage tenants, and grow your property portfolio
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>

            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30" />
          </Carousel>

          {/* Welcome Message Overlay */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-lg px-6 py-3 border border-white/20">
              <p className="text-white text-sm font-medium">Welcome back, {user?.first_name || "User"}! 👋</p>
            </div>
          </div>
          {/* Search Section */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 mb-8 z-[5]">
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


        {/* Role-specific alert */}
        <div className="container mx-auto px-4 mt-6">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Role Restriction Notice</AlertTitle>
            <AlertDescription>
              As a property owner, you cannot book properties with this account. Please create a tenant account if you
              wish to make bookings.
            </AlertDescription>
          </Alert>
        </div>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="myProperties" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="recommended" className="text-sm md:text-base">
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Recommended
                </TabsTrigger>
                <TabsTrigger value="myProperties" className="text-sm md:text-base">
                  <Building2 className="h-4 w-4 mr-2" />
                  My Properties
                </TabsTrigger>
                <TabsTrigger value="bookingRequests" className="text-sm md:text-base">
                  <Calendar className="h-4 w-4 mr-2" />
                  Booking Requests
                </TabsTrigger>
              </TabsList>

              {/* Recommended Listings Tab */}
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
                      {(recommendedListings ?? []).map((listing) => (
                        <ListingCard key={listing.id} listing={listing} showSaveButton={false} />
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
                      : (trendingListings ?? []).map((listing) => (
                        <ListingCard key={listing.id} listing={listing} showSaveButton={false} />
                      ))}
                  </div>
                </div>
              </TabsContent>

              {/* My Properties Tab */}
              <TabsContent value="myProperties" className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">My Properties</h2>
                    <div className="flex items-center gap-3">
                      {/* View Toggle Buttons */}
                      <div className="flex items-center border rounded-lg p-1 bg-white">
                        <Button
                          variant={viewMode === "grid" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleViewModeChange("grid")}
                          className="h-8 px-3"
                        >
                          <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === "list" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleViewModeChange("list")}
                          className="h-8 px-3"
                        >
                          <List className="h-4 w-4" />
                        </Button>                      </div>
                      {user?.kyc_verified ? (
                        <AddPropertyDialog
                          trigger={
                            <Button>
                              <Plus className="h-4 w-4 mr-2" />
                              Add New Property
                            </Button>
                          }
                          onSuccess={handlePropertyAdded}
                        />
                      ) : (
                        <Button onClick={handleAddProperty}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Property
                        </Button>
                      )}
                    </div>
                  </div>

                  {isLoading ? (
                    <div
                      className={
                        viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"
                      }
                    >
                      {[...Array(viewMode === "grid" ? 6 : 3)].map((_, index) => (
                        <Card key={index} className="overflow-hidden">
                          {viewMode === "grid" ? (
                            <>
                              <Skeleton className="h-48 w-full" />
                              <CardContent className="p-4">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2 mb-4" />
                                <div className="flex justify-between">
                                  <Skeleton className="h-6 w-1/4" />
                                  <Skeleton className="h-8 w-1/4" />
                                </div>
                              </CardContent>
                            </>
                          ) : (
                            <CardContent className="p-0">
                              <div className="flex">
                                <Skeleton className="w-48 h-32" />
                                <div className="flex-1 p-4">
                                  <Skeleton className="h-6 w-3/4 mb-2" />
                                  <Skeleton className="h-4 w-1/2 mb-2" />
                                  <Skeleton className="h-4 w-full mb-4" />
                                  <div className="flex justify-between">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-8 w-1/4" />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : ownerListings?.length > 0 ? (
                    <>{viewMode === "grid" ? renderGridView() : renderListView()}</>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Properties Listed</h3>
                        <p className="text-gray-500 mb-6">
                          You haven't listed any properties yet. Create your first listing to start receiving booking
                          requests.                        </p>
                        {user?.kyc_verified ? (
                          <AddPropertyDialog
                            trigger={<Button>Add Your First Property</Button>}
                            onSuccess={handlePropertyAdded}
                          />
                        ) : (
                          <Button onClick={handleAddProperty}>Add Your First Property</Button>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {ownerListings?.length > 0 && (
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
                                <p className="text-sm text-green-600">+{userStats?.recent_views} in the last 30 days</p>
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
              </TabsContent>              {/* Booking Requests Tab */}
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
                          {bookings?.length > 0 ? (
                            bookings.map((booking, index) => (
                              <div key={booking.id} className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                    <h3 className="font-bold">Booking Request #{booking.id.substring(0, 8)}</h3>
                                  </div>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      booking.status === "confirmed"
                                        ? "bg-green-100 text-green-800"
                                        : booking.status === "cancelled"
                                        ? "bg-red-100 text-red-800"
                                        : booking.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                                  </span>
                                </div>                                <div className="mb-2">
                                  <p className="text-sm text-gray-600">
                                    Booking ID: <span className="font-medium">#{booking.id.substring(0, 8)}</span>
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Renter ID: <span className="font-medium">{booking.renter_id.substring(0, 8)}</span>
                                  </p>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                  <span>
                                    {booking.start_date && booking.end_date
                                      ? `${new Date(booking.start_date).toLocaleDateString()} to ${new Date(booking.end_date).toLocaleDateString()}`
                                      : "Dates not available"}
                                  </span>
                                  <span className="font-medium text-gray-900">${booking.total_amount}</span>
                                </div>
                                <div className="mt-4 flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openChatDialog(
                                      booking.owner_id,
                                      "Owner name", 
                                      "Owner avatar",
                                      booking.listing_id
                                    )}
                                  >
                                    Open Message
                                  </Button>
                                  {booking.status === "pending" && (
                                    <>
                                      <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={() => handleBookingUpdate(booking.id, "cancelled")}
                                      >
                                        Decline
                                      </Button>
                                      <Button 
                                        size="sm"
                                        onClick={() => handleBookingUpdate(booking.id, "confirmed")}
                                      >
                                        Accept
                                      </Button>
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
                      {bookings?.length > 0 && (
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
            </Tabs>
          </div>
        </section>
      </main>
      {/* Render ChatDialog for tenant */}
       {selectedChatPartner && currentUser && (
         <ChatDialog
           isOpen={isChatDialogOpen}
           onClose={closeChatDialog}
           partnerId={selectedChatPartner.id}
           partnerName={selectedChatPartner.name}
           partnerAvatar={selectedChatPartner.avatar}
           listingId={selectedChatPartner.listingId}
         />       )}
      
      {/* KYC Verification Dialog */}
      <KYCVerificationDialog 
        open={showKYCDialog} 
        onOpenChange={setShowKYCDialog} 
      />
    </div>

  )
}
