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

export interface UpdateUserPayload {
  first_name?: string
  last_name?: string
  username?: string
}

export interface PaymentDetail {
  id: string
  user_id: string
  bank_name: string
  account_number: string
  account_name: string
}

export interface CreatePaymentDetailPayload {
  bank_name: string
  account_number: string
  account_name: string
}

export interface UpdateUserPayload {
  first_name?: string
  last_name?: string
  username?: string
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

  updateUser: async (userId: string, data: UpdateUserPayload) : Promise<User> => {
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

  getUserPaymentDetails: async (userId: string): Promise<PaymentDetail[]> => {
    try {
      const response = await apiClient.get<PaymentDetail[]>(`/users/${userId}/payment-details`)
      console.log("Payment details fetched successfully", response.data)
      return response.data
    } catch (error) {
      console.error(`Error fetching payment details for user ${userId}:`, error)
      throw error 
    }
  },

  createPaymentDetail: async (userId: string, data: CreatePaymentDetailPayload): Promise<PaymentDetail> => {
    try {
      const response = await apiClient.post<PaymentDetail>(`/users/${userId}/payment-details`, data)
      console.log("Payment detail created successfully", response.data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  deletePaymentDetail: async (userId: string, paymentDetailId: string): Promise<void> => {
    try {
      await apiClient.delete(`/users/${userId}/payment-details/${paymentDetailId}`)
      console.log("Payment detail deleted successfully")
    } catch (error) {
      console.error(`Error deleting payment detail for user ${userId}:`, error)
      throw error
    }
  },

  
}
