// Using string literal types instead of enums to avoid the 'erasableSyntaxOnly' error
import { type User } from "./user.types"

export type ListingStatus = "available" | "booked" | "inactive"
export const ListingStatus = {
  AVAILABLE: "available" as ListingStatus,
  BOOKED: "booked" as ListingStatus,
  INACTIVE: "inactive" as ListingStatus,
}

export type MediaTypes = "image" | "video"
export const MediaTypes = {
  IMAGE: "image" as MediaTypes,
  VIDEO: "video" as MediaTypes,
}

export interface ListingMedia {
  id: string
  media_type: MediaTypes
  media_url: string
}

export interface CategoryBasic {
  id: string
  name: string
  slug: string
}

export interface Category extends CategoryBasic {
  description: string
  image_url: string
  created_at: string
  updated_at: string
}

export interface CategoryTag {
  id: string
  name: string
}

export interface Listing {
  id: string
  title: string
  description: string
  price: number
  address: string
  city: string
  region: string
  country: string
  owner_id: string
  category_id: string
  status: ListingStatus
  availability_start: string
  availability_end: string
  views_count: number
  created_at: string
  updated_at: string
}

export interface ListingWithCategory extends Listing {
  category: CategoryBasic
  media: ListingMedia[]
  tags: string[]
}

export interface TrendingListing extends ListingWithCategory {
  bookings_count: number
  interactions_count: number
  trending_score: number
}

export interface CreateListing {
  title: string
  description: string
  price: number
  address: string
  city: string
  region: string
  country: string
  category_id: string
  status?: ListingStatus
  availability_start: string
  availability_end: string
}

export interface UpdateListing {
  title?: string
  description?: string
  price?: number
  address?: string
  city?: string
  region?: string
  country?: string
  category_id?: string
  status?: ListingStatus
  availability_start?: string
  availability_end?: string
}

export type BookingStatus = "pending" | "booked" | "completed" | "cancelled" | "confirmed"
export const BookingStatus = {
  PENDING: "pending" as BookingStatus,
  BOOKED: "booked" as BookingStatus,
  COMPLETED: "completed" as BookingStatus,
  CANCELLED: "cancelled" as BookingStatus,
  CONFIRMED: "confirmed" as BookingStatus,
}

export type PaymentStatus = "pending" | "completed" | "in_escrow" | "disputed" | "failed"
export const PaymentStatus = {
  PENDING: "pending" as PaymentStatus,
  COMPLETED: "completed" as PaymentStatus,
  IN_ESCROW: "in_escrow" as PaymentStatus,
  DISPUTED: "disputed" as PaymentStatus,
  FAILED: "failed" as PaymentStatus,
}

export interface Booking {
  id: string
  listing_id: string
  renter_id: string
  owner_id: string
  start_date: string
  end_date: string
  total_amount: number
  status: BookingStatus
  payment_status: PaymentStatus
  payment_reference: string
  created_at: string
  updated_at: string
  renter?: User
}

export interface Review {
  id: string
  listing_id: string
  reviewer?: User
  reviewer_id: string
  reviewed_id: string
  rating: number
  description: string
  created_at: string
  updated_at: string
}

export interface Favorite {
  listing_id: string
  user_id: string
  created_at: string
}

export interface UserListingStats {
  total_listings: number
  active_listings: number
  total_views: number
  total_bookings: number
  average_rating: number
  total_reviews: number
  recent_views: number
  recent_bookings: number
}

export interface AdminStats {
  total_users: number
  total_listings: number
  active_rentals: number
  new_users_this_month: number
  new_listings_this_month: number
  revenue: number
}