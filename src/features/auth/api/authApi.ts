import apiClient from "../../../api/client"
import { mockApi } from "../../../api/mockApi"
import config from "../../../config/api.config"
import { removeAuthToken } from "../../../lib/cookies"
import type { LoginCredentials, SignupCredentials, User } from "../../../types/user.types"

export interface LoginResponse extends User {
  token: string
}
export interface SignupResponse {
  message: string;
  data: { user: User }
}

export interface VerifyEmailPayload {
  otp_code: string
  user_id: string
}

export interface VerifyEmailResponse {
  message: string
  verified: boolean
}

export interface VerifyEmailPayload {
  user_id: string;
  otp_code: string;
}

export interface CheckUsernameResponse {
  username: string;
  exists: boolean;
}

export const checkUsername = async (username: string): Promise<CheckUsernameResponse> => {
  try {
    if (config.useMockApi) {
      return mockApi.checkUsername(username)
    }

    const response = await apiClient.get<CheckUsernameResponse>(`/authentication/check-username?username=${username}`)
    return response.data
  } catch (error) {
    // Format the error before throwing
    if (error instanceof Error) {
      throw error
    } else if (typeof error === "object" && error !== null) {
      throw new Error(JSON.stringify(error))
    } else {
      throw new Error("An unknown error occurred while checking username")
    }
  }
}

export const signup = async (credentials: SignupCredentials): Promise<SignupResponse> => {
  try {
    if (config.useMockApi) {
      return mockApi.signup(credentials)
    }

    const response = await apiClient.post<SignupResponse>("/authentication/register", credentials)
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

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    if (config.useMockApi) {
      return mockApi.login(credentials)
    }

    const response = await apiClient.post<LoginResponse>("/authentication/login", credentials)
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
    const response = await apiClient.post<{ message: string, data: { token: string } }>("authentication/verify-email", payload)
    const resData = response.data
    
    console.log(resData.message)

    return resData.data.token
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
