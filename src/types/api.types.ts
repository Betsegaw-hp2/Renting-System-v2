// Core API types based on Swagger documentation

// User Roles
export type UserRole = "admin" | "renter" | "owner"

// Listing Status
export type ListingStatus = "available" | "booked" | "inactive"

// Booking Status - Using string literal union type instead of enum
export const BookingStatus = {
  PENDING: "pending",
  BOOKED: "booked",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus]

// Payment Status - Using string literal union type instead of enum
export const PaymentStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  IN_ESCROW: "in_escrow",
  DISPUTED: "disputed",
  FAILED: "failed",
} as const

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

// Media Types
export type MediaTypes = "image" | "video"

// Report Status
export type ReportStatus = "open" | "under_review" | "resolved" | "dismissed"

// User interfaces
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  username: string
  role: UserRole
  profile_picture?: string
  is_verified: boolean
  is_member: boolean
  created_at: string
  updated_at: string
}

export interface UserWithToken extends User {
  token: string
}

export interface UserWithLocation extends User {
  location: Location | null
}

// Location interfaces
export interface Location {
  id: string
  user_id: string
  address: string
  city: string
  country: string
  region: string
  postal_code: string
  phone: string
  created_at: string
  updated_at: string
}

export interface CreateLocation {
  address: string
  city: string
  country: string
  region: string
  postal_code: string
  phone: string
}

// Category interfaces
export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  created_at: string
  updated_at: string
}

export interface CategoryBasic {
  id: string
  name: string
  slug: string
}

export interface CategoryTag {
  id: string
  name: string
}

// Listing interfaces
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

// Media interfaces
export interface ListingMedia {
  id: string
  listing_id: string
  media_type: MediaTypes
  media_url: string
  created_at: string
  updated_at: string
}

// Booking interfaces
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
}

export interface CreateBooking {
  start_date: string
  end_date: string
  total_amount: number
}

// Review interfaces
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

export interface CreateReview {
  rating: number
  description: string
}

// Favorite interfaces
export interface Favorite {
  listing_id: string
  user_id: string
  created_at: string
}

// Payment interfaces
export interface PaymentDetail {
  id: string
  user_id: string
  bank_name: string
  account_name: string
  account_number: string
  created_at: string
}

export interface CreatePaymentDetail {
  bank_name: string
  account_name: string
  account_number: string
}

// Report interfaces
export interface Report {
  id: string
  reporter_id: string
  reported_id: string
  listing_id?: string
  reason: string
  description: string
  status: ReportStatus
  created_at: string
}

export interface CreateReport {
  reported_id: string
  listing_id?: string
  reason: string
  description: string
}

// Message interfaces
export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  listing_id: string
  content: string
  is_read: boolean
  sent_at: string
  updated_at: string
}

export interface CreateMessage {
  content: string
}

// Notification interfaces
export interface Notification {
  id: string
  user_id: string
  message: string
  is_read: boolean
  created_at: string
}

// Authentication interfaces
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  first_name: string
  last_name: string
  username: string
  password: string
  role: UserRole
}

// API response interfaces
export interface ApiError {
  status_code: number
  message: string
}

// Constants for role values
export const USER_ROLES = {
  ADMIN: "admin" as UserRole,
  RENTER: "renter" as UserRole,
  OWNER: "owner" as UserRole,
}
