import apiClient from "../../../api/client"

// Types for API requests
export interface UpdateUserInfoPayload {
  email?: string
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
  updateUserInfo: async (userId: string, data: UpdateUserInfoPayload) => {
    try {
      const response = await apiClient.patch(`/users/${userId}`, data)
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
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/users/me")
      return response.data
    } catch (error) {
      throw error
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
