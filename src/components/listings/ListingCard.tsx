"use client"
import { Star } from "lucide-react"
import { Link } from "react-router-dom"
import type { FeaturedListing } from "../../api/publicApi"
import { Button } from "../ui/button"

type ListingCardProps = {
  listing: FeaturedListing
  showFavorite?: boolean
  isFavorite?: boolean
  onFavoriteToggle?: (id: string) => void
}

export function ListingCard({ listing }: ListingCardProps) {
  if (!listing) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">Image not available</p>
        </div>
        <div className="p-4">
          <p className="text-red-500">Error: Listing data is missing</p>
        </div>
      </div>
    )
  }

  const { id, title, city, region, price, category, media, rating, reviewCount } = listing

  const formattedPrice = new Intl.NumberFormat("en-US").format(price)
  const mainImage = media && media.length > 0 ? media[0].media_url : "https://picsum.photos/200/300"
  const location = `${city || ""}${city && region ? ", " : ""}${region || ""}` || "Unknown location"

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-4px] hover:shadow-lg">
      <div className="relative">
        <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
          {category.name || "Uncategorized"}
        </span>

        <img
          src={mainImage || "/placeholder.svg"}
          alt={title || "Listing"}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=200&width=300"
          }}
        />
        <div className="absolute top-2 right-2 bg-white rounded-full p-1">
          <Star className="h-4 w-4 text-yellow-400" />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-2">
          <Star className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-medium ml-1">
            {rating || 0} ({reviewCount || 0} reviews)
          </span>
        </div>
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{title || "Untitled Listing"}</h3>
        <p className="text-gray-500 text-sm mb-2">{location}</p>

        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold text-lg">${formattedPrice}</span>
            <span className="text-gray-600 text-sm">/month</span>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={`/listings/${id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
