import { v4 as uuidv4 } from "uuid"
import type { Notification } from "../types/notification.types"

// Sample notifications data - updated to match API schema
const generateMockNotifications = (userId: string, count = 10): Notification[] => {
  const notifications: Notification[] = []
  
  const notificationTypes = ['booking_request', 'booking_confirmed', 'new_message', 'generic'] as const
  const sampleTitles = {
    'booking_request': 'New Booking Request',
    'booking_confirmed': 'Booking Confirmed',
    'new_message': 'New Message',
    'generic': 'Update Available'
  }
  const sampleMessages = {
    'booking_request': 'You have received a new booking request for your beautiful property in downtown. The potential tenant is interested in a long-term lease and has provided all necessary documentation for review.',
    'booking_confirmed': 'We are pleased to inform you that your booking has been successfully accepted!\nTo complete your reservation, please proceed to make the payment using the checkout link provided.',
    'new_message': 'You have received a new message from a potential tenant who is very interested in renting your property. They have some questions about the amenities and would like to schedule a viewing.',
    'generic': 'There are important updates available in your dashboard. Please click here to view the latest system notifications and updates that may affect your account.'
  }

  for (let i = 0; i < count; i++) {
    const is_read = Math.random() > 0.7
    const daysAgo = Math.floor(Math.random() * 7)
    const created_at = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
    const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    let payload = {}
    switch (type) {
      case 'booking_request':
      case 'booking_confirmed':
        payload = { 
          listing_id: Math.floor(Math.random() * 100) + 1, 
          booking_id: Math.floor(Math.random() * 500) + 1 
        }
        break
      case 'new_message':
        payload = { 
          listing_id: Math.floor(Math.random() * 100) + 1,
          receiver_id: Math.floor(Math.random() * 200) + 1,
          chat_id: Math.floor(Math.random() * 300) + 1 
        }
        break
      case 'generic':
        payload = { 
          url: `/listings/${Math.floor(Math.random() * 100) + 1}`, 
          link_text: 'View Details' 
        }
        break
    }

    notifications.push({
      id: uuidv4(),
      user_id: userId,
      type,
      title: sampleTitles[type],
      message: sampleMessages[type],
      payload: {}, // Convert to JSON string as per API schema
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
        const types = ['booking_request', 'new_message', 'generic'] as const
        const type = types[Math.floor(Math.random() * types.length)]
          const titles = {
          'booking_request': 'New Booking Request',
          'new_message': 'New Message Received',
          'generic': 'System Update'
        }
        
        const messages = {
          'booking_request': 'You have received a new booking request from a verified tenant who is looking for a long-term rental agreement.',
          'new_message': `You received a detailed message from a potential tenant at ${new Date().toLocaleTimeString()} with questions about your property amenities and availability.`,
          'generic': 'Important system updates are available that may affect your account settings and notification preferences.'
        };
                let payload = {}
        switch (type) {
          case 'booking_request':
            payload = { 
              listing_id: Math.floor(Math.random() * 100) + 1,
              booking_id: Math.floor(Math.random() * 500) + 1 
            }
            break
          case 'new_message':
            payload = { 
              listing_id: Math.floor(Math.random() * 100) + 1,
              receiver_id: Math.floor(Math.random() * 200) + 1,
              chat_id: Math.floor(Math.random() * 300) + 1 
            }
            break
          case 'generic':
            payload = { 
              url: `/listings/${Math.floor(Math.random() * 100) + 1}`, 
              link_text: 'View Details' 
            }
            break
        }

        const notification: Notification = {
          id: uuidv4(),
          user_id: userId,
          type,
          title: titles[type],
          message: messages[type],
          payload: {}, // Convert to JSON string as per API schema
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