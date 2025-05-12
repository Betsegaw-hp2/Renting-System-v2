import { v4 as uuidv4 } from "uuid"
import config from "../config/api.config"
import type {
  AdminStats,
  Booking,
  Category,
  CategoryTag,
  Review,
  UserListingStats
} from "../types/listing.types"
import { BookingStatus, ListingStatus, MediaTypes, PaymentStatus } from "../types/listing.types"
import type { FeaturedListing } from "./publicApi"

// Helper to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock categories
const mockCategories: Category[] = [
  {
    id: "1",
    name: "Apartments",
    slug: "apartments",
    description: "Modern living spaces in multi-unit buildings",
    image_url: "/placeholder.svg?height=200&width=200",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Houses",
    slug: "houses",
    description: "Standalone residential buildings for families",
    image_url: "/placeholder.svg?height=200&width=200",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Vacation Rentals",
    slug: "vacation-rentals",
    description: "Short-term stays for holidays and getaways",
    image_url: "/placeholder.svg?height=200&width=200",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Commercial",
    slug: "commercial",
    description: "Office spaces and retail locations for businesses",
    image_url: "/placeholder.svg?height=200&width=200",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock category tags
const mockCategoryTags: CategoryTag[] = [
  { id: "tag1", name: "Pet Friendly" },
  { id: "tag2", name: "Furnished" },
  { id: "tag3", name: "Parking" },
  { id: "tag4", name: "Air Conditioning" },
  { id: "tag5", name: "Balcony" },
  { id: "tag6", name: "Pool" },
  { id: "tag7", name: "Gym" },
  { id: "tag8", name: "Elevator" },
  { id: "tag9", name: "Wheelchair Accessible" },
  { id: "tag10", name: "Washer/Dryer" },
]

// Generate mock listings
const generateMockListings = (count: number): FeaturedListing[] => {
  const listings: FeaturedListing[] = []

  for (let i = 0; i < count; i++) {
    const categoryIndex = Math.floor(Math.random() * mockCategories.length)
    const category = mockCategories[categoryIndex]

    // Generate random tags (1-4 tags per listing)
    const tagCount = Math.floor(Math.random() * 4) + 1
    const tags: string[] = []
    for (let j = 0; j < tagCount; j++) {
      const tagIndex = Math.floor(Math.random() * mockCategoryTags.length)
      const tag = mockCategoryTags[tagIndex].id
      if (!tags.includes(tag)) {
        tags.push(tag)
      }
    }

    // Generate 1-3 media items per listing
    const mediaCount = Math.floor(Math.random() * 3) + 1
    const media = []
    for (let j = 0; j < mediaCount; j++) {
      media.push({
        id: uuidv4(),
        media_type: MediaTypes.IMAGE,
        media_url: `/placeholder.svg?height=${200 + j * 50}&width=${300 + j * 50}`,
      })
    }

    // Generate random price between $500 and $3000
    const price = Math.floor(Math.random() * 2500) + 500

    // Generate random views count between 10 and 500
    const viewsCount = Math.floor(Math.random() * 490) + 10

    // Generate random dates for availability
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30))

    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 30 + Math.floor(Math.random() * 90))

    // Generate random created_at date in the past 90 days
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 90))

    const listing: FeaturedListing = {
      id: uuidv4(),
      title: `${category.name.slice(0, -1)} ${i + 1} in Downtown`,
      description: `Beautiful ${category.name.toLowerCase().slice(0, -1)} with amazing views and modern amenities.`,
      price,
      address: `${100 + i} Main Street`,
      city: "Metropolis",
      region: "State",
      country: "United States",
      owner_id: i % 3 === 0 ? "3" : "1", // Assign to admin or owner
      status: ListingStatus.AVAILABLE,
      availability: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      reviewCount: Math.floor(Math.random() * 100) + 1,
      created_at: createdAt.toISOString(),
      updated_at: new Date().toISOString(),
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      media,
      tags,
    }

    listings.push(listing)
  }

  return listings
}

// Generate mock trending listings
const generateTrendingListings = (listings: FeaturedListing[]) => {
  return listings.slice(0, 5).map((listing) => {
    const bookingsCount = Math.floor(Math.random() * 20) + 5
    const interactionsCount = Math.floor(Math.random() * 100) + 20
    const trendingScore = (listing?.reviewCount || 0 * 0.3 + bookingsCount * 0.5 + interactionsCount * 0.2) / 100

    return {
      ...listing,
      bookings_count: bookingsCount,
      interactions_count: interactionsCount,
      trending_score: Number.parseFloat(trendingScore.toFixed(2)),
    }
  })
}

