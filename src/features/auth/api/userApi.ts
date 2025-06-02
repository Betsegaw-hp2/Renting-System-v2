import type { CreateLocation, Location, UpdateLocation } from "@/types/location.types"
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

export interface profilePicturePayload {
  user_id: string
  image: string
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
  getUserPaymentDetails: async (userId: string): Promise<PaymentDetail | null> => {
    try {
      const response = await apiClient.get<PaymentDetail>(`/users/${userId}/payment-details`)
      console.log("Payment details fetched successfully", response.data)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null // Return null if payment details not found
      }
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
  // Location management
  getUserLocation: async (): Promise<Location | null> => {
    try {
      const response = await apiClient.get<Location>(`/locations`)
      console.log("User location fetched successfully", response.data)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null // Return null if location not found
      }
      console.error(`Error fetching location for current user:`, error)
      throw error
    }
  },

  createUserLocation: async (data: CreateLocation): Promise<Location> => {
    try {
      const response = await apiClient.post<Location>('/locations', data)
      console.log("User location created successfully", response.data)
      return response.data
    } catch (error) {
      console.error(`Error creating location for user:`, error)
      throw error
    }
  },
  updateUserLocation: async (locationId: string, data: UpdateLocation): Promise<Location> => {
    try {
      const response = await apiClient.patch<Location>(`/locations/${locationId}`, data)
      console.log("User location updated successfully", response.data)
      return response.data
    } catch (error) {
      console.error(`Error updating location for user with location id ${locationId}:`, error)
      throw error
    }
  },

  uploadProfilePicture: async (userId: string, image: FormData): Promise<profilePicturePayload> => {
    try {


      const response = await apiClient.post<profilePicturePayload>(`/users/${userId}/profile-picture`, image, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Profile picture uploaded successfully", response.data)
      return response.data
    } catch (error) {
      console.error(`Error uploading profile picture for user ${userId}:`, error)
      throw error
    }
  },

  getProfilePicture: async (userId: string): Promise<string | null> => {
    try {
      const response = await apiClient.get(`/users/${userId}/profile-picture`, {
        responseType: 'blob' // Ensure we get the image as a blob
      })
      const imageUrl = URL.createObjectURL(response.data)
      console.log("Profile picture fetched successfully", imageUrl)
      return imageUrl
    } catch (error) {
      console.error(`Error fetching profile picture for user ${userId}:`, error)
      return null // Return null if there's an error
    }
  },

}
