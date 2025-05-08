import { v4 as uuidv4 } from "uuid"
import type { Notification } from "../types/notification.types"

// Sample notifications data
const generateMockNotifications = (userId: string, count = 10): Notification[] => {
  const notifications: Notification[] = []

  for (let i = 0; i < count; i++) {
    const is_read = Math.random() > 0.7
    const daysAgo = Math.floor(Math.random() * 7)
    const created_at = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()

    notifications.push({
      id: uuidv4(),
      user_id: userId,
      message: `This is a sample notification message #${i + 1}`,
      is_read,
      created_at,
    })
  }

  // Sort by date (newest first)
  return notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// Mock notifications for each user
const mockNotificationsStore: Record<string, Notification[]> = {}

export const mockNotificationsApi = {
  getNotification: async (id: string): Promise<Notification> => {
    // Search all user notifications for the specified ID
    for (const userId in mockNotificationsStore) {
      const notification = mockNotificationsStore[userId].find((n) => n.id === id)
      if (notification) {
        return Promise.resolve({ ...notification })
      }
    }
    return Promise.reject(new Error("Notification not found"))
  },

  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    // Generate mock notifications if they don't exist for this user
    if (!mockNotificationsStore[userId]) {
      mockNotificationsStore[userId] = generateMockNotifications(userId)
    }
    return Promise.resolve([...mockNotificationsStore[userId]])
  },

  markAsRead: async (id: string): Promise<void> => {
    // Find and mark the notification as read
    for (const userId in mockNotificationsStore) {
      const notification = mockNotificationsStore[userId].find((n) => n.id === id)
      if (notification) {
        notification.is_read = true
        return Promise.resolve()
      }
    }
    return Promise.reject(new Error("Notification not found"))
  },

  connectToWebSocket: (userId: string, onNotification: (notification: Notification) => void): (() => void) => {
    console.log(`Mock WebSocket connected for user ${userId}`)

    // Generate a new notification every 30 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance of getting a new notification
        const notification: Notification = {
          id: uuidv4(),
          user_id: userId,
          message: `New notification at ${new Date().toLocaleTimeString()}`,
          is_read: false,
          created_at: new Date().toISOString(),
        }

        // Add to store
        if (!mockNotificationsStore[userId]) {
          mockNotificationsStore[userId] = []
        }
        mockNotificationsStore[userId].unshift(notification)

        // Notify listener
        onNotification(notification)
      }
    }, 30000)

    // Return cleanup function
    return () => {
      clearInterval(interval)
      console.log(`Mock WebSocket disconnected for user ${userId}`)
    }
  },
}