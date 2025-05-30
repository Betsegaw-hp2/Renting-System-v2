"use client"

import { useState } from "react"
import { Star, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/useToast"
import { reviewsApi, type ReviewPayload } from "../api/reviewApi"

interface ReviewFormProps {
  listingId: string
  onReviewSubmitted: () => void
  onCancel?: () => void
}

export function ReviewForm({ listingId, onReviewSubmitted, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting your review.",
        variant: "destructive",
      })
      return
    }

    if (description.trim().length < 10) {
      toast({
        title: "Review too short",
        description: "Please write at least 10 characters for your review.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const payload: ReviewPayload = {
        rating,
        description: description.trim(),
      }

      await reviewsApi.createReview(listingId, payload)

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      })

      // Reset form
      setRating(0)
      setDescription("")
      onReviewSubmitted()
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1
      const isActive = starValue <= (hoveredRating || rating)

      return (
        <button
          key={index}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className="focus:outline-none transition-colors"
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              isActive ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-300"
            }`}
          />
        </button>
      )
    })
  }

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-blue-900">Write a Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
          <div className="flex items-center gap-1">{renderStars()}</div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {rating} star{rating !== 1 ? "s" : ""} -{" "}
              {rating === 1
                ? "Poor"
                : rating === 2
                  ? "Fair"
                  : rating === 3
                    ? "Good"
                    : rating === 4
                      ? "Very Good"
                      : "Excellent"}
            </p>
          )}
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
          <Textarea
            placeholder="Share your experience with this property..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            style={{
              height: "auto",
              minHeight: "120px",
              maxHeight: "300px",
              overflowY: description.length > 200 ? "auto" : "hidden",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = "auto"
              target.style.height = Math.min(target.scrollHeight, 300) + "px"
            }}
          />
          <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters (minimum 10)</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || description.trim().length < 10}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
