import axios from "axios"
import { format } from "date-fns"
import config from "../config/api.config"
import { mockPublicApi } from "./mockPublicApi"

// Types for public API responses
export interface FeaturedListing {
  id: string
  title: string
  description: string
  location: string
  price: number
  priceUnit: string
  images: string[]
  category: string
  reviewCount: number
  rating: number
  features?: {
    guests?: number
    bedrooms?: number
    bathrooms?: number
    area?: number
  }
  availability?: {
    startDate: string
    endDate: string
  }[]
}

export interface Testimonial {
  id: string
  name: string
  role: string
  avatar?: string
  comment: string
  rating: number
}

export interface CategoryCount {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  created_at: string
  updated_at: string
  icon?: string
}

// API response types based on the Swagger documentation
export interface ApiListingResponse {
  id: string
  title: string
  description: string
  price: number
  address: string
  city: string
  region: string
  country: string
  status: string
  views_count: number
  owner_id: string
  category_id: string
  category: {
    id: string
    name: string
    slug: string
  }
  media: {
    id: string
    media_type: string
    media_url: string
  }[]
  tags: string[]
  created_at: string
  updated_at: string
  availability_start: string
  availability_end: string
}

export interface ApiCategoryResponse {
  id: string
  name: string
  description: string
  slug: string
  image_url: string
  created_at: string
  updated_at: string
}

// Create axios instance for public API endpoints
const publicAxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
})

// Helper function to convert API response to our app's format
const convertApiListingToFeaturedListing = (apiListing: ApiListingResponse): FeaturedListing => {
  return {
    id: apiListing.id,
    title: apiListing.title,
    description: apiListing.description,
    location: `${apiListing.city}, ${apiListing.region}`,
    price: apiListing.price,
    priceUnit: "month", // Default, could be determined by category or other logic
    category: apiListing.category?.name || "",
    images: apiListing.media?.map((m) => m.media_url) || ["/placeholder.svg?height=200&width=300"],
    rating: 4.5, // Default rating if not provided by API
    reviewCount: 0, // Default review count if not provided by API
    features: {
      // Extract features based on category or other logic
      area: 0,
    },
    availability: [
      {
        startDate: apiListing.availability_start,
        endDate: apiListing.availability_end,
      },
    ],
  }
}

// Helper function to get icon name based on category slug
function getCategoryIcon(slug: string): string {
  const iconMap: Record<string, string> = {
    homes: "housing",
    apartments: "building",
    vehicles: "automotive",
    equipment: "music_equipment",
    spaces: "landmark",
    tools: "tool",
    electronics: "electronics",
    furniture: "office_supplies",
    clothing: "clothing_accessories",
  }

  return iconMap[slug.toLowerCase()] || "box"
}

