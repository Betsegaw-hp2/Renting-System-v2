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
  user_id: string;
  otp_code: string;
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

export const updateEmail = async (userId: string, newEmail: string): Promise<void> => {
  try {
    if (config.useMockApi) {
      return mockApi.updateEmail(userId, newEmail)
    }

    await apiClient.put(`/users/${userId}/email`, { email: newEmail })
  } catch (error) {
    // Format the error before throwing
    if (error instanceof Error) {
      throw error
    } else if (typeof error === "object" && error !== null) {
      throw new Error(JSON.stringify(error))
    } else {
      throw new Error("An unknown error occurred while updating email")
    }
  }
}

export const verifyEmail = async (payload: VerifyEmailPayload): Promise<string> => {
  try {
    if (config.useMockApi) {
      return mockApi.verifyEmail(payload)
    }
    const response = await apiClient.post<string>("/authentication/verify-email", payload)
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

export const resendVerifyEmail = async (userId: string): Promise<void> => {
 try {
   if (config.useMockApi) {
     return mockApi.resendVerifyEmail(userId)
   }
   await apiClient.post("/authentication/resend-verify-email", { user_id: userId })
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