// Generate mock bookings
const generateMockBookings = (userId: string, count: number): Booking[] => {
  const bookings: Booking[] = []
  const mockListings = generateMockListings(count)

  for (let i = 0; i < count; i++) {
    const listing = mockListings[i]
    const isCompleted = i % 3 === 0
    const isUpcoming = i % 3 === 1

    // Generate dates
    const startDate = new Date()
    if (isCompleted) {
      startDate.setDate(startDate.getDate() - 30 - Math.floor(Math.random() * 60))
    } else if (isUpcoming) {
      startDate.setDate(startDate.getDate() + 7 + Math.floor(Math.random() * 30))
    } else {
      startDate.setDate(startDate.getDate() - 7)
    }

    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 7 + Math.floor(Math.random() * 14))

    // Calculate total amount based on days and price
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalAmount = listing.price * days

    const booking: Booking = {
      id: uuidv4(),
      listing_id: listing.id,
      renter_id: userId,
      owner_id: listing.owner_id,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      total_amount: totalAmount,
      status: isCompleted ? BookingStatus.COMPLETED : isUpcoming ? BookingStatus.BOOKED : BookingStatus.PENDING,
      payment_status: isCompleted
        ? PaymentStatus.COMPLETED
        : isUpcoming
          ? PaymentStatus.IN_ESCROW
          : PaymentStatus.PENDING,
      payment_reference: `PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      created_at: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }

    bookings.push(booking)
  }

  return bookings
}

// Generate mock reviews
const generateMockReviews = (userId: string, count: number): Review[] => {
  const reviews: Review[] = []
  const mockListings = generateMockListings(count)

  for (let i = 0; i < count; i++) {
    const listing = mockListings[i]
    const rating = Math.floor(Math.random() * 2) + 4 // 4-5 stars

    const review: Review = {
      id: uuidv4(),
      listing_id: listing.id,
      reviewer_id: userId,
      reviewed_id: listing.owner_id,
      rating,
      description: `Great ${listing.category.name.toLowerCase().slice(0, -1)}! ${rating === 5 ? "Highly recommended!" : "Would stay again."}`,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }

    reviews.push(review)
  }

  return reviews
}

// Mock listings
const mockListings = generateMockListings(20)
const mockTrendingListings = generateTrendingListings(mockListings)

// Mock API implementation
export const mockHomeApi = {
  // Get recommended listings for a user
  getRecommendedListings: async (userId: string, limit = 8): Promise<FeaturedListing[]> => {
    await delay(config.mockApiDelay)

    // In a real implementation, this would use the user's preferences and history
    // For mock purposes, we'll just return a subset of listings
    return mockListings.slice(0, limit)
  },

  // Get trending listings
  getTrendingListings: async (limit = 4): Promise<FeaturedListing[]> => {
    await delay(config.mockApiDelay)
    return mockTrendingListings.slice(0, limit)
  },

  // Get user's listings (for owners)
  getUserListings: async (userId: string, limit = 10): Promise<FeaturedListing[]> => {
    await delay(config.mockApiDelay)

    // Filter listings by owner_id
    const userListings = mockListings.filter((listing) => listing.owner_id === userId)
    return userListings.slice(0, limit)
  },

  // Get user's rental history (for tenants)
  getUserRentalHistory: async (userId: string, limit = 10): Promise<Booking[]> => {
    await delay(config.mockApiDelay)

    return generateMockBookings(userId, limit)
  },

  // Get user's listing stats (for owners)
  getUserListingStats: async (userId: string): Promise<UserListingStats> => {
    await delay(config.mockApiDelay)

    const userListings = mockListings.filter((listing) => listing.owner_id === userId)
    const activeListings = userListings.filter((listing) => listing.status === ListingStatus.AVAILABLE)

    return {
      total_listings: userListings.length,
      active_listings: activeListings.length,
      total_views: userListings.reduce((sum, listing) => sum + (listing?.reviewCount||0), 0),
      total_bookings: Math.floor(Math.random() * 50) + 10,
      average_rating: 4.7,
      total_reviews: Math.floor(Math.random() * 30) + 5,
      recent_views: Math.floor(Math.random() * 100) + 20,
      recent_bookings: Math.floor(Math.random() * 10) + 1,
    }
  },

  // Get admin stats
  getAdminStats: async (): Promise<AdminStats> => {
    await delay(config.mockApiDelay)

    return {
      total_users: 1245,
      total_listings: 876,
      active_rentals: 342,
      new_users_this_month: 87,
      new_listings_this_month: 54,
      revenue: 128750,
    }
  },

  // Get categories with counts
  getCategoriesWithCounts: async (): Promise<{ category: Category; count: number }[]> => {
    await delay(config.mockApiDelay)

    return mockCategories.map((category) => {
      const count = Math.floor(Math.random() * 200) + 50
      return { category, count }
    })
  },

  // Search listings
  searchListings: async (query: string, filters?: Record<string, any>): Promise<FeaturedListing[]> => {
    await delay(config.mockApiDelay)

    // Simple search implementation for mock purposes
    const results = mockListings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(query.toLowerCase()) ||
        listing.description.toLowerCase().includes(query.toLowerCase()) ||
        listing.city.toLowerCase().includes(query.toLowerCase()),
    )

    return results
  },

  // Get user reviews
  getUserReviews: async (userId: string, limit = 5): Promise<Review[]> => {
    await delay(config.mockApiDelay)

    return generateMockReviews(userId, limit)
  },
}
