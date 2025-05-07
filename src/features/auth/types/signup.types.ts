import type { UserRole } from "../../../types/user.types"

export interface SignupFormData {
  // Step 1: Common Account Information
  email: string
  password: string
  confirmPassword: string
  first_name: string
  last_name: string
  username: string
  role: UserRole

  // Step 2: Tenant-specific fields
  preferredLocation?: string
  budget?: string
  moveInDate?: string

  // Step 2: Property Owner-specific fields
  // Location
  address?: string
  city?: string
  state?: string
  zipCode?: string

  // Property info
  propertyTypes?: string[]
  propertiesOwned?: string

  // KYC verification
  idType?: string
  idNumber?: string
  dateOfBirth?: string

  // Common fields
  phone?: string
  agreeToTerms?: boolean
}

export type SignupStep = "account" | "tenant-details" | "owner-details"

export interface StepConfig {
  title: string
  description: string
}

export const SIGNUP_STEPS: Record<SignupStep, StepConfig> = {
  account: {
    title: "Basic Information",
    description: "Create your account with essential information",
  },
  "tenant-details": {
    title: "Tenant Preferences",
    description: "Tell us about your rental preferences (optional)",
  },
  "owner-details": {
    title: "Property Details",
    description: "Provide your property details (optional)",
  },
}
