import apiClient from "../../../api/client"
import { mockApi } from "../../../api/mockApi"
import config from "../../../config/api.config"
import { removeAuthToken } from "../../../lib/cookies"
import type { LoginCredentials, SignupCredentials, User } from "../../../types/user.types"

export interface AuthResponse {
  user: User
  token: string
}

export interface VerifyEmailPayload {
  otp_code: string
  user_id: string
}

export interface VerifyEmailResponse {
  message: string
  verified: boolean
}

export const signup = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  try {
    if (config.useMockApi) {
      return mockApi.signup(credentials)
    }

    const response = await apiClient.post<AuthResponse>("/authentication/register", credentials)
    return response.data
  } catch (error) {
    // Format the error before throwing
    if (error instanceof Error) {
      throw error
    } else if (typeof error === "object" && error !== null) {
      throw new Error(JSON.stringify(error))
    } else {
      throw new Error("An unknown error occurred during signup")
    }
  }
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    if (config.useMockApi) {
      return mockApi.login(credentials)
    }

    const response = await apiClient.post<AuthResponse>("/authentication/login", credentials)
    return response.data
  } catch (error) {
    // Format the error before throwing
    if (error instanceof Error) {
      throw error
    } else if (typeof error === "object" && error !== null) {
      throw new Error(JSON.stringify(error))
    } else {
      throw new Error("An unknown error occurred during login")
    }
  }
}

export const logout = async (): Promise<void> => {
  try {
    if (config.useMockApi) {
      return mockApi.logout()
    }

    await apiClient.get("/authentication/logout")
    removeAuthToken()
  } catch (error) {
    // Format the error before throwing
    if (error instanceof Error) {
      throw error
    } else if (typeof error === "object" && error !== null) {
      throw new Error(JSON.stringify(error))
    } else {
      throw new Error("An unknown error occurred during logout")
    }
  }
}

export const getCurrentUser = async (): Promise<User> => {
  try {
    if (config.useMockApi) {
      return mockApi.getCurrentUser()
    }

    const response = await apiClient.get<User>("/users/me")
    return response.data
  } catch (error) {
    // Format the error before throwing
    if (error instanceof Error) {
      throw error
    } else if (typeof error === "object" && error !== null) {
      throw new Error(JSON.stringify(error))
    } else {
      throw new Error("An unknown error occurred while fetching user data")
    }
  }
}

export const verifyEmail = async (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> => {
  try {
    if (config.useMockApi) {
      // Mock successful verification
      return {
        message: "Email verified successfully",
        verified: true,
      }
    }

    const response = await apiClient.post<VerifyEmailResponse>("/authentication/verify-email", payload)
    return response.data
  } catch (error) {
    // Format the error before throwing
    if (error instanceof Error) {
      throw error
    } else if (typeof error === "object" && error !== null) {
      throw new Error(JSON.stringify(error))
    } else {
      throw new Error("An unknown error occurred during email verification")
    }
  }
}

export const resendVerificationEmail = async (userId: string): Promise<{ message: string }> => {
  try {
    if (config.useMockApi) {
      // Mock successful resend
      return {
        message: "Verification email sent successfully",
      }
    }

    const response = await apiClient.post<{ message: string }>("/authentication/resend-verification", {
      user_id: userId,
    })
    return response.data
  } catch (error) {
    // Format the error before throwing
    if (error instanceof Error) {
      throw error
    } else if (typeof error === "object" && error !== null) {
      throw new Error(JSON.stringify(error))
    } else {
      throw new Error("An unknown error occurred while resending verification email")
    }
  }
}
