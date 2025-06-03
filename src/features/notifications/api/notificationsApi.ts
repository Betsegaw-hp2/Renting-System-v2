// api/notificationsApi.ts
import apiConfig from "@/config/api.config"
import apiClient from "../../../api/client"
import type { Notification } from "../../../types/notification.types"

export const notificationsApi = {
  getNotification: async (id: string) => {
    try {
      const res = await apiClient.get<Notification>(`${apiConfig.apiBaseUrl}/notifications/${id}`)
      return res.data
    } catch (error) {
      // Optionally handle/log error
      throw error
    }
  },

  getUserNotifications: async (userId: string) => {
    try {
      const res = await apiClient.get<Notification[]>(`${apiConfig.apiBaseUrl}/users/${userId}/notifications`)
      return res.data
    } catch (error) {
      // Optionally handle/log error
      throw error
    }
  },

  markAsRead: async (id: string) => {
    try {
      const res = await apiClient.patch(`${apiConfig.apiBaseUrl}/notification/${id}/read`)
      return res.status === 204
    } catch (error) {
      // Optionally handle/log error
      throw error
    }
  },
}