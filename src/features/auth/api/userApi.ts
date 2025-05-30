import type { User } from "@/types/user.types"
import apiClient from "../../../api/client"

// Types for API requests
export interface UpdateUserInfoPayload {
  username?: string
  first_name?: string
  last_name?: string
}

export interface UpdatePasswordPayload {
  password: string
}

// API functions for user profile management
export const userApi = {
  // Update user personal information
  updateUserInfo: async (userId: string, data: UpdateUserInfoPayload) : Promise<User> => {
    try {
      const response = await apiClient.patch<User>(`/users/${userId}`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update user password
  updatePassword: async (userId: string, data: UpdatePasswordPayload) => {
    try {
      const response = await apiClient.put(`/users/${userId}/password`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get("/users/me")
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get user KYC information
  getUserKyc: async (userId: string) => {
    try {
      const response = await apiClient.get(`/users/${userId}/kyc`)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null // Return null if KYC not found
      }
      console.error(`Error fetching KYC for user ${userId}:`, error)
      throw error // Re-throw other errors
    }
  },

  // Upload KYC documents
  uploadKycDocuments: async (userId: string, faceImage: File, frontsideImage: File, backsideImage: File) => {
    try {
      const formData = new FormData()
      formData.append("face", faceImage)
      formData.append("frontside", frontsideImage)
      formData.append("backside", backsideImage)

      const response = await apiClient.post(`/users/${userId}/kyc`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      throw error
    }
  },
}
