"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Settings, Calendar, DollarSign, BarChart3, Star, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/useToast"
import { ownerApi } from "@/features/owner/api/ownerApi"
import { EditPropertyDialog } from "@/features/owner/components/EditPropertyDialog"
import ReviewsSection from "@/features/owner/components/ReviewSection"
import BookingRequestsSection from "@/features/owner/components/BookingRequestSection"
import type { Review } from "@/types/listing.types"
import type { Booking } from "@/types/listing.types"
import type { FeaturedListing } from "@/api/publicApi"
import { Header } from "@/components/layout/Header"

// Mock data for demonstration
// const mockReviews: Review[] = [
//   {
//     id: "1",
//     listing_id: "listing-1",
//     reviewer_id: "user-1",
//     reviewed_id: "owner-1",
//     rating: 5,
//     description:
//       "Amazing property! Clean, well-maintained, and exactly as described. The owner was very responsive and helpful throughout our stay.",
//     created_at: "2024-01-15T10:30:00Z",
//     updated_at: "2024-01-15T10:30:00Z",
//   },
//   {
//     id: "2",
//     listing_id: "listing-1",
//     reviewer_id: "user-2",
//     reviewed_id: "owner-1",
//     rating: 4,
//     description:
//       "Great location and comfortable space. Minor issues with WiFi but overall a pleasant experience. Would recommend!",
//     created_at: "2024-01-10T14:20:00Z",
//     updated_at: "2024-01-10T14:20:00Z",
//   },
//   {
//     id: "3",
//     listing_id: "listing-1",
//     reviewer_id: "user-3",
//     reviewed_id: "owner-1",
//     rating: 5,
//     description:
//       "Perfect for our family vacation. The property had everything we needed and more. Excellent communication from the owner.",
//     created_at: "2024-01-05T09:15:00Z",
//     updated_at: "2024-01-05T09:15:00Z",
//   },
// ]

// const mockBookings: Booking[] = [
//   {
//     id: "booking-1",
//     listing_id: "listing-1",
//     renter_id: "renter-1",
//     owner_id: "owner-1",
//     start_date: "2024-02-15T00:00:00Z",
//     end_date: "2024-02-20T00:00:00Z",
//     total_amount: 750.0,
//     status: "pending",
//     payment_status: "pending",
//     payment_reference: "PAY-001",
//     created_at: "2024-01-20T10:30:00Z",
//     updated_at: "2024-01-20T10:30:00Z",
//     renter: {
//       id: "renter-1",
//       first_name: "John",
//       last_name: "Smith",
//       email: "john.smith@example.com",
//       // profile_picture: null,
//     },
//   },
//   {
//     id: "booking-2",
//     listing_id: "listing-1",
//     renter_id: "renter-2",
//     owner_id: "owner-1",
//     start_date: "2024-03-01T00:00:00Z",
//     end_date: "2024-03-07T00:00:00Z",
//     total_amount: 1050.0,
//     status: "pending",
//     payment_status: "completed",
//     payment_reference: "PAY-002",
//     created_at: "2024-01-18T15:45:00Z",
//     updated_at: "2024-01-18T15:45:00Z",
//     renter: {
//       id: "renter-2",
//       first_name: "Sarah",
//       last_name: "Johnson",
//       email: "sarah.johnson@example.com",
//     },
//   },
//   {
//     id: "booking-3",
//     listing_id: "listing-1",
//     renter_id: "renter-3",
//     owner_id: "owner-1",
//     start_date: "2024-01-10T00:00:00Z",
//     end_date: "2024-01-15T00:00:00Z",
//     total_amount: 750.0,
//     status: "completed",
//     payment_status: "completed",
//     payment_reference: "PAY-003",
//     created_at: "2024-01-05T12:20:00Z",
//     updated_at: "2024-01-16T10:00:00Z",
//     renter: {
//       id: "renter-3",
//       first_name: "Michael",
//       last_name: "Brown",
//       email: "michael.brown@example.com",
//     },
//   },
// ]

const ManageListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [listing, setListing] = useState<FeaturedListing | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    if (id) {
      fetchListingData()
    }
  }, [id])

  const fetchListingData = async () => {
    if (!id) return

    setIsLoading(true)
    try {
      const listingData = await ownerApi.getListingById(id)
      setListing(listingData)

      const bookings = await ownerApi.getListingBookings(id)
      setBookings(bookings)
      
      const reviewlisting = await ownerApi.getListingReviews(id)
      setReviews(reviewlisting)

    } catch (error) {
      console.error("Error fetching listing data:", error)
      toast({
        title: "Error",
        description: "Failed to load listing details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    fetchListingData()
    toast({
      title: "Success",
      description: "Listing updated successfully",
    })
  }

  const handleBookingUpdate = async (bookingId: string, status: "confirmed" | "cancelled") => {
    try {
      
      // Call backend to update booking status
      if (!listing) throw new Error("Listing not loaded");
      if (status === "confirmed") {
        await ownerApi.confirmBookingStatus(bookingId, listing.id);
      } else {
        await ownerApi.cancelBooking(bookingId);
      }
      await fetchListingData();
      toast({
        title: "Success",
        description: `Booking ${status === "confirmed" ? "confirmed" : "cancelled"} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status === "confirmed" ? "confirm" : "cancel"} booking`,
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "booked":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const averageRating =
    reviews?.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  const pendingBookings = bookings.filter((booking) => booking.status === "pending").length
  const totalRevenue = bookings
    .filter((booking) => booking.status === "completed")
    .reduce((sum, booking) => sum + booking.total_amount, 0)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h2>
          <p className="text-gray-600 mb-4">The listing you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/owner/listings")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listings
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
    <Header />
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate("/owner/listings")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Button>
        <div className="flex gap-2">
          <Button onClick={() => setIsEditDialogOpen(true)} size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Listing
          </Button>
        </div>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Manage Property</h1>
        </div>
        <p className="text-gray-600">Manage your property details, bookings, and reviews</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{listing.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {listing.address}, {listing.city}, {listing.region}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(listing.status)}>
                  {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Price per day:</span>
                  <span className="font-medium">{formatCurrency(listing.price)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Available from:</span>
                  <span className="font-medium">{formatDate(listing.availability.startDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Available until:</span>
                  <span className="font-medium">{formatDate(listing.availability.endDate)}</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{listing.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Reviews ({reviews?.length ?? 0})
              </CardTitle>
              {reviews && reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${index < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{averageRating.toFixed(1)} average rating</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ReviewsSection reviews={reviews ?? []} isLoading={false} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{listing.reviewCount}</div>
                  <div className="text-xs text-blue-600 font-medium">Total Views</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{bookings.length}</div>
                  <div className="text-xs text-green-600 font-medium">Total Bookings</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                  <div className="text-2xl font-bold text-amber-600">{pendingBookings}</div>
                  <div className="text-xs text-amber-600 font-medium">Pending Requests</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
                  </div>
                  <div className="text-xs text-purple-600 font-medium">Avg Rating</div>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Total Revenue:</span>
                  <span className="font-bold text-green-600 text-lg">{formatCurrency(totalRevenue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Requests */}
          <BookingRequestsSection
            bookings={bookings}
            isLoading={false}
            onBookingUpdate={(bookingId, action) => handleBookingUpdate(bookingId, action)} />
        </div>
      </div>

      {/* Edit Dialog */}
      {listing && (
        <EditPropertyDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          listing={listing}
          onSuccess={handleEditSuccess} />
      )}
    </div></>
  )
}

export default ManageListingPage
