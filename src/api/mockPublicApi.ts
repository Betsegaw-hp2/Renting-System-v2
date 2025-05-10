import config from "../config/api.config"
import type { CategoryCount, FeaturedListing, Testimonial } from "./publicApi"
import { isWithinInterval, parseISO } from "date-fns"

// Helper to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock featured listings
const mockFeaturedListings: FeaturedListing[] = [
  {
    id: "1",
    title: "Modern Apartment with City View",
    description: "Luxurious apartment with stunning city views and modern amenities.",
    location: "New York, NY",
    price: 2500,
    priceUnit: "month",
    category: "homes",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.9,
    reviewCount: 124,
    features: {
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
    },
    availability: [
      {
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      },
    ],
  },
  {
    id: "2",
    title: "Professional Camera Equipment",
    description: "High-end camera equipment for professional photography and videography.",
    location: "Los Angeles, CA",
    price: 150,
    priceUnit: "day",
    category: "equipment",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.8,
    reviewCount: 89,
    features: {
      area: 0,
    },
    availability: [
      {
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      },
    ],
  },
  {
    id: "3",
    title: "Luxury Penthouse Suite",
    description: "Spacious penthouse with panoramic views and premium furnishings.",
    location: "Los Angeles, CA",
    price: 5000,
    priceUnit: "month",
    category: "homes",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 5.0,
    reviewCount: 56,
    features: {
      guests: 6,
      bedrooms: 3,
      bathrooms: 3,
    },
    availability: [
      {
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      },
    ],
  },
  {
    id: "4",
    title: "Vintage Car Collection",
    description: "Classic cars from the 1960s and 1970s available for events and photoshoots.",
    location: "Miami, FL",
    price: 500,
    priceUnit: "day",
    category: "vehicles",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.7,
    reviewCount: 42,
    features: {
      area: 0,
    },
    availability: [
      {
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      },
    ],
  },
  {
    id: "5",
    title: "Cozy Beach House",
    description: "Beautiful beach house with direct access to the ocean.",
    location: "Miami, FL",
    price: 3200,
    priceUnit: "month",
    category: "homes",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.8,
    reviewCount: 89,
    features: {
      guests: 6,
      bedrooms: 3,
      bathrooms: 2,
    },
    availability: [
      {
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      },
    ],
  },
  {
    id: "6",
    title: "Event Space for Conferences",
    description: "Large event space perfect for conferences, weddings, and corporate events.",
    location: "Chicago, IL",
    price: 2000,
    priceUnit: "day",
    category: "spaces",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.6,
    reviewCount: 35,
    features: {
      guests: 200,
      area: 5000,
    },
    availability: [
      {
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      },
    ],
  },
  {
    id: "7",
    title: "Charming Cottage",
    description: "Quaint cottage with rustic charm and modern comforts.",
    location: "Portland, OR",
    price: 1800,
    priceUnit: "month",
    category: "homes",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.7,
    reviewCount: 42,
    features: {
      guests: 3,
      bedrooms: 2,
      bathrooms: 1,
    },
    availability: [
      {
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      },
    ],
  },
  {
    id: "8",
    title: "DJ Equipment Package",
    description: "Complete DJ setup including speakers, mixers, and lighting.",
    location: "Austin, TX",
    price: 200,
    priceUnit: "day",
    category: "equipment",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.9,
    reviewCount: 28,
    features: {
      area: 0,
    },
    availability: [
      {
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      },
    ],
  },
  {
    id: "9",
    title: "Gaming PC Setup",
    description: "High-end gaming PC with multiple monitors and accessories.",
    location: "Seattle, WA",
    price: 100,
    priceUnit: "day",
    category: "electronics",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.8,
    reviewCount: 36,
    features: {
      area: 0,
    },
    availability: [
      {
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      },
    ],
  },
  {
    id: "10",
    title: "Luxury Furniture Set",
    description: "Designer furniture set perfect for home staging or events.",
    location: "Boston, MA",
    price: 300,
    priceUnit: "week",
    category: "furniture",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.5,
    reviewCount: 22,
    features: {
      area: 0,
    },
    availability: [
      {
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      },
    ],
  },
  {
    id: "11",
    title: "Power Tools Collection",
    description: "Complete set of professional power tools for construction and DIY projects.",
    location: "Denver, CO",
    price: 150,
    priceUnit: "day",
    category: "tools",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.7,
    reviewCount: 41,
    features: {
      area: 0,
    },
    availability: [
      {
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      },
    ],
  },
  {
    id: "12",
    title: "Designer Clothing Collection",
    description: "High-end designer clothing for special events and photoshoots.",
    location: "New York, NY",
    price: 250,
    priceUnit: "day",
    category: "clothing",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.9,
    reviewCount: 18,
    features: {
      area: 0,
    },
    availability: [
      {
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      },
    ],
  },
]

