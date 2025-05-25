import type React from "react"
import { Star, MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Review } from "@/types/listing.types"

interface ReviewsSectionProps {
  reviews: Review[]
  isLoading?: boolean
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, isLoading }) => {
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star key={index} className={`h-4 w-4 ${index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getInitials = (reviewerId: string) => {
    // Generate initials from reviewer ID for privacy
    return reviewerId.slice(0, 2).toUpperCase()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-3 w-full bg-gray-200 rounded" />
                    <div className="h-3 w-3/4 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Reviews ({reviews.length})
        </CardTitle>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">{renderStars(Math.round(averageRating))}</div>
            <span className="text-sm text-muted-foreground">{averageRating.toFixed(1)} average rating</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No reviews yet</h3>
            <p className="text-sm text-muted-foreground">
              Reviews from renters will appear here once your property is booked.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg" alt="Reviewer" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(review.reviewer_id)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">Anonymous Reviewer</span>
                        <Badge variant="secondary" className="text-xs">
                          Verified Renter
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground ml-1">({review.rating}/5)</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{review.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ReviewsSection
