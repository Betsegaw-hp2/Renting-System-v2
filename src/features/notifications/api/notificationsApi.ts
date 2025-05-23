// api/notificationsApi.ts
import apiConfig from "@/config/api.config"
import apiClient from "../../../api/client"
import type { Notification } from "../../../types/notification.types"

export const notificationsApi = {
  getNotification: (id: string) =>
    apiClient.get<Notification>(`${apiConfig.apiBaseUrl}/notifications/${id}`)
      .then(res => res.data),

  getUserNotifications: (userId: string) =>
    apiClient.get<Notification[]>(`${apiConfig.apiBaseUrl}/users/${userId}/notifications`)
      .then(res => res.data),

  markAsRead: (id: string) =>
    apiClient.patch(`${apiConfig.apiBaseUrl}/notification/${id}/read`)
      .then(res => res.status === 204),
}