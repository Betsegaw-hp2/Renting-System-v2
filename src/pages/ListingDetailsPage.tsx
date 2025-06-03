"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ReportButton } from "@/features/report/components/ReportButton"
import { reviewsApi } from "@/features/reviews/api/reviewApi"
import { ReviewsList } from "@/features/reviews/components/ReviewsList"
import { tenantApi } from "@/features/tenant/api/tenantApi"
import { usePermissions } from "@/hooks/usePermissions"
import { useToast } from "@/hooks/useToast"
import type { RootState } from "@/store"
import { ListingStatus } from "@/types/listing.types"
import { addDays, differenceInDays, format, formatISO } from "date-fns"
import {
  ArrowLeft,
  CalendarIcon,
  CheckCircle,
  DollarSign,
  Flag,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Star,
  Tag
} from "lucide-react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link, useNavigate, useParams } from "react-router-dom"
import { publicApi, type FeaturedListing } from "../api/publicApi"
import { Footer } from "../components/layout/Footer"
import { Header } from "../components/layout/Header"
import { GoogleMap } from "../components/maps/GoogleMap"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"

export default function ListingDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [listing, setListing] = useState<FeaturedListing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [showIllustration, setShowIllustration] = useState(false)
  const { toast } = useToast()
  const { isTenant } = usePermissions()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0)
  const [reviewsCount, setReviewsCount] = useState<number>(0)
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Add user authentication check
  const user = useSelector((state: RootState) => state.auth.user)
  const isLoggedIn = !!user

  useEffect(() => {
  const fetchListing = async () => {
    if (!id) {
      console.error("No listing ID provided")
      setError("No listing ID provided")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch all listings and find the one with matching ID
      const foundListing = await publicApi.getListingById(id)
      console.log("Fetched found listing:", foundListing)

      if (!foundListing) {
        setError("Listing not found")
        setIsLoading(false)
        return
      }

      // Only fetch reviews if user is authenticated
      let reviewCount = 0
      if (isLoggedIn) {
        try {
          const reviews = await reviewsApi.getListingReviews(id)
          reviewCount = reviews?.length || 0
          setReviewsCount(reviewCount)
        } catch (err) {
          console.error("Error fetching reviews:", err)
          // Don't set error here, just continue without reviews
          reviewCount = 0
          setReviewsCount(0)
        }
      }

      setListing({
        ...foundListing,
        reviewCount: reviewCount
      })

      // Set the selected image to the first media item or placeholder
      if (foundListing.media && foundListing.media?.length > 0) {
        setSelectedImage(foundListing.media[0].media_url)
      } else {
        setSelectedImage("https://picsum.photos/200/300")
      }
    } catch (err) {
      console.error("Error fetching listing:", err)
      setError("Failed to load listing details. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  fetchListing()
}, [id, isLoggedIn])

  // Format dates with null check
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Not specified"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid date"
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e) {
      return "Invalid date"
    }
  }

  // Get location string with null checks
  const getLocationString = () => {
    const parts = []
    if (listing?.city) parts.push(listing.city)
    if (listing?.region) parts.push(listing.region)
    if (listing?.country) parts.push(listing.country)
    return parts.length > 0 ? parts.join(", ") : "Location not specified"
  }

  // Get images array with null check
  const getImages = () => {
    if (listing?.media && Array.isArray(listing.media) && listing.media.length > 0) {
      return listing.media.map((item) => item.media_url || "/placeholder.svg")
    }
    return ["/placeholder.svg"]
  }

  // Calculate total amount with null checks
  const calculateTotalAmount = () => {
    if (!startDate || !endDate || !listing?.price) return 0

    const days = differenceInDays(endDate, startDate)
    if (days <= 0) return 0

    // Convert monthly price to daily price (approximate)
    const dailyPrice = listing.price / 30

    // Calculate base amount
    const baseAmount = dailyPrice * days

    // Round to 2 decimal places
    return Math.round(baseAmount * 100) / 100
  }

  // Handle booking submission with null checks
  const handleBooking = async () => {
    if (!startDate || !endDate || !listing || !id) {
      setBookingError("Please select valid dates")
      return
    }

    const totalAmount = calculateTotalAmount()
    if (totalAmount <= 0) {
      setBookingError("Invalid booking period")
      return
    }

    setIsBooking(true)
    setBookingError(null)

    try {
      const payload = {
        start_date: formatISO(startDate),
        end_date: formatISO(endDate),
        total_amount: totalAmount,
      }

      const bookingResponse = await tenantApi.createBooking(id, payload)
      console.log("Booking Response:", bookingResponse)

      if (bookingResponse?.booking?.id) {
        setBookingId(bookingResponse.booking.id)
        setShowIllustration(true)
        toast({
          title: "Booking Successful",
          description: "Your booking has been confirmed!",
          variant: "default",
        })

        // Reset dates
        setStartDate(undefined)
        setEndDate(undefined)
      } else {
        console.error("Booking response missing booking.id:", bookingResponse)
        setBookingError("Booking failed. No booking ID returned.")
      }
    } catch (error) {
      console.error("Booking failed:", error)
      setBookingError("Failed to complete booking. Please try again.")
    } finally {
      setIsBooking(false)
    }
  }

  // Open booking modal with default dates
  const openBookingModal = () => {
    // Set default dates if not already set
    if (!startDate) {
      const today = new Date()
      const tomorrow = addDays(today, 1)
      setStartDate(tomorrow)
      setEndDate(addDays(tomorrow, 7)) // Default to 7-day booking
    }

    // Reset any previous booking errors
    setBookingError(null)
    setIsBookingModalOpen(true)
  }

  const handleReviewSubmitted = async () => {
    setShowReviewForm(false)
    setReviewsRefreshTrigger((prev) => prev + 1)
    
    // Fetch updated reviews count
    try {
      const reviews = await reviewsApi.getListingReviews(id!)
      const newReviewCount = reviews.length
      setReviewsCount(newReviewCount)
      
      // Update the listing state with new review count
      if (listing) {
        setListing({
          ...listing,
          reviewCount: newReviewCount
        })
      }    } catch (error) {
      console.error("Error updating review count:", error)
    }
  }

  // Add save/unsave functionality
  const handleSaveListing = async () => {
    if (!isLoggedIn || !isTenant || !listing || isSaving) {
      return
    }
    
    setIsSaving(true)
    try {
      if (isSaved) {
        // Currently saved, so remove it
        await tenantApi.removeSavedListing(listing.id)
        setIsSaved(false)
        toast({ title: "Listing removed from saved" })
      } else {
        // Currently not saved, so add it
        await tenantApi.saveListing(listing.id)
        setIsSaved(true)
        toast({ title: "Listing saved successfully" })
      }
    } catch (error) {
      console.error("Error saving/unsaving listing:", error)
      toast({ 
        title: "Error", 
        description: "Failed to save listing", 
        variant: "destructive" 
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Check if listing is saved when component loads
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!isLoggedIn || !isTenant || !listing) {
        return
      }
      
      try {
        const savedListings = await tenantApi.getSavedListings()
        const isCurrentListingSaved = savedListings.some(
          (savedListing: any) => savedListing.id === listing.id
        )
        setIsSaved(isCurrentListingSaved)
      } catch (error) {
        console.error("Error checking saved status:", error)
      }
    }
    
    checkIfSaved()
  }, [listing, isLoggedIn, isTenant])

  // Add this function to handle opening the image gallery
  const openImageGallery = (index: number) => {
    setCurrentImageIndex(index)
    setIsImageGalleryOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Error Loading Listing</h2>
              <p className="text-gray-600 mb-6">{error || "Listing not found"}</p>
              <Button asChild>
                <Link to="/browse">Browse Other Listings</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const images = getImages()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="flex items-center text-gray-600">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to listings
              </Link>
            </Button>
          </div>

          {/* Listing title and basic info */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{getLocationString()}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {listing.status && (
                <Badge className={`${listing.status === "available" ? "bg-green-500" : "bg-gray-500"} text-white`}>
                  {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </Badge>
              )}

              {listing.category && (
                <Badge variant="outline" className="bg-blue-50">
                  <Home className="h-3 w-3 mr-1" />
                  {listing.category.name}
                </Badge>
              )}

              {listing.rating !== undefined && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>{listing.rating}</span>
                  {listing.reviewCount !== undefined && (
                    <span className="text-gray-500 text-sm ml-1">({listing.reviewCount} reviews)</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Image gallery with null checks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="md:col-span-2">
              <div className="rounded-lg overflow-hidden bg-white border h-[400px] cursor-pointer" onClick={() => openImageGallery(0)}>
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt={listing?.title || "Listing image"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              {images.slice(0, 2).map((image, index) => (
                <div
                  key={index}
                  className={`rounded-lg overflow-hidden bg-white border h-[120px] cursor-pointer transition-all ${selectedImage === image ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => {
                    setSelectedImage(image)
                    openImageGallery(index + 1)
                  }}
                >
                  <img
                    src={image}
                    alt={`${listing?.title || "Listing"} - image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                </div>
              ))}

              {images?.length > 3 && (
                <div 
                  className="rounded-lg overflow-hidden bg-white border h-[120px] relative cursor-pointer"
                  onClick={() => openImageGallery(3)}
                >
                  <img
                    src={images[3] || "/placeholder.svg"}
                    alt={`${listing.title} - image 5`}
                    className="w-full h-full object-cover opacity-70"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white font-medium hover:bg-opacity-60 transition-all">
                    +{images.length - 3} more
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add the Image Gallery Dialog */}
          <Dialog open={isImageGalleryOpen} onOpenChange={setIsImageGalleryOpen}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden">
              <div className="relative">
                <Carousel
                  itemsPerSlide={1}
                  className="w-full"
                  onSlideChange={(index) => setCurrentImageIndex(index)}
                >
                  <CarouselContent>
                    {images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-[4/3] w-full">
                          <img
                            src={image}
                            alt={`${listing.title} - image ${index + 1}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4 bg-white/80 hover:bg-white shadow-md" />
                  <CarouselNext className="right-4 bg-white/80 hover:bg-white shadow-md" />
                </Carousel>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Main content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column - Details */}
            <div className="md:col-span-2 space-y-8">
              {/* Description */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Description</h2>
                  <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
                </CardContent>
              </Card>

              {/* Features and amenities */}
              {listing.tags && listing.tags.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Features & Amenities</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {listing.tags.map((tag, index) => (
                        <div key={index} className="flex items-center">
                          <Tag className="h-4 w-4 mr-2 text-blue-600" />
                          <span>{tag}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}              {/* Location */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Location</h2>
                  <div className="mb-4">
                    <p className="text-gray-700">
                      {listing.address && <span className="block">{listing.address}</span>}
                      <span className="block">{getLocationString()}</span>
                    </p>
                  </div>
                  <GoogleMap 
                    city={listing.city}
                    region={listing.region}
                    country={listing.country}
                    className="w-full h-[200px] rounded-lg"
                  />
                </CardContent>
              </Card>

              {/* Reviews Section */}
              {isLoggedIn && (
                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold flex items-center">
                        <MessageCircle className="h-6 w-6 mr-3 text-blue-600" />
                        Reviews & Ratings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* Reviews List */}
                      <ReviewsList
                        listingId={listing.id}
                        ownerId={listing.owner_id}
                        refreshTrigger={reviewsRefreshTrigger}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
              {!isLoggedIn && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Want to see reviews?</h3>
                      <p className="text-gray-600 mb-4">Sign in to read reviews from other renters</p>
                      <Button asChild>
                        <Link to="/login">Sign In</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
            </div>

            {/* Right column - Booking and info */}
            <div className="space-y-6">
              {/* Price card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-baseline mb-4">
                    <span className="text-2xl font-bold">
                      ETB {new Intl.NumberFormat("am-ET").format(listing.price)}
                    </span>
                    <span className="text-gray-600 ml-1">/month</span>
                  </div>

                  {/* Availability */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Availability</h3>
                    <div className="flex items-center text-gray-700 mb-2">
                      <CalendarIcon className="h-4 w-4 mr-2 text-blue-600" />
                      <div>
                        <div>From: {formatDate(listing.availability?.startDate)}</div>
                        <div>To: {formatDate(listing.availability?.endDate)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-3">
                    {isTenant && (
                      <>
                        {listing?.status === ListingStatus.AVAILABLE ? (
                          <Button className="w-full" onClick={openBookingModal}>
                            Book Now
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full" disabled>
                            Booking Unavailable
                          </Button>
                        )}
                        <Link to={`/messages/${listing.id}/${bookingId}`}>
                          <Button variant="outline" className="w-full">
                            Contact Owner
                          </Button>
                        </Link>
                      </>
                    )}
                    {!isTenant && (
                      <Button variant="outline" className="w-full" disabled>
                        Booking not available for your role
                      </Button>
                    )}                    <div className="flex justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center"
                        onClick={handleSaveListing}
                        disabled={!isLoggedIn || !isTenant || isSaving || isSaved}
                      >
                        <Heart 
                          className={`h-4 w-4 mr-1 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} 
                        />
                        {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                      </Button>
                      <ReportButton
                        reportedId={listing.owner_id || ""}
                        listingId={listing.id}
                        size="sm"
                        variant="ghost"
                        className="flex items-center"
                      >
                        <Flag className="h-4 w-4 mr-1" />
                        Report
                      </ReportButton>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium mb-3">Additional Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Listed</span>
                      <span>Recently</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                        Price
                      </span>
                      <span>ETB {new Intl.NumberFormat("am-ET").format(listing.price)}/month</span>
                    </div>

                    {listing.views_count !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Views</span>
                        <span>{listing.views_count}</span>
                      </div>
                    )}

                    {listing.category && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Home className="h-4 w-4 mr-2 text-blue-600" />
                          Category
                        </span>
                        <span>{listing.category.name}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      {/* Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          {isBooking ? (
            <div className="flex flex-col items-center justify-center p-6">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Processing your booking...</p>
            </div>
          ) : bookingError ? (
            <div className="p-6">
              <DialogHeader className="px-6 pt-6">
                <DialogTitle>Booking Error</DialogTitle>
                <DialogDescription>{bookingError}</DialogDescription>
              </DialogHeader>
              <DialogFooter className="px-6 py-4 bg-gray-50 border-t">
                <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={handleBooking}>Try Again</Button>
              </DialogFooter>
            </div>
          ) : showIllustration ? (
            <>
              <DialogHeader className="px-6 pt-6">
                <DialogTitle>Booking Confirmation</DialogTitle>
                <DialogDescription>
                  Your booking has been successfully processed. Check your email for confirmation.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center p-6">
                <CheckCircle className="h-48 w-48 text-green-600 mb-4" />
                <h3 className="text-2xl font-semibold mb-2">All set!</h3>
                <p>Your booking is confirmed. Check your email for details.</p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!bookingId || !listing}
                  onClick={() => {
                    if (listing && bookingId) {
                      navigate(`/listings/${listing.id}/bookings/${bookingId}`)
                    }
                  }}
                >
                  View Details
                </Button>
              </div>
              <DialogFooter className="px-6 py-4 bg-gray-50 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowIllustration(false)
                    setIsBookingModalOpen(false)
                    setBookingId(null) // Reset bookingId to ensure fresh state for next booking
                  }}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader className="px-6 pt-6">
                <DialogTitle>Book {listing.title}</DialogTitle>
                <DialogDescription>Select your booking dates to calculate the total cost.</DialogDescription>
              </DialogHeader>

              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="start-date" className="text-sm font-medium">
                      Start Date
                    </label>
                    <DatePicker
                      date={startDate}
                      setDate={(date) => {
                        setStartDate(date)
                        // If end date is before start date, adjust it
                        if (date && endDate && date > endDate) {
                          setEndDate(addDays(date, 1))
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Select your check-in date</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="end-date" className="text-sm font-medium">
                      End Date
                    </label>
                    <DatePicker
                      date={endDate}
                      setDate={(date) => {
                        // Ensure end date is after start date
                        if (date && startDate && date < startDate) {
                          toast({
                            title: "Invalid date selection",
                            description: "End date must be after start date",
                            variant: "destructive",
                          })
                          return
                        }
                        setEndDate(date)
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Select your check-out date</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-medium mb-3">Booking Summary</h3>

                  <div className="space-y-2">
                    {startDate && endDate ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Check-in:</span>
                          <span className="font-medium">{format(startDate, "PPP")}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Check-out:</span>
                          <span className="font-medium">{format(endDate, "PPP")}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{differenceInDays(endDate, startDate)} days</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t mt-2">
                          <span className="text-gray-600">Rate:</span>
                          <span className="font-medium">ETB {(listing.price / 30).toFixed(2)}/day</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>Total Amount:</span>
                          <span>ETB {calculateTotalAmount().toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 text-center py-2">
                        Please select both start and end dates to see the total cost
                      </p>
                    )}
                  </div>
                </div>

                {bookingError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    {bookingError}
                  </div>
                )}
              </div>

              <DialogFooter className="px-6 py-4 bg-gray-50 border-t">
                <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleBooking}
                  disabled={isBooking || !startDate || !endDate || calculateTotalAmount() <= 0}
                  className="ml-2"
                >
                  {isBooking ? "Processing..." : "Confirm Booking"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}