"use client"

import { ArrowLeft, Calendar, DollarSign, Heart, Home, MapPin, Share2, Star, Tag } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { publicApi } from "../api/publicApi"
import { Footer } from "../components/layout/Footer"
import { Header } from "../components/layout/Header"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"

// Listing interface matching the provided data structure
interface Listing {
  id: string
  title: string
  description: string
  price: number
  address?: string
  city?: string
  region?: string
  country?: string
  status?: string
  views_count?: number
  owner_id?: string
  availability_start?: string
  availability_end?: string
  media?: Array<{
    id: string
    media_type: string
    media_url: string
  }>
  category?: {
    id: string
    slug: string
    name: string
  }
  tags?: string[]
  rating?: number
  reviewCount?: number
  features?: {
    guests?: number
    bedrooms?: number
    bathrooms?: number
    area?: number
  }
}

export default function ListingDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        setError("No listing ID provided")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Fetch all listings and find the one with matching ID
        const listings = await publicApi.getFeaturedListings()
        const foundListing = listings.find((listing) => listing.id === id)

        if (foundListing) {
          console.log("Found listing:", foundListing)
          setListing(foundListing)

          // Set the selected image to the first media item or placeholder
          if (foundListing.media && foundListing.media.length > 0) {
            setSelectedImage(foundListing.media[0].media_url)
          } else {
            setSelectedImage("https://picsum.photos/200/300")
          }
        } else {
          setError("Listing not found")
        }
      } catch (err) {
        console.error("Error fetching listing:", err)
        setError("Failed to load listing details. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [id])

  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e) {
      return "Invalid date"
    }
  }

  // Get location string
  const getLocationString = () => {
    if (listing?.city && listing?.region) {
      return `${listing.city}, ${listing.region}${listing.country ? `, ${listing.country}` : ""}`
    }
    return "Location not specified"
  }

  // Get images array
  const getImages = () => {
    if (listing?.media && listing.media.length > 0) {
      return listing.media.map((item) => item.media_url)
    }
    return ["https://picsum.photos/200/300"]
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

          {/* Image gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="md:col-span-2">
              <div className="rounded-lg overflow-hidden bg-white border h-[400px]">
                <img
                  src={selectedImage || images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=600&width=800"
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              {images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className={`rounded-lg overflow-hidden bg-white border h-[120px] cursor-pointer transition-all ${
                    selectedImage === image ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${listing.title} - image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                    }}
                  />
                </div>
              ))}

              {images.length > 4 && (
                <div className="rounded-lg overflow-hidden bg-white border h-[120px] relative">
                  <img
                    src={images[4] || "/placeholder.svg"}
                    alt={`${listing.title} - image 5`}
                    className="w-full h-full object-cover opacity-70"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white font-medium">
                    +{images.length - 4} more
                  </div>
                </div>
              )}
            </div>
          </div>

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
              )}

              {/* Location */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Location</h2>
                  <div className="mb-4">
                    <p className="text-gray-700">
                      {listing.address && <span className="block">{listing.address}</span>}
                      <span className="block">{getLocationString()}</span>
                    </p>
                  </div>
                  <div className="bg-gray-200 h-[200px] rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Map would be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column - Booking and info */}
            <div className="space-y-6">
              {/* Price card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-baseline mb-4">
                    <span className="text-2xl font-bold">${new Intl.NumberFormat("en-US").format(listing.price)}</span>
                    <span className="text-gray-600 ml-1">/month</span>
                  </div>

                  {/* Availability */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Availability</h3>
                    <div className="flex items-center text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      <div>
                        <div>From: {formatDate(listing.availability_start)}</div>
                        <div>To: {formatDate(listing.availability_end)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-3">
                    <Button className="w-full">Book Now</Button>
                    <Button variant="outline" className="w-full">
                      Contact Owner
                    </Button>

                    <div className="flex justify-between">
                      <Button variant="ghost" size="sm" className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
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
                      <span>${new Intl.NumberFormat("en-US").format(listing.price)}/month</span>
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
    </div>
  )
}
