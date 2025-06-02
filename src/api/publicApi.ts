import type { ListingStatus } from "@/types/listing.types"
import { format } from "date-fns"
import config from "../config/api.config"
import apiClient from "./client"
import { mockPublicApi } from "./mockPublicApi"

// Types for public API responses
export interface FeaturedListing {
  id: string
  title: string
  description: string
  address: string
  city: string
  region: string
  country: string
  price: number
  status: ListingStatus
  availability: {
    startDate: string
    endDate: string
  }
  media: {
    id: string
    media_type: 'image' | 'video' | string // or just 'image' if you only expect images
    media_url: string
  }[]
  category: {
    id: string
    slug: string
    name: string
  }
  tags: string[]
  owner_id: string
  created_at: string
  updated_at: string

  // Optional frontend-calculated props
  reviewCount?: number
  rating?: number
  features?: {
    guests?: number
    bedrooms?: number
    bathrooms?: number
    area?: number
  },
  views_count: number
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
  status: ListingStatus
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

export interface Booking {
  booking: any
  id: string
  listing_id: string
  renter_id: string
  owner_id: string
  start_date: string
  end_date: string
  total_amount: number
  status: "pending" | "booked" | "completed" | "cancelled"
  payment_status: "pending" | "completed" | "in_escrow" | "disputed" | "failed"
  payment_reference: string
  created_at: string
  updated_at: string
}

export const publicAxiosInstance = apiClient

// Helper function to convert API response to our app's format
export const convertApiListingToFeaturedListing = async (apiListing: ApiListingResponse): Promise<FeaturedListing> => {
  if(apiListing && apiListing.category_id) {
    const category = await publicAxiosInstance.get<ApiCategoryResponse>(`/categories/${apiListing.category_id}`)
    apiListing.category = {
      id: category.data.id,
      name: category.data.name,
      slug: category.data.slug,
    }
  }

  return {
    id: apiListing.id,
    title: apiListing.title,
    description: apiListing.description,
    address: apiListing.address,
    city: apiListing.city,
    region: apiListing.region,
    country: apiListing.country,
    price: apiListing.price,
    status: apiListing.status,
    availability: {
      startDate: apiListing.availability_start,
      endDate: apiListing.availability_end,
    },
    media: apiListing.media?.map((m) => ({
      id: m.id,
      media_type: m.media_type,
      media_url: m.media_url,
    })) || [],
    category: {
      id: apiListing.category?.id || '',
      slug: apiListing.category?.slug || '',
      name: apiListing.category?.name || '',
    },
    tags: apiListing.tags || [],
    owner_id: apiListing.owner_id,
    created_at: apiListing.created_at,
    updated_at: apiListing.updated_at,
    views_count: apiListing.views_count,
    // Optional fallback values
    rating: 4.5,
    reviewCount: 0,
    features: {
      area: 0,
    },
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

  getCountries: async (): Promise<Record<string, string>> => {
    try {
      const response = await publicAxiosInstance.get<Record<string, string>>("/countries")
      return response.data
    } catch (error) {
      console.error("Error fetching countries:", error)
      throw error
    }
  },

  // Get featured listings for the homepage
  getFeaturedListings: async (useMockApi = config.useMockApi): Promise<FeaturedListing[]> => {
    try {
      // if (useMockApi) {
      //   console.log("Using mock API for featured listings")
      //   // Commenting out mock API usage
      //   // return mockPublicApi.getFeaturedListings()
      // }

      console.log("Fetching featured listings from real API")
      // Use the /listings/popular endpoint from the API
      const response = await publicAxiosInstance.get<ApiListingResponse[]>("/listings/popular", {
        params: { limit: 8 },
      })

      console.log(`Received ${response.data.length} listings from API`)
      return await Promise.all(response.data.map(convertApiListingToFeaturedListing))
    } catch (error) {
      console.error("Error fetching featured listings:", error)
      throw error // Throw error instead of returning empty array
    }
  },

  increaseListingViews: async (listingId: string): Promise<void> => {
    try {
      console.log(`Increasing views for listing ${listingId}`)
      await publicAxiosInstance.post(`/listings/${listingId}/view`)
      console.log(`Successfully increased views for listing ${listingId}`)
    } catch (error) {
      console.error("Error increasing listing views:", error)
      throw error
    }
  },

  // get listing by Id ...
  getListingById: async (listingId: string): Promise<FeaturedListing> => {
    try {
      const response = await publicAxiosInstance.get<ApiListingResponse>(`/listings/${listingId}`)
      return await convertApiListingToFeaturedListing(response.data)
    } catch (error) {
      console.error("Error fetching listing by ID:", error)
      throw error
    }
  },

  // Get testimonials for the homepage
  getTestimonials: async (useMockApi = config.useMockApi): Promise<Testimonial[]> => {
    try {
      if (useMockApi) {
        console.log("Using mock API for testimonials")
        // Commenting out mock API usage
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
        // Commenting out mock API usage
        // return mockPublicApi.getCategoryCounts()
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


searchListings: async (
    query: string,
    category?: string,
    startDate?: Date | string,
    endDate?: Date | string,
    useMockApi = config.useMockApi,
    minPrice?: number,
    maxPrice?: number,
    city?: string,
  ): Promise<FeaturedListing[]> => {
    try {
      if (useMockApi) {
        console.log("Using mock API for search listings")
        // Commenting out mock API usage
        // return mockPublicApi.searchListings(
        //   query,
        //   category,
        //   startDate ? formatDate(startDate) : undefined,
        //   endDate ? formatDate(endDate) : undefined,
        // )
      }      console.log("Searching listings with real API:", { query, category, startDate, endDate, minPrice, maxPrice, city })

      // Prepare search parameters
      const params: Record<string, string> = {}
      if (query) params.search = query      // Add date filtering if provided
      if (startDate) {
        const formattedDate = typeof startDate === "string" ? startDate : formatDate(startDate)
        params.since = formattedDate
      }

      // Add price filtering if provided
      if (minPrice !== undefined) params.min_price = minPrice.toString()
      if (maxPrice !== undefined) params.max_price = maxPrice.toString()
      
      // Add city filtering if provided
      if (city) params.city = city

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
            response = await publicAxiosInstance.get<ApiListingResponse[]>(`/categories/${matchingCategory.id}/listings`, {
              params,
            })
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
      }

      console.log(`Received ${response.data.length} listings from search API`)
      return await Promise.all(response.data.map(convertApiListingToFeaturedListing))
    } catch (error) {
      console.error("Error during searchListings:", error)
      throw error
    }
  },
}

function formatDate(date: Date): string {
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
