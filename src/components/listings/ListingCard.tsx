import { Star } from "lucide-react"
import { Link } from "react-router-dom"
import type { FeaturedListing } from "../../api/publicApi"
import { Button } from "../ui/button"

interface ListingCardProps {
  listing: FeaturedListing
}

export function ListingCard({ listing }: ListingCardProps) {
  const { id, title, location, price, priceUnit, category, images, rating, reviewCount, features } = listing

  // Format price with commas
  const formattedPrice = new Intl.NumberFormat("en-US").format(price)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-4px] hover:shadow-lg">
      <div className="relative">
        <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
          {category}
        </span>
        <img
          src={images[0] || "/placeholder.svg?height=200&width=300"}
          alt={title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-white rounded-full p-1">
          <Star className="h-4 w-4 text-yellow-400" />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-2">
          <Star className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-medium ml-1">
            {rating} ({reviewCount} reviews)
          </span>
        </div>
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{title}</h3>
        <p className="text-gray-500 text-sm mb-2">{location}</p>

        {/* Features section - conditionally render based on category */}
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
            <span className="font-bold text-lg">${formattedPrice}</span>
            <span className="text-gray-600 text-sm">/{priceUnit}</span>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={`/listings/${id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
