import apiClient from "../../../api/client"
import { mockApi } from "../../../api/mockApi"
import config from "../../../config/api.config"
import { removeAuthToken } from "../../../lib/cookies"
import type { LoginCredentials, SignupCredentials, User } from "../../../types/user.types"


export interface AuthResponse extends User {
  token: string
}

export const signup = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  try { 
    if (config.useMockApi) {
      return mockApi.signup(credentials)
    }

    const response = await apiClient.post<AuthResponse>("/authentication/register", credentials)
    return response.data
  }  catch (error) {
    console.error("Error during signup:", error)
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
    console.error("Error during login:", error)
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
    console.error("Error during logout:", error)
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
      console.error("Error fetching current user:", error)
      if (error instanceof Error) {
        throw error
      } else if (typeof error === "object" && error !== null) {
        throw new Error(JSON.stringify(error))
      } else {
        throw new Error("An unknown error occurred while fetching user data")
      }
    }
}
