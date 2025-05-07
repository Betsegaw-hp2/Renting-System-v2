import config from "../config/api.config"
import type { CategoryCount, FeaturedListing, Testimonial } from "./publicApi"

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
    category: "Apartment",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.9,
    reviewCount: 124,
    features: {
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
    },
  },
  {
    id: "2",
    title: "Professional Camera Equipment",
    description: "High-end camera equipment for professional photography and videography.",
    location: "Los Angeles, CA",
    price: 150,
    priceUnit: "day",
    category: "Equipment",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.8,
    reviewCount: 89,
    features: {
      area: 0,
    },
  },
  {
    id: "3",
    title: "Luxury Penthouse Suite",
    description: "Spacious penthouse with panoramic views and premium furnishings.",
    location: "Los Angeles, CA",
    price: 5000,
    priceUnit: "month",
    category: "Penthouse",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 5.0,
    reviewCount: 56,
    features: {
      guests: 6,
      bedrooms: 3,
      bathrooms: 3,
    },
  },
  {
    id: "4",
    title: "Vintage Car Collection",
    description: "Classic cars from the 1960s and 1970s available for events and photoshoots.",
    location: "Miami, FL",
    price: 500,
    priceUnit: "day",
    category: "Vehicles",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.7,
    reviewCount: 42,
    features: {
      area: 0,
    },
  },
  {
    id: "5",
    title: "Cozy Beach House",
    description: "Beautiful beach house with direct access to the ocean.",
    location: "Miami, FL",
    price: 3200,
    priceUnit: "month",
    category: "House",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.8,
    reviewCount: 89,
    features: {
      guests: 6,
      bedrooms: 3,
      bathrooms: 2,
    },
  },
  {
    id: "6",
    title: "Event Space for Conferences",
    description: "Large event space perfect for conferences, weddings, and corporate events.",
    location: "Chicago, IL",
    price: 2000,
    priceUnit: "day",
    category: "Venue",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.6,
    reviewCount: 35,
    features: {
      guests: 200,
      area: 5000,
    },
  },
  {
    id: "7",
    title: "Charming Cottage",
    description: "Quaint cottage with rustic charm and modern comforts.",
    location: "Portland, OR",
    price: 1800,
    priceUnit: "month",
    category: "Cottage",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.7,
    reviewCount: 42,
    features: {
      guests: 3,
      bedrooms: 2,
      bathrooms: 1,
    },
  },
  {
    id: "8",
    title: "DJ Equipment Package",
    description: "Complete DJ setup including speakers, mixers, and lighting.",
    location: "Austin, TX",
    price: 200,
    priceUnit: "day",
    category: "Equipment",
    images: ["/placeholder.svg?height=200&width=300"],
    rating: 4.9,
    reviewCount: 28,
    features: {
      area: 0,
    },
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
    category: "Apartments",
    count: 1245,
    icon: "building",
  },
  {
    category: "Houses",
    count: 853,
    icon: "home",
  },
  {
    category: "Equipment",
    count: 621,
    icon: "camera",
  },
  {
    category: "Vehicles",
    count: 432,
    icon: "car",
  },
  {
    category: "Venues",
    count: 317,
    icon: "landmark",
  },
  {
    category: "Storage",
    count: 289,
    icon: "package",
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

  searchListings: async (query: string, location?: string): Promise<FeaturedListing[]> => {
    await delay(config.mockApiDelay)

    // Simple mock search implementation
    return mockFeaturedListings
      .filter((listing) => {
        const matchesQuery =
          !query ||
          listing.title.toLowerCase().includes(query.toLowerCase()) ||
          listing.description.toLowerCase().includes(query.toLowerCase()) ||
          listing.category.toLowerCase().includes(query.toLowerCase())

        const matchesLocation = !location || listing.location.toLowerCase().includes(location.toLowerCase())

        return matchesQuery && matchesLocation
      })
      .slice(0, 4) // Return limited results for public search
  },
}
