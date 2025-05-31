"use client"

import { useState, useEffect } from "react"
import { Star, MessageCircle, Reply, Send, ChevronDown, ChevronUp, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/useToast"
import { usePermissions } from "@/hooks/usePermissions"
import { reviewsApi, type Review, type ReviewReply } from "../api/reviewApi"
import { ReviewForm } from "./ReviewForm"
import { Input } from "@/components/ui/input"
import { toast } from "react-toastify"

interface ReviewsListProps {
  listingId: string
  ownerId?: string
  refreshTrigger?: number
}

export function ReviewsList({ listingId, ownerId, refreshTrigger }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [replies, setReplies] = useState<Record<string, ReviewReply>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({})
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const { toast } = useToast()
  const { isOwner, isTenant } = usePermissions()
  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [editTexts, setEditTexts] = useState<Record<string, string>>({})
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [isDeletingReview, setIsDeletingReview] = useState(false)

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const reviewsData = await reviewsApi.getListingReviews(listingId)
      console.log("Fetched reviews:", reviewsData)
      
      if (Array.isArray(reviewsData) && reviewsData.length > 0) {
        setReviews(reviewsData)
        localStorage.setItem(`reviews_${listingId}`, JSON.stringify(reviewsData))
      } else {
        const cachedReviews = localStorage.getItem(`reviews_${listingId}`)
        if (cachedReviews) {
          const parsedReviews = JSON.parse(cachedReviews)
          if (Array.isArray(parsedReviews) && parsedReviews.length > 0) {
            setReviews(parsedReviews)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      const cachedReviews = localStorage.getItem(`reviews_${listingId}`)
      if (cachedReviews) {
        const parsedReviews = JSON.parse(cachedReviews)
        if (Array.isArray(parsedReviews) && parsedReviews.length > 0) {
          setReviews(parsedReviews)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [listingId, refreshTrigger])

  const handleAddReview = () => {
    // Get user ID from localStorage
    const userId = localStorage.getItem('userId')
    console.log('Current user ID:', userId)
    console.log('All reviews:', reviews)

    // Check if user already has a review
    const hasExistingReview = reviews.some(review => {
      console.log('Comparing review.reviewer_id:', review.reviewer_id, 'with userId:', userId)
      return review.reviewer_id === userId
    })

    console.log('Has existing review:', hasExistingReview)

    if (hasExistingReview) {
      window.alert("You can only add one review per listing")
      return
    }
    setShowReviewForm(true)
  }

  const handleReplySubmit = async (reviewId: string) => {
    const replyText = replyTexts[reviewId]?.trim()
    if (!replyText) return

    setIsSubmittingReply(true)

    try {
      const newReply = await reviewsApi.replyToReview(listingId, reviewId, {
        description: replyText,
      })

      setReplies((prev) => ({ ...prev, [reviewId]: newReply }))
      setReplyTexts((prev) => ({ ...prev, [reviewId]: "" }))
      setReplyingTo(null)

      toast({
        title: "Reply sent",
        description: "Your reply has been posted successfully.",
      })
    } catch (error) {
      console.error("Error posting reply:", error)
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingReply(false)
    }
  }

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

  const handleReplyTextChange = (reviewId: string, text: string) => {
    setReplyTexts((prev) => ({ ...prev, [reviewId]: text }))
  }

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }))
  }

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  const canReply = (review: Review) => {
    return isOwner && !replies[review.id]
  }

  const handleEditSubmit = async (reviewId: string) => {
    const editText = editTexts[reviewId]?.trim()
    if (!editText) return

    setIsSubmittingEdit(true)
    try {
      const updatedReview = await reviewsApi.updateReview(listingId, reviewId, {
        rating: reviews.find(r => r.id === reviewId)?.rating || 5,
        description: editText,
      })

      // Update the reviews list with the edited review
      setReviews(prev => prev.map(review => 
        review.id === reviewId ? updatedReview : review
      ))

      setEditTexts(prev => ({ ...prev, [reviewId]: "" }))
      setEditingReview(null)

      toast({
        title: "Review updated",
        description: "Your review has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating review:", error)
      toast({
        title: "Error",
        description: "Failed to update review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return

    setIsDeletingReview(true)
    try {
      await reviewsApi.deleteReview(listingId, reviewId)
      
      // Remove the deleted review from the list
      setReviews(prev => prev.filter(review => review.id !== reviewId))

      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingReview(false)
    }
  }

  const handleEditTextChange = (reviewId: string, text: string) => {
    setEditTexts(prev => ({ ...prev, [reviewId]: text }))
  }

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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Reviews ({reviews.length})
          </CardTitle>
          {isTenant && !showReviewForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddReview}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Review
            </Button>
          )}
        </div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">{renderStars(Math.round(averageRating))}</div>
            <span className="text-lg font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">average rating</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
        ) : (
          <div className="space-y-6">
            {showReviewForm && (
              <div className="mb-6">
                <ReviewForm
                  listingId={listingId}
                  onReviewSubmitted={() => {
                    setShowReviewForm(false)
                    fetchReviews()
                  }}
                  onCancel={() => setShowReviewForm(false)}
                />
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-sm text-gray-500">Be the first to leave a review for this property.</p>
              </div>
            ) : (
              reviews.map((review, index) => {
                const isExpanded = expandedReviews[review.id]
                const shouldTruncate = review.description.length > 200
                const displayText = shouldTruncate && !isExpanded
                  ? review.description.slice(0, 200) + "..."
                  : review.description

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
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                            {review.updated_at && review.updated_at !== review.created_at && (
                              <span className="text-xs text-gray-400">(edited)</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                          <span className="text-sm font-medium text-gray-700">({review.rating}/5)</span>
                        </div>

                        {editingReview === review.id ? (
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Edit your review..."
                              value={editTexts[review.id] || review.description}
                              onChange={(e) => handleEditTextChange(review.id, e.target.value)}
                              className="min-h-[80px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditSubmit(review.id)}
                                disabled={!editTexts[review.id]?.trim() || isSubmittingEdit}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {isSubmittingEdit ? "Saving..." : "Save Changes"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingReview(null)
                                  setEditTexts(prev => ({ ...prev, [review.id]: "" }))
                                }}
                                disabled={isSubmittingEdit}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
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
                        )}

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
                              <p className="text-blue-800 text-sm leading-relaxed">{replies[review.id].description}</p>
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
                                  disabled={!replyTexts[review.id]?.trim() || isSubmittingReply}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  {isSubmittingReply ? "Posting..." : "Post Reply"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setReplyingTo(null)
                                    setReplyTexts((prev) => ({ ...prev, [review.id]: "" }))
                                  }}
                                  disabled={isSubmittingReply}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          isOwner && !replies[review.id] && (
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

                        {/* Edit and Delete buttons */}
                        {!editingReview && (
                          <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingReview(review.id)
                                setEditTexts(prev => ({ ...prev, [review.id]: review.description }))
                              }}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReview(review.id)}
                              disabled={isDeletingReview}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {index < reviews.length - 1 && <Separator className="mt-6" />}
                  </div>
                )
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
