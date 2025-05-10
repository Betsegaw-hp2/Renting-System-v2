"use client"

import {
  AlertTriangle,
  Bath,
  Bed,
  Calendar,
  Heart,
  Home,
  MapPin,
  MessageSquare,
  Share,
  Square,
  Star,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import type { FeaturedListing } from "../api/publicApi"
import { publicApi } from "../api/publicApi"
import { Header } from "../components/layout/Header"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Skeleton } from "../components/ui/skeleton"
import { usePermissions } from "../hooks/usePermissions"
import type { RootState } from "../store"

export default function ListingDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [listing, setListing] = useState<FeaturedListing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const { is_authenticated } = useSelector((state: RootState) => state.auth)
  const permissions = usePermissions()

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true)
      try {
        if (!id) return

        // Fetch listing details
        const listings = await publicApi.getFeaturedListings()
        const foundListing = listings.find((listing) => listing.id === id)

        if (foundListing) {
          setListing(foundListing)
        } else {
          // Handle not found
          console.error("Listing not found")
        }
      } catch (error) {
        console.error("Error fetching listing details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [id])

  const handleFavoriteToggle = () => {
    if (!is_authenticated) {
      navigate("/login", { state: { from: `/listings/${id}` } })
      return
    }

    setIsFavorite(!isFavorite)
  }

  const handleBookNow = () => {
    if (!is_authenticated) {
      navigate("/login", { state: { from: `/listings/${id}/book` } })
      return
    }

    navigate(`/listings/${id}/book`)
  }

  const handleContactOwner = () => {
    if (!is_authenticated) {
      navigate("/login", { state: { from: `/listings/${id}` } })
      return
    }

    // Navigate to messaging with this owner
    navigate(`/messages/new?listingId=${id}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* Role-specific alerts */}
        {is_authenticated && (permissions.isAdmin || permissions.isOwner) && (
          <div className="container mx-auto px-4 mt-6">
            <Alert variant="destructive">
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

        {isLoading ? (
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-2/3 mb-4" />
            <Skeleton className="h-6 w-1/3 mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Skeleton className="h-80 col-span-2" />
              <div className="space-y-4">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </div>
            </div>

            <Skeleton className="h-6 w-1/4 mb-4" />
            <Skeleton className="h-24 mb-8" />

            <Skeleton className="h-6 w-1/4 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        ) : listing ? (
          <>
            {/* Listing Header */}
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {/* {listing.city}, {listing.region} */}
                  </p>
                </div>
                <div className="flex items-center mt-4 md:mt-0 space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className={isFavorite ? "text-red-500" : ""}
                    onClick={handleFavoriteToggle}
                    disabled={!permissions.isTenant}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                    {isFavorite ? "Saved" : "Save"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Listing Images and Booking Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Main Image */}
                <div className="md:col-span-2">
                  <div className="aspect-video rounded-lg overflow-hidden">
                    {/* <img
                      src={listing.media[0]?.media_url || "/placeholder.svg?height=400&width=600"}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    /> */}
                  </div>

                  {/* Thumbnail Images */}
                  {/* {listing.media.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {listing.media.slice(1, 5).map((media, index) => (
                        <div key={index} className="aspect-video rounded-lg overflow-hidden">
                          <img
                            src={media.media_url || "/placeholder.svg?height=100&width=150"}
                            alt={`${listing.title} - image ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )} */}
                </div>

                {/* Booking Card */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>${listing.price.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">/{listing.priceUnit}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>
                          {listing.rating.toFixed(1)} ({listing.reviewCount} reviews)
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Category</span>
                          <span className="font-medium">{listing.category}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Availability</span>
                          <span className="font-medium">Immediate</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Minimum Stay</span>
                          <span className="font-medium">1 {listing.priceUnit}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-3">
                      {permissions.canBookProperties ? (
                        <Button className="w-full" onClick={handleBookNow}>
                          Book Now
                        </Button>
                      ) : (
                        <Button className="w-full" disabled>
                          Booking Not Available
                        </Button>
                      )}
                      <Button variant="outline" className="w-full" onClick={handleContactOwner}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Owner
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>

              {/* Listing Description */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">About this property</h2>
                <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
              </div>

              {/* Listing Features */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {listing.features?.guests && (
                    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                      <Users className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium">{listing.features.guests} guests</p>
                        <p className="text-sm text-gray-500">Maximum capacity</p>
                      </div>
                    </div>
                  )}

                  {listing.features?.bedrooms && (
                    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                      <Bed className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium">{listing.features.bedrooms} bedrooms</p>
                        <p className="text-sm text-gray-500">Sleeping arrangements</p>
                      </div>
                    </div>
                  )}

                  {listing.features?.bathrooms && (
                    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                      <Bath className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium">{listing.features.bathrooms} bathrooms</p>
                        <p className="text-sm text-gray-500">Full bathrooms</p>
                      </div>
                    </div>
                  )}

                  {listing.features?.area && (
                    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                      <Square className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium">{listing.features.area} sq ft</p>
                        <p className="text-sm text-gray-500">Total area</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                    <Home className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium">{listing.category}</p>
                      <p className="text-sm text-gray-500">Property type</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                    <Calendar className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium">Flexible cancellation</p>
                      <p className="text-sm text-gray-500">Cancel up to 24 hours before</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Location</h2>
                <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-gray-400 mr-2" />
                  <span className="text-gray-500">Map view will be displayed here</span>
                </div>
                <p className="mt-4 text-gray-700">
                  {/* {listing.city}, {listing.region}. */}
                   The exact location will be provided after booking.
                </p>
              </div>

              {/* Reviews */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Reviews</h2>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    <span className="font-medium">{listing.rating.toFixed(1)}</span>
                    <span className="text-gray-500 ml-1">({listing.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-gray-500">June 2023</p>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      Great property! Very clean and exactly as described. The location was perfect for our needs.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                      <div>
                        <p className="font-medium">Jane Smith</p>
                        <p className="text-sm text-gray-500">May 2023</p>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      We had a wonderful stay. The owner was very responsive and helpful. Would definitely recommend!
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Button variant="outline">View All Reviews</Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="container mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Listing Not Found</h2>
            <p className="text-gray-600 mb-8">The listing you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/browse")}>Browse Other Listings</Button>
          </div>
        )}
      </main>
    </div>
  )
}
