import {
  convertApiListingToFeaturedListing,
  publicAxiosInstance,
  type ApiListingResponse,
  type Booking,
  type FeaturedListing,
} from "../../../api/publicApi"

interface UpdateBookingPayload {
  start_date: string
  end_date: string
  total_amount: number
}

// Tenant API service
export const tenantApi = {
  // Get user's favorited listings
  getSavedListings: async (): Promise<FeaturedListing[]> => {
    try {
      console.log("Fetching saved listings from real API")
      const response = await publicAxiosInstance.get<ApiListingResponse[]>("/listings/favorites")
      console.log(`Received ${response.data?.length} saved listings from API`)
      return response.data && await  Promise.all(response.data.map(convertApiListingToFeaturedListing))
    } catch (error) {
      console.error("Error fetching saved listings:", error)
      return []
    }
  },

  // Save a listing to favorites
  saveListing: async (listingId: string): Promise<void> => {
    try {
      console.log(`Saving listing ${listingId} to favorites`)
      await publicAxiosInstance.post(`/listings/${listingId}/favorites`)
      console.log(`Successfully saved listing ${listingId}`)
    } catch (error) {
      console.error(`Error saving listing ${listingId}:`, error)
      throw error
    }
  },

  // Remove a listing from favorites
  removeSavedListing: async (listingId: string): Promise<void> => {
    try {
      console.log(`Removing listing ${listingId} from favorites`)
      await publicAxiosInstance.delete(`/listings/${listingId}/favorites`)
      console.log(`Successfully removed listing ${listingId} from favorites`)
    } catch (error) {
      console.error(`Error removing listing ${listingId} from favorites:`, error)
      throw error
    }
  },

  // Get recommended listings for a user
  getRecommendedListings: async (userId: string): Promise<FeaturedListing[]> => {
    try {
      console.log(`Fetching recommended listings for user ${userId} from real API`)
      const response = await publicAxiosInstance.get<ApiListingResponse[]>(`/users/${userId}/listings/recommendations`)
      console.log(`Received ${response.data.length} recommended listings from API`)
      return await Promise.all(response.data.map(convertApiListingToFeaturedListing))
    } catch (error) {
      console.error(`Error fetching recommended listings for user ${userId}:`, error)
      return tenantApi.getFeaturedListings()
    }
  },

  // Get trending listings
  getTrendingListings: async (): Promise<FeaturedListing[]> => {
    try {
      console.log("Fetching trending listings from real API")
      const response = await publicAxiosInstance.get<ApiListingResponse[]>("/listings/trending")
      console.log(`Received ${response.data.length} trending listings from API`)
      return await Promise.all(response.data.map(convertApiListingToFeaturedListing))
    } catch (error) {
      console.error("Error fetching trending listings:", error)
      return tenantApi.getFeaturedListings()
    }
  },

  // Get featured listings (fallback for recommendations/trending)
  getFeaturedListings: async (): Promise<FeaturedListing[]> => {
    try {
      console.log("Fetching featured listings from real API")
      const response = await publicAxiosInstance.get<ApiListingResponse[]>("/listings/popular", {
        params: { limit: 8 },
      })
      console.log(`Received ${response.data.length} listings from API`)
      return await Promise.all(response.data.map(convertApiListingToFeaturedListing))
    } catch (error) {
      console.error("Error fetching featured listings:", error)
      throw error
    }
  },

  // Get user bookings
  getUserBookings: async (userId: string): Promise<Booking[]> => {
    try {
      console.log(`Fetching bookings for user ${userId} from real API`)
      const response = await publicAxiosInstance.get<Booking[]>(`/users/${userId}/bookings`)
      console.log(`Received ${response.data?.length} bookings from API`)
      return response.data
    } catch (error) {
      console.error("Error fetching user bookings:", error)
      throw error
    }
  },

  // Create a booking
  createBooking: async (
    listingId: string,
    payload: { start_date: string; end_date: string; total_amount: number }
  ): Promise<Booking> => {
    try {
      payload.start_date = new Date(payload.start_date).toISOString()
      payload.end_date = new Date(payload.end_date).toISOString()
      const response = await publicAxiosInstance.post<Booking>(`/listings/${listingId}/bookings`, payload)
      console.log(`Successfully created booking for listing ${listingId}`)
      return response.data
    } catch (error) {
      console.error("Booking failed:", error)
      throw error
    }
  },

  // Delete a booking
  deleteBooking: async (listingId: string, bookingId: string): Promise<void> => {
    try {
      console.log(`Deleting booking ${bookingId} for listing ${listingId}`)
      await publicAxiosInstance.delete(`/listings/${listingId}/bookings/${bookingId}`)
      console.log(`Successfully deleted booking ${bookingId} for listing ${listingId}`)
    } catch (error) {
      console.error(`Error deleting booking ${bookingId} for listing ${listingId}:`, error)
      throw error
    }
  },

  // Get a single booking
  getBooking: async (listingId: string, bookingId: string): Promise<Booking> => {
    try {
      console.log(`Fetching booking ${bookingId} for listing ${listingId} from real API`)
      const response = await publicAxiosInstance.get<Booking>(`/listings/${listingId}/bookings/${bookingId}`)
      console.log(`Successfully fetched booking ${bookingId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching booking ${bookingId} for listing ${listingId}:`, error)
      throw error
    }
  },

  // Update a booking
  updateBooking: async (
    listingId: string,
    bookingId: string,
    payload: UpdateBookingPayload
  ): Promise<Booking> => {
    try {
      console.log(`Updating booking ${bookingId} for listing ${listingId}`)
      console.log('Request URL:', publicAxiosInstance.defaults.baseURL + `/listings/${listingId}/bookings/${bookingId}`)
      console.log('Payload:', payload)
      payload.start_date = new Date(payload.start_date).toISOString()
      payload.end_date = new Date(payload.end_date).toISOString()
      const response = await publicAxiosInstance.patch<Booking>(
        `/listings/${listingId}/bookings/${bookingId}`,
        payload
      )
      console.log(`Successfully updated booking ${bookingId}`)
      return response.data
    } catch (error) {
      if (error && typeof error === "object") {
        console.error(`Error updating booking ${bookingId} for listing ${listingId}:`, {
          message: (error as any).message,
          code: (error as any).code,
          config: (error as any).config,
          request: (error as any).request ? 'Request made' : 'No request made',
        })
      } else {
        console.error(`Error updating booking ${bookingId} for listing ${listingId}:`, error)
      }
      throw error
    }
  }
}

export type { FeaturedListing, Booking, UpdateBookingPayload }