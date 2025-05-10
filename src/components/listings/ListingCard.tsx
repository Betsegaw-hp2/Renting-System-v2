"use client"

import type React from "react"

import { Heart, Star } from "lucide-react"
import { Link } from "react-router-dom"
import type { FeaturedListing } from "../../api/publicApi"
import { usePermissions } from "../../hooks/usePermissions"
import type { ListingWithCategory } from "../../types/listing.types"
import { RoleBasedAccessControl } from "../auth/RoleBasedAccessControl"
import { Button } from "../ui/button"

// Create a union type to accept both ListingWithCategory and FeaturedListing
type ListingCardProps = {
  listing: ListingWithCategory | FeaturedListing
  showFavorite?: boolean
  isFavorite?: boolean
  onFavoriteToggle?: (id: string) => void
}

export function ListingCard({ listing, showFavorite = false, isFavorite = false, onFavoriteToggle }: ListingCardProps) {
  const permissions = usePermissions()

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (onFavoriteToggle) {
      onFavoriteToggle(listing.id)
    }
  }

  // Check if the listing is a FeaturedListing by checking for priceUnit property
  const isFeaturedListing = "priceUnit" in listing

  // Get rating and reviewCount from the listing if it's a FeaturedListing, otherwise use defaults
  const rating = isFeaturedListing ? listing.rating : 4.5
  const reviewCount = isFeaturedListing ? listing.reviewCount : Math.floor(Math.random() * 30) + 5

  // Get features if available (only in FeaturedListing)
  const features = isFeaturedListing ? listing.features : undefined

  // Get price unit (month by default)
  const priceUnit = isFeaturedListing ? listing.priceUnit : "month"

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-4px] hover:shadow-lg">
      <div className="relative">
        <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
          {listing.category.name}
        </span>
        <img
          src={listing.media[0]?.media_url || "/placeholder.svg?height=200&width=300"}
          alt={listing.title}
          className="w-full h-48 object-cover"
        />
        {showFavorite && (
          <button
            className={`absolute top-2 right-2 p-1.5 rounded-full ${isFavorite ? "bg-red-500 text-white" : "bg-white text-gray-500"}`}
            onClick={handleFavoriteClick}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        )}
        <div className="absolute top-2 right-2 bg-white rounded-full p-1">
          <Star className="h-4 w-4 text-yellow-400" />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-2">
          <Star className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-medium ml-1">
            {rating.toFixed(1)} ({reviewCount} reviews)
          </span>
        </div>
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{listing.title}</h3>
        <p className="text-gray-500 text-sm mb-2">
          {listing.city}, {listing.region}
        </p>

        {/* Features section - conditionally render based on availability */}
        {features && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            {features.guests && (
              <>
                <span className="mr-2">{features.guests} guests</span>
                {(features.bedrooms || features.bathrooms) && <span className="mx-2">•</span>}
              </>
            )}
            {features.bedrooms && (
              <>
                <span className="mr-2">{features.bedrooms} beds</span>
                {features.bathrooms && <span className="mx-2">•</span>}
              </>
            )}
            {features.bathrooms && <span>{features.bathrooms} baths</span>}
            {features.area && features.area > 0 && <span>{features.area} sq ft</span>}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold text-lg">${listing.price.toLocaleString()}</span>
            <span className="text-gray-600 text-sm">/{priceUnit}</span>
          </div>
          <div className="flex gap-2">
            {/* Only show Book button for tenants */}
            <RoleBasedAccessControl
              requiredPermission="can_book_properties"
              fallback={
                <Button asChild variant="outline" size="sm">
                  <Link to={`/listings/${listing.id}`}>View Details</Link>
                </Button>
              }
            >
              <div className="flex gap-2">
                <Button asChild size="sm">
                  <Link to={`/listings/${listing.id}/book`}>Book</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/listings/${listing.id}`}>View Details</Link>
                </Button>
              </div>
            </RoleBasedAccessControl>
          </div>
        </div>
      </div>
    </div>
  )
}
