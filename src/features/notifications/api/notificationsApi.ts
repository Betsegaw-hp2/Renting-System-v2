import apiClient from "../../../api/client"
import { mockNotificationsApi } from "../../../api/mockNotificationsApi"
import type { Notification } from "../../../types/notification.types"

// Use mock API in development
const isDevelopment =  process.env.NODE_ENV === "development"

export const notificationsApi = {
  getNotification: async (id: string): Promise<Notification> => {
    if (isDevelopment) {
      return mockNotificationsApi.getNotification(id)
    }

    const response = await apiClient.get(`/notifications/${id}`)
    return response.data
  },

  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    if (isDevelopment) {
      return mockNotificationsApi.getUserNotifications(userId)
    }

    const response = await apiClient.get(`/users/${userId}/notifications`)
    return response.data
  },

  markAsRead: async (id: string): Promise<void> => {
    if (isDevelopment) {
      return mockNotificationsApi.markAsRead(id)
    }

    await apiClient.patch(`/notification/${id}/read`)
  },
}