"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Eye, MapPin, Calendar, DollarSign, BarChart3, ExternalLink, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/useToast"
import { ownerApi } from "@/features/owner/api/ownerApi"
import { AddPropertyDialog } from "@/features/owner/components/AddPropertyDialog"
import ReviewsSection from "@/features/owner/components/ReviewSection"
// import BookingRequestsSection from "@/features/owner/components/BookingRequestSection"
import type { Listing, Review, Booking, ListingWithCategory, MediaTypes } from "@/types/listing.types"

const OwnerListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [listing, setListing] = useState<ListingWithCategory | null>(null)
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
      const [rawListingData, reviewsData] = await Promise.all([
        ownerApi.getListingById(id),
        ownerApi.getListingReview(id),
        // ownerApi.getListingBookings(id),
      ])

      const listingData: ListingWithCategory = {
        ...rawListingData,
        status: rawListingData.status as ListingWithCategory["status"],
        category_id: rawListingData.category.id ?? '', // or proper fallback
        availability_start: rawListingData.availability.startDate?? '',
        availability_end: rawListingData.availability.endDate ?? '',
        views_count: rawListingData.reviewCount ?? 0,
        media: rawListingData.media.map((media) => ({
          id: media.id,
          media_url: media.media_url,
          media_type: media.media_type as MediaTypes,
        })),
      }

      setListing(listingData)
      // setReviews(reviewsData)
      // setBookings(bookingsData)
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
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

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
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate("/owner/listings")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Public
          </Button>
          <Button onClick={() => setIsEditDialogOpen(true)} size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Listing
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Listing Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{listing.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {listing.address}, {listing.city}, {listing.region}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(listing.status)}>
                  {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Gallery */}
              {listing.media && listing.media.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listing.media.slice(0, 4).map((media, index) => (
                    <div key={media.id} className={`relative ${index === 0 ? "md:col-span-2" : ""}`}>
                      <img
                        src={media.media_url || "/placeholder.svg"}
                        alt={`${listing.title} - Image ${index + 1}`}
                        className={`w-full object-cover rounded-lg ${index === 0 ? "h-64" : "h-32"}`}
                      />
                      {index === 3 && listing.media.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <span className="text-white font-medium">+{listing.media.length - 4} more</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-12 w-12 bg-gray-300 rounded-lg mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No images uploaded</p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Price per day:</span>
                    <span className="font-medium">{formatCurrency(listing.price)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Available from:</span>
                    <span className="font-medium">{formatDate(listing.availability_start)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total views:</span>
                    <span className="font-medium">{listing.views_count}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Available until:</span>
                    <span className="font-medium">{formatDate(listing.availability_end)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <ReviewsSection reviews={reviews} isLoading={false} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{listing.views_count}</div>
                  <div className="text-xs text-blue-600">Total Views</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{bookings.length}</div>
                  <div className="text-xs text-green-600">Total Bookings</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{pendingBookings}</div>
                  <div className="text-xs text-yellow-600">Pending Requests</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
                  </div>
                  <div className="text-xs text-purple-600">Avg Rating</div>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Revenue:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(totalRevenue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Requests */}
          {/* <BookingRequestsSection bookings={bookings} isLoading={false} onBookingUpdate={fetchListingData} /> */}
        </div>
      </div>

      {/* Edit Dialog */}
      {/* <AddPropertyDialog
        // open={isEditDialogOpen}
        // onOpenChange={setIsEditDialogOpen}
        // onSuccess={handleEditSuccess}
        // editListing={listing}
      /> */}
    </div>
  )
}

export default OwnerListingDetail
