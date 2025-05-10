import type { ListingWithCategory } from "../types/listing.types"

// Extend the existing FeaturedListing type to match ListingWithCategory
export interface FeaturedListing extends ListingWithCategory {
  // Additional properties specific to featured listings
  priceUnit: string
  reviewCount: number
  rating: number
  features?: {
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
  avatar?: string
  comment: string
  rating: number
}

export interface CategoryCount {
  category: string
  count: number
  icon: string
}

// Mock API implementation
export const publicApi = {
  getFeaturedListings: async (): Promise<FeaturedListing[]> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Generate mock featured listings that match ListingWithCategory structure
    return Array.from({ length: 8 }, (_, i) => ({
      id: `listing-${i + 1}`,
      title: `Beautiful ${i % 2 === 0 ? "Apartment" : "House"} in ${["Downtown", "Uptown", "Westside", "Eastside"][i % 4]}`,
      description: `This is a beautiful ${i % 2 === 0 ? "apartment" : "house"} with amazing views and modern amenities.`,
      price: 1200 + i * 300,
      priceUnit: "month",
      address: `${100 + i} Main Street`,
      city: ["New York", "Los Angeles", "Chicago", "Miami"][i % 4],
      region: ["NY", "CA", "IL", "FL"][i % 4],
      country: "USA",
      owner_id: `owner-${i}`,
      category_id: `category-${i % 3}`,
      category: {
        id: `category-${i % 3}`,
        name: ["Apartment", "House", "Condo"][i % 3],
        slug: ["apartment", "house", "condo"][i % 3],
      },
      status: "available",
      availability_start: new Date().toISOString(),
      availability_end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      views_count: Math.floor(Math.random() * 100),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      media: [
        {
          id: `media-${i}-1`,
          media_type: "image",
          media_url: `/placeholder.svg?height=300&width=400&text=Property+${i + 1}`,
        },
      ],
      tags: [`tag-${i % 5}`, `tag-${(i + 2) % 5}`],
      rating: 4 + Math.random(),
      reviewCount: Math.floor(Math.random() * 50) + 5,
      features: {
        guests: Math.floor(Math.random() * 6) + 1,
        bedrooms: Math.floor(Math.random() * 4) + 1,
        bathrooms: Math.floor(Math.random() * 3) + 1,
        area: Math.floor(Math.random() * 1000) + 500,
      },
    }))
  },

  getTestimonials: async (): Promise<Testimonial[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600))

    return [
      {
        id: "1",
        name: "John Smith",
        role: "Tenant",
        avatar: "/placeholder.svg?height=40&width=40&text=JS",
        comment:
          "I found my dream apartment through this platform. The process was smooth and the owner was very responsive.",
        rating: 5,
      },
      {
        id: "2",
        name: "Sarah Johnson",
        role: "Property Owner",
        avatar: "/placeholder.svg?height=40&width=40&text=SJ",
        comment:
          "As a property owner, I've had great experiences with tenants from this platform. The verification process gives me peace of mind.",
        rating: 4,
      },
      {
        id: "3",
        name: "Michael Brown",
        role: "Tenant",
        avatar: "/placeholder.svg?height=40&width=40&text=MB",
        comment:
          "The variety of listings is impressive. I was able to find exactly what I was looking for within my budget.",
        rating: 5,
      },
    ]
  },

  getCategoryCounts: async (): Promise<CategoryCount[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    return [
      { category: "Apartments", count: 245, icon: "building" },
      { category: "Houses", count: 187, icon: "home" },
      { category: "Condos", count: 132, icon: "hotel" },
      { category: "Vehicles", count: 98, icon: "car" },
      { category: "Equipment", count: 76, icon: "tool" },
      { category: "Event Spaces", count: 54, icon: "calendar" },
    ]
  },
}