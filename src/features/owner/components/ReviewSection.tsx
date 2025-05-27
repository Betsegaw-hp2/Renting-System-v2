"use client"

import type React from "react"
import { useState } from "react"
import { Star, MessageCircle, Reply, Send, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/useToast"
import type { Review } from "@/types/listing.types"

interface ReviewsSectionProps {
  reviews: Review[]
  isLoading?: boolean
}

interface ReviewReply {
  id: string
  review_id: string
  content: string
  created_at: string
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, isLoading }) => {
  const { toast } = useToast()
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})
  const [replies, setReplies] = useState<Record<string, ReviewReply>>({})
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({})

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
    return reviewerId.slice(0, 2).toUpperCase()
  }

  const handleReplySubmit = async (reviewId: string) => {
    const replyText = replyTexts[reviewId]?.trim()
    if (!replyText) return

    try {
      // Simulate API call
      const newReply: ReviewReply = {
        id: `reply-${Date.now()}`,
        review_id: reviewId,
        content: replyText,
        created_at: new Date().toISOString(),
      }

      setReplies((prev) => ({ ...prev, [reviewId]: newReply }))
      setReplyTexts((prev) => ({ ...prev, [reviewId]: "" }))
      setReplyingTo(null)

      toast({
        title: "Reply sent",
        description: "Your reply has been posted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReplyTextChange = (reviewId: string, text: string) => {
    setReplyTexts((prev) => ({ ...prev, [reviewId]: text }))
  }

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }))
  }

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  if (isLoading) {
    return (
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-3">
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
    <Card className="shadow-sm border-0 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          Reviews ({reviews.length})
        </CardTitle>
        {reviews.length > 0 && (
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">{renderStars(Math.round(averageRating))}</div>
            <span className="text-lg font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">average rating</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-sm text-gray-500">Reviews from renters will appear here once your property is booked.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review, index) => {
              const isExpanded = expandedReviews[review.id]
              const shouldTruncate = review.description.length > 200
              const displayText =
                shouldTruncate && !isExpanded ? review.description.slice(0, 200) + "..." : review.description

              return (
                <div key={review.id} className="group">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                      <AvatarImage src="/placeholder.svg" alt="Reviewer" />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white font-semibold">
                        {getInitials(review.reviewer_id)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">Anonymous Reviewer</span>
                          <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Verified Renter
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                        <span className="text-sm font-medium text-gray-700">({review.rating}/5)</span>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <p className="text-gray-700 leading-relaxed">{displayText}</p>
                        {shouldTruncate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleReviewExpansion(review.id)}
                            className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-700"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Show less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Read more
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Owner Reply */}
                      {replies[review.id] && (
                        <div className="ml-4 border-l-2 border-blue-200 pl-4 mb-3">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-blue-900">Property Owner</span>
                              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                                Owner
                              </Badge>
                            </div>
                            <p className="text-blue-800 text-sm leading-relaxed">{replies[review.id].content}</p>
                            <span className="text-xs text-blue-600 mt-2 block">
                              {formatDate(replies[review.id].created_at)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Reply Section */}
                      {replyingTo === review.id ? (
                        <div className="ml-4 border-l-2 border-gray-200 pl-4">
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Write a thoughtful reply to this review..."
                              value={replyTexts[review.id] || ""}
                              onChange={(e) => handleReplyTextChange(review.id, e.target.value)}
                              className="min-h-[80px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              style={{
                                height: "auto",
                                minHeight: "80px",
                                maxHeight: "200px",
                                overflowY: replyTexts[review.id]?.length > 100 ? "auto" : "hidden",
                              }}
                              onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement
                                target.style.height = "auto"
                                target.style.height = Math.min(target.scrollHeight, 200) + "px"
                              }}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleReplySubmit(review.id)}
                                disabled={!replyTexts[review.id]?.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Post Reply
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setReplyingTo(null)
                                  setReplyTexts((prev) => ({ ...prev, [review.id]: "" }))
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        !replies[review.id] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(review.id)}
                            className="ml-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                          </Button>
                        )
                      )}
                    </div>
                  </div>

                  {index < reviews.length - 1 && <Separator className="mt-6" />}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ReviewsSection