// Public API service
export const publicApi = {
  // Get featured listings for the homepage
  getFeaturedListings: async (useMockApi = config.useMockApi): Promise<FeaturedListing[]> => {
    try {
      if (useMockApi) {
        console.log("Using mock API for featured listings")
        return mockPublicApi.getFeaturedListings()
      }

      console.log("Fetching featured listings from real API")
      // Use the /listings/popular endpoint from the API
      const response = await publicAxiosInstance.get<ApiListingResponse[]>("/listings/popular", {
        params: { limit: 8 },
      })

      console.log(`Received ${response.data.length} listings from API`)
      return response.data.map(convertApiListingToFeaturedListing)
    } catch (error) {
      console.error("Error fetching featured listings:", error)
      throw error // Throw error instead of returning empty array
    }
  },

  // Get testimonials for the homepage
  getTestimonials: async (useMockApi = config.useMockApi): Promise<Testimonial[]> => {
    try {
      if (useMockApi) {
        console.log("Using mock API for testimonials")
        return mockPublicApi.getTestimonials()
      }

      // Since there's no testimonials endpoint in the API, we'd need to implement this
      // For now, return mock data even when not in mock mode
      console.log("No testimonials endpoint available, using mock data")
      return mockPublicApi.getTestimonials()
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      throw error
    }
  },

  // Get category counts for the homepage
  getCategoryCounts: async (useMockApi = config.useMockApi): Promise<CategoryCount[]> => {
    try {
      if (useMockApi) {
        console.log("Using mock API for categories")
        return mockPublicApi.getCategoryCounts()
      }

      console.log("Fetching categories from real API")
      // Get categories from the API
      const response = await publicAxiosInstance.get<ApiCategoryResponse[]>("/categories")
      console.log(`Received ${response.data.length} categories from API`)

      // Transform to CategoryCount structure
      return response.data.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_url: category.image_url || "/placeholder.svg?height=200&width=200",
        created_at: category.created_at,
        updated_at: category.updated_at,
        icon: getCategoryIcon(category.slug),
      }))
    } catch (error) {
      console.error("Error fetching category counts:", error)
      throw error
    }
  },

  // Update searchListings to properly use the API endpoints
  searchListings: async (
    query: string,
    category?: string,
    startDate?: Date | string,
    endDate?: Date | string,
    useMockApi = config.useMockApi,
  ): Promise<FeaturedListing[]> => {
    try {
      if (useMockApi) {
        console.log("Using mock API for search listings")
        return mockPublicApi.searchListings(
          query,
          category,
          startDate ? formatDate(startDate) : undefined,
          endDate ? formatDate(endDate) : undefined,
        )
      }

      console.log("Searching listings with real API:", { query, category, startDate, endDate })

      // Prepare search parameters
      const params: Record<string, string> = {}
      if (query) params.search = query

      // Add date filtering if provided
      if (startDate) {
        const formattedDate = typeof startDate === "string" ? startDate : formatDate(startDate)
        params.since = formattedDate
      }

      let response

      // If category is provided, use the category-specific endpoint
      if (category && category !== "all") {
        try {
          // First, find the category by slug
          console.log(`Searching for category with slug: ${category}`)
          const categoriesResponse = await publicAxiosInstance.get<ApiCategoryResponse[]>("/categories")

          console.log(`Received ${categoriesResponse.data.length} categories from API`)

          const matchingCategory = categoriesResponse.data.find(
            (cat) => cat.slug.toLowerCase() === category.toLowerCase(),
          )

          if (matchingCategory) {
            console.log(`Found matching category: ${matchingCategory.id} - ${matchingCategory.name}`)
            // Use the category-specific endpoint
            response = await publicAxiosInstance.get<ApiListingResponse[]>(
              `/categories/${matchingCategory.id}/listings`,
              { params },
            )
            console.log(`Received ${response.data.length} listings for category ${matchingCategory.name}`)
          } else {
            console.log("Category not found, falling back to general search")
            // Fallback to general search if category not found
            response = await publicAxiosInstance.get<ApiListingResponse[]>("/listings", { params })
          }
        } catch (error) {
          console.error("Error with category search:", error)
          // Fallback to general search
          response = await publicAxiosInstance.get<ApiListingResponse[]>("/listings", { params })
        }
      } else {
        // General search without category filter
        console.log("Performing general search with params:", params)
        response = await publicAxiosInstance.get<ApiListingResponse[]>("/listings", { params })
        console.log(`Received ${response.data.length} listings from general search`)
      }

      // Convert API response to our format
      return response.data.map(convertApiListingToFeaturedListing)
    } catch (error) {
      console.error("Error searching listings:", error)
      throw error // Throw error instead of returning empty array
    }
  },

  // Check availability for a specific listing
  checkAvailability: async (listingId: string, startDate: string, endDate: string): Promise<boolean> => {
    try {
      if (config.useMockApi) {
        return mockPublicApi.checkAvailability(listingId, startDate, endDate)
      }

      const response = await publicAxiosInstance.get<{ available: boolean }>(`/listings/${listingId}/availability`, {
        params: { startDate, endDate },
      })
      return response.data.available
    } catch (error) {
      console.error("Error checking availability:", error)
      return false
    }
  },
}

// Helper function to format dates for the API
function formatDate(date: Date | string): string {
  if (typeof date === "string") {
    return date
  }
  return format(date, "yyyy-MM-dd")
}

// Helper function to calculate days ago for the API's "since" parameter
function formatDaysAgo(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date)
  }
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays.toString()
}