// Mock testimonials
const mockTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Tenant",
    comment:
      "I found my dream apartment in just two days using All-in-One Rental Place. The process was incredibly smooth, and I love my new place!",
    rating: 5,
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Property Owner",
    comment:
      "As a property owner, I've tried many platforms, but All-in-One Rental Place has been the most effective for finding reliable tenants quickly.",
    rating: 5,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "Equipment Renter",
    comment:
      "The virtual tours saved me so much time. I was able to narrow down my options before scheduling in-person viewings.",
    rating: 4,
  },
  {
    id: "4",
    name: "David Wilson",
    role: "Event Planner",
    comment:
      "I regularly rent event spaces for my clients, and this platform has made the process so much easier. Great selection and transparent pricing!",
    rating: 5,
  },
]

// Mock category counts
const mockCategoryCounts: CategoryCount[] = [
  {
    name: "Homes",
    icon: "home",
    id: "",
    slug: "",
    description: "",
    image_url: "",
    created_at: "",
    updated_at: ""
  },
  {
    name: "Vehicles",
    icon: "car",
    id: "",
    slug: "",
    description: "",
    image_url: "",
    created_at: "",
    updated_at: ""
  },
  {
    name: "Equipment",
    icon: "camera",
    id: "",
    slug: "",
    description: "",
    image_url: "",
    created_at: "",
    updated_at: ""
  },
  {
    name: "Spaces",
    icon: "landmark",
    id: "",
    slug: "",
    description: "",
    image_url: "",
    created_at: "",
    updated_at: ""
  },
  {
    name: "Tools",
    icon: "tool",
    id: "",
    slug: "",
    description: "",
    image_url: "",
    created_at: "",
    updated_at: ""
  },
  {
    name: "Electronics",
    icon: "electronics",
    id: "",
    slug: "",
    description: "",
    image_url: "",
    created_at: "",
    updated_at: ""
  },
  {
    name: "Furniture",
    icon: "building",
    id: "",
    slug: "",
    description: "",
    image_url: "",
    created_at: "",
    updated_at: ""
  },
  {
    name: "Clothing",
    icon: "shirt",
    id: "",
    slug: "",
    description: "",
    image_url: "",
    created_at: "",
    updated_at: ""
  },
]

// Mock public API implementation
export const mockPublicApi = {
  getFeaturedListings: async (): Promise<FeaturedListing[]> => {
    await delay(config.mockApiDelay)
    return mockFeaturedListings
  },

  getTestimonials: async (): Promise<Testimonial[]> => {
    await delay(config.mockApiDelay)
    return mockTestimonials
  },

  getCategoryCounts: async (): Promise<CategoryCount[]> => {
    await delay(config.mockApiDelay)
    return mockCategoryCounts
  },

  searchListings: async (
    query: string,
    category?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<FeaturedListing[]> => {
    await delay(config.mockApiDelay)

    // Simple mock search implementation
    return mockFeaturedListings.filter((listing) => {
      // Filter by search query
      const matchesQuery =
        !query ||
        listing.title.toLowerCase().includes(query.toLowerCase()) ||
        listing.description.toLowerCase().includes(query.toLowerCase()) ||
        listing.category.toLowerCase().includes(query.toLowerCase())

      // Filter by category
      const matchesCategory =
        !category || category === "all" || listing.category.toLowerCase() === category.toLowerCase()

      // Filter by date range if provided
      let matchesDateRange = true
      if (startDate && endDate && listing.availability) {
        const requestedStart = parseISO(startDate)
        const requestedEnd = parseISO(endDate)

        // Check if any of the listing's availability periods overlap with the requested period
        matchesDateRange = listing.availability.some((period) => {
          const availableStart = parseISO(period.startDate)
          const availableEnd = parseISO(period.endDate)

          // Check if the requested period is within an available period
          return (
            isWithinInterval(requestedStart, { start: availableStart, end: availableEnd }) &&
            isWithinInterval(requestedEnd, { start: availableStart, end: availableEnd })
          )
        })
      }

      return matchesQuery && matchesCategory && matchesDateRange
    })
  },

  checkAvailability: async (listingId: string, startDate: string, endDate: string): Promise<boolean> => {
    await delay(config.mockApiDelay)

    const listing = mockFeaturedListings.find((l) => l.id === listingId)
    if (!listing || !listing.availability) {
      return false
    }

    const requestedStart = parseISO(startDate)
    const requestedEnd = parseISO(endDate)

    // Check if any of the listing's availability periods overlap with the requested period
    return listing.availability.some((period) => {
      const availableStart = parseISO(period.startDate)
      const availableEnd = parseISO(period.endDate)

      // Check if the requested period is within an available period
      return (
        isWithinInterval(requestedStart, { start: availableStart, end: availableEnd }) &&
        isWithinInterval(requestedEnd, { start: availableStart, end: availableEnd })
      )
    })
  },
}
