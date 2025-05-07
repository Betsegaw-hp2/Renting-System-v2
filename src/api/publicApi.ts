import axios from "axios"
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
  category: string
  images: string[]
  rating: number
  reviewCount: number
  features: {
    guests?: number
    bedrooms?: number
    bathrooms?: number
    area?: number
  }
}

export interface Testimonial {
  id: string
  name: string
  role: string
  comment: string
  rating: number
  avatar?: string
}

export interface CategoryCount {
  category: string
  count: number
  icon: string
}

// Create axios instance for public API endpoints
const publicAxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
})

// Public API service
export const publicApi = {
  // Get featured listings for the homepage
  getFeaturedListings: async (): Promise<FeaturedListing[]> => {
    try {
      if (config.useMockApi) {
        return mockPublicApi.getFeaturedListings()
      }

      const response = await publicAxiosInstance.get<FeaturedListing[]>("/listings/featured")
      return response.data
    } catch (error) {
      console.error("Error fetching featured listings:", error)
      return []
    }
  },

  // Get testimonials for the homepage
  getTestimonials: async (): Promise<Testimonial[]> => {
    try {
      if (config.useMockApi) {
        return mockPublicApi.getTestimonials()
      }

      const response = await publicAxiosInstance.get<Testimonial[]>("/testimonials")
      return response.data
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      return []
    }
  },

  // Get category counts for the homepage
  getCategoryCounts: async (): Promise<CategoryCount[]> => {
    try {
      if (config.useMockApi) {
        return mockPublicApi.getCategoryCounts()
      }

      const response = await publicAxiosInstance.get<CategoryCount[]>("/categories/counts")
      return response.data
    } catch (error) {
      console.error("Error fetching category counts:", error)
      return []
    }
  },

  // Search listings (public endpoint with limited results)
  searchListings: async (query: string, location?: string): Promise<FeaturedListing[]> => {
    try {
      if (config.useMockApi) {
        return mockPublicApi.searchListings(query, location)
      }

      const response = await publicAxiosInstance.get<FeaturedListing[]>("/listings/search", {
        params: { query, location },
      })
      return response.data
    } catch (error) {
      console.error("Error searching listings:", error)
      return []
    }
  },
}
