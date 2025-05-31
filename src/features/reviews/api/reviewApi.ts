import axios from "axios"
import config from "@/config/api.config"
import { getAuthToken } from "@/lib/cookies"
import { publicAxiosInstance } from "@/api/publicApi"

// Create axios instance for reviews API
const reviewsAxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
reviewsAxiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Types for reviews
export interface Review {
  id: string
  listing_id: string
  reviewer_id: string
  reviewed_id: string
  rating: number
  description: string
  created_at: string
  updated_at: string
}

export interface ReviewPayload {
  rating: number
  description: string
}

export interface ReviewReply {
  id: string
  listing_id: string
  reviewer_id: string
  reviewed_id: string
  rating?: number
  description: string
  created_at: string
  updated_at: string
}

// Reviews API service
export const reviewsApi = {
  // Get reviews for a listing
  getListingReviews: async (listingId: string): Promise<Review[]> => {
    try {
      const response = await publicAxiosInstance.get<Review[]>(`/listings/${listingId}/reviews`)
      return response.data
    } catch (error) {
      console.error("Error fetching listing reviews:", error)
      throw error
    }
  },

  // Get reply for a review
  getReviewReply: async (listingId: string, reviewId: string): Promise<ReviewReply | null> => {
    try {
      const response = await publicAxiosInstance.get<ReviewReply>(`/listings/${listingId}/reviews/${reviewId}/reply`)
      return response.data
    } catch (error) {
      console.error("Error fetching review reply:", error)
      return null
    }
  },

  // Create a review
  createReview: async (listingId: string, payload: ReviewPayload): Promise<Review> => {
    try {
      const response = await publicAxiosInstance.post<Review>(`/listings/${listingId}/reviews`, payload)
      return response.data
    } catch (error) {
      console.error("Error creating review:", error)
      throw error
    }
  },

  // Reply to a review
  replyToReview: async (
    listingId: string,
    reviewId: string,
    payload: { description: string },
  ): Promise<ReviewReply> => {
    try {
      const response = await publicAxiosInstance.post<ReviewReply>(
        `/listings/${listingId}/reviews/${reviewId}/reply`,
        payload,
      )
      return response.data
    } catch (error) {
      console.error("Error replying to review:", error)
      throw error
    }
  },

  // Update a review
  updateReview: async (listingId: string, reviewId: string, payload: ReviewPayload): Promise<Review> => {
    try {
      const response = await publicAxiosInstance.patch<Review>(`/listings/${listingId}/reviews/${reviewId}`, payload)
      return response.data
    } catch (error) {
      console.error("Error updating review:", error)
      throw error
    }
  },

  // Delete a review
  deleteReview: async (listingId: string, reviewId: string): Promise<void> => {
    try {
      await reviewsAxiosInstance.delete(`/listings/${listingId}/reviews/${reviewId}`)
    } catch (error) {
      console.error("Error deleting review:", error)
      throw error
    }
  },
}
