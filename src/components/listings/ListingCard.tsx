"use client"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import type { FeaturedListing } from "../../api/publicApi"
import { useToast } from "../../hooks/useToast"
import { Button } from "../ui/button"

type ListingCardProps = {
  listing: FeaturedListing
  showSaveButton?: boolean
  isSaved?: boolean
  onSaveToggle?: (id: string, isSaved: boolean) => void
}

export function ListingCard({ listing, showSaveButton = false, isSaved = false, onSaveToggle }: ListingCardProps) {
  const [isListingSaved, setIsListingSaved] = useState(isSaved)
  const [isToggling, setIsToggling] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { toast } = useToast()

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

  const formattedPrice = new Intl.NumberFormat("am-ET").format(price)
  const images = media && media.length > 0 ? media.map(m => m.media_url) : ["https://picsum.photos/200/300"]
  const location = `${city || ""}${city && region ? ", " : ""}${region || ""}` || "Unknown location"

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isToggling) return

    setIsToggling(true)
    try {
      setIsListingSaved(!isListingSaved)
      if (onSaveToggle) {
        onSaveToggle(id, !isListingSaved)
      }
    } catch (error) {
      console.error("Error toggling saved status:", error)
      setIsListingSaved(isListingSaved) // Revert on error
      toast({
        title: "Error",
        description: `Failed to ${isListingSaved ? "remove from" : "add to"} saved listings. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsToggling(false)
    }
  }

  const handlePreviousImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <Link to={`/listings/${id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-4px] hover:shadow-lg">
        <div className="relative">
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded z-10">
            {category.name || "Uncategorized"}
          </span>

          <div className="relative h-48">
            <img
              src={images[currentImageIndex]}
              alt={title || "Listing"}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://picsum.photos/200/300"
              }}
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {showSaveButton && (
            <button
              onClick={handleSaveToggle}
              disabled={isToggling}
              className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors z-10 ${
                isListingSaved
                  ? "bg-yellow-500 text-white hover:bg-yellow-600"
                  : "bg-white text-gray-500 hover:text-yellow-500"
              } ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label={isListingSaved ? "Remove from saved" : "Save listing"}
            >
              <Star className={`h-4 w-4 ${isListingSaved ? "fill-current" : ""}`} />
            </button>
          )}
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
              <span className="font-bold text-lg">ETB {formattedPrice}</span>
              <span className="text-gray-600 text-sm">/month</span>
            </div>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
