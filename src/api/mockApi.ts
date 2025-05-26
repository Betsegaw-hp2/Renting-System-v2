import { v4 as uuidv4 } from "uuid"
import config from "../config/api.config"
import { type AuthResponse, type VerifyEmailPayload } from "../features/auth/api/authApi"
import { getAuthToken } from "../lib/cookies"
import type { LoginCredentials, SignupCredentials, User, UserRole } from "../types/user.types"


// In-memory storage for mock data
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    first_name: "Admin",
    last_name: "User",
    username: "admin",
    role: "admin" as UserRole,
    is_verified: true,
    is_member: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile_picture: ""
  },
  {
    id: "2",
    email: "tenant@example.com",
    first_name: "Tenant",
    last_name: "User",
    username: "tenant",
    role: "renter" as UserRole,
    is_verified: true,
    is_member: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile_picture: ""
  },
  {
    id: "3",
    email: "owner@example.com",
    first_name: "Property",
    last_name: "Owner",
    username: "owner",
    role: "owner" as UserRole,
    is_verified: true,
    is_member: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile_picture: ""
  },
]

// Mock tokens for authenticated users
const mockTokens: Record<string, string> = {
  "1": "mock-token-admin",
  "2": "mock-token-tenant",
  "3": "mock-token-owner",
}

// Helper to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock API implementation
export const mockApi = {
  // Authentication
  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    await delay(config.mockApiDelay)

    // Check if email already exists
    if (mockUsers.some((user) => user.email === credentials.email)) {
      const error = new Error("Email already exists")
      throw error
    }

    // Check if username already exists
    if (mockUsers.some((user) => user.username === credentials.username)) {
      const error = new Error("Username already exists")
      throw error
    }

    // Password validation (simple example)
    if (credentials.password.length < 6) {
      const error = new Error("Password must be at least 6 characters")
      throw error
    }

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      email: credentials.email,
      first_name: credentials.first_name,
      last_name: credentials.last_name,
      username: credentials.username,
      role: credentials.role,
      is_verified: false,
      is_member: false,
      profile_picture: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Add to mock database
    mockUsers.push(newUser)

    // Generate token
    const token = `mock-token-${newUser.id}`
    mockTokens[newUser.id] = token

    return {
      user: { ...newUser },
      token
    }
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await delay(config.mockApiDelay)

    // Find user by email
    const user = mockUsers.find((user) => user.email === credentials.email)

    console.log(mockUsers)
    // Simulate authentication (in a real app, we'd check the password)
    if (!user) {
      const error = new Error("Invalid email or password")
      throw error
    }

    // Get token
    const token = mockTokens[user.id]

    return {
      user: { ...user },
      token
    }

  },

  logout: async (): Promise<void> => {
    await delay(config.mockApiDelay)
    // In a mock API, we don't need to do anything here
    return
  },

  getCurrentUser: async (): Promise<User> => {

    await delay(config.mockApiDelay)

    // Get token from cookie
    const token = getAuthToken()

    if (!token) {
      throw new Error("No authentication token found")
    }
    // Find user by token
    const userId = Object.keys(mockTokens).find((id) => mockTokens[id] === token)

    if (!userId) {
      throw new Error("Invalid token")

    }

    const user = mockUsers.find((user) => user.id === userId)

    if (!user) {
      throw new Error("User not found")
    }

    return user
  },
  updateEmail: async (userId: string, newEmail: string): Promise<void> => {
    await delay(config.mockApiDelay)

    // Find user by ID
    const user = mockUsers.find((user) => user.id === userId)

    if (!user) {
      const error = new Error("User not found")
      throw error
    }

    // Check if email already exists
    if (mockUsers.some((user) => user.email === newEmail)) {
      const error = new Error("Email already exists")
      throw error
    }

    // Update email
    user.email = newEmail

    // Simulate sending verification email
    console.log(`Sending verification email to ${newEmail}`)
  },
  verifyEmail: async (payload: VerifyEmailPayload): Promise<string> => {
    await delay(config.mockApiDelay)

    // Simulate email verification
    const user = mockUsers.find((user) => user.id === payload.user_id)

    if (!user) {
      const error = new Error("User not found")
      throw error
    }

    // In a real app, we'd check the verification code
    payload.otp_code === "123456" && (user.is_verified = true)

    return "Email verified successfully"
  },
  resendVerifyEmail: async (userId: string): Promise<void> => {
    await delay(config.mockApiDelay)

    // Simulate resending verification email
    const user = mockUsers.find((user) => user.id === userId)

    if (!user) {
      const error = new Error("User not found")
      throw error
    }

    // In a real app, we'd send an email
    console.log(`Resending verification email to ${user.email}`)
  }
}
