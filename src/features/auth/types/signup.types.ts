import type { UserRole } from "../../../types/user.types"

export interface SignupFormData {
  // Step 1: Common Account Information
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
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
  companyName?: string
  businessType?: string

  // KYC verification
  idType?: string
  idNumber?: string
  dateOfBirth?: string

  // Common fields
  phoneNumber: string
  agreeToTerms: boolean
}

export type SignupStep = "account" | "tenant-details" | "owner-details"

export interface StepConfig {
  title: string
  description: string
}

export const SIGNUP_STEPS: Record<SignupStep, StepConfig> = {
  account: {
	title: "Account Information",
	description: "Create your account and select your role",
  },
  "tenant-details": {
	title: "Tenant Information",
	description: "Tell us about your rental preferences",
  },
  "owner-details": {
	title: "Property Owner Verification",
	description: "Provide your property details and verify your identity",
  },
}
