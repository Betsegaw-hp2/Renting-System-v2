import apiClient from "@/api/client"
import apiConfig from "@/config/api.config"
import type { Conversation, CreateMessagePayload, Message } from "@/types/message.types"

// Mock data for development (only used when explicitly configured)
const mockConversations: Conversation[] = [
  {
    id: "conv1",
    listing_id: "3eacd0c2-5c75-428a-8d49-9cca79f3f1c5",
    partnerId: "1f8b7846-0177-4243-8775-afd1996247b8",
    partnerName: "John Smith",
    partnerAvatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Hey, is this property still available?",
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    lastUpdated: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "conv2",
    listing_id: "listing2",
    partnerId: "user2",
    partnerName: "Sarah Johnson",
    partnerAvatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Thanks for the quick response!",
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    lastUpdated: new Date(Date.now() - 7200000).toISOString(),
    unreadCount: 0,
    isOnline: false,
  },
]

const mockMessages: Message[] = [
  {
    id: "msg1",
    content: "Hey, is this property still available?",
    is_read: true,
    listing_id: "3eacd0c2-5c75-428a-8d49-9cca79f3f1c5",
    sender_id: "1f8b7846-0177-4243-8775-afd1996247b8",
    receiver_id: "acf1131d-7a0f-4bf0-a272-050b9c1e8bfa",
    sent_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "msg2",
    content: "Yes, it's still available! Would you like to schedule a viewing?",
    is_read: true,
    listing_id: "3eacd0c2-5c75-428a-8d49-9cca79f3f1c5",
    sender_id: "acf1131d-7a0f-4bf0-a272-050b9c1e8bfa",
    receiver_id: "1f8b7846-0177-4243-8775-afd1996247b8",
    sent_at: new Date(Date.now() - 3000000).toISOString(),
    updated_at: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: "msg3",
    content: "That would be great! I'm available this weekend.",
    is_read: false,
    listing_id: "3eacd0c2-5c75-428a-8d49-9cca79f3f1c5",
    sender_id: "1f8b7846-0177-4243-8775-afd1996247b8",
    receiver_id: "acf1131d-7a0f-4bf0-a272-050b9c1e8bfa",
    sent_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
]

// Mock current user for development
const mockCurrentUser = {
  id: "acf1131d-7a0f-4bf0-a272-050b9c1e8bfa",
  name: "Current User",
  email: "user@example.com",
  avatar: "/placeholder.svg?height=40&width=40",
}

// Cache for user info to avoid redundant API calls
const userInfoCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const chatApi = {
  // getCurrentUser: async (): Promise<{ id: string; name: string; email: string; avatar?: string }> => {
  //   console.log("👤 Fetching current user from /users/me")

  //   if (apiConfig.useMockApi) {
  //     console.log("🎭 Using mock current user (configured)")
  //     await new Promise((resolve) => setTimeout(resolve, apiConfig.mockApiDelay))
  //     return mockCurrentUser
  //   }

  //   try {
  //     const response = await apiClient.get<any>("/users/me")
  //     const userData = response.data
  //     console.log("✅ Current user loaded from API:", userData)
  //     return {
  //       id: userData.id,
  //       name: userData.name || userData.username || userData.email || "Unknown User",
  //       email: userData.email || "",
  //       avatar: userData.avatar || "/placeholder.svg?height=40&width=40",
  //     }
  //   } catch (error) {
  //     console.error("❌ Error fetching current user:", error)
  //     throw error
  //   }
  // },

  getConversations: async (currentUserId: string): Promise<Conversation[]> => {
    console.log("📥 Fetching conversations for current user:", currentUserId)

    if (apiConfig.useMockApi) {
      console.log("🎭 Using mock conversations (configured)")
      await new Promise((resolve) => setTimeout(resolve, apiConfig.mockApiDelay))
      return mockConversations
    }

    try {
      // Use the current user ID passed from context
      const response = await apiClient.get<Conversation[]>(`/users/${currentUserId}/messages`)
      console.log("✅ Conversations loaded from API:", response.data?.length, "conversations")
      return response.data || []
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn("🚧 Conversations endpoint not implemented yet (404)")
        return []
      }
      console.error("❌ Error fetching conversations:", error)
      throw error
    }
  },

  fetchHistory: async (currentUserId: string, receiverId: string, listingId?: string): Promise<Message[]> => {
    console.log("📥 Fetching chat history:", { currentUserId, receiverId, listingId })

    if (apiConfig.useMockApi) {
      console.log("🎭 Using mock chat history (configured)")
      await new Promise((resolve) => setTimeout(resolve, apiConfig.mockApiDelay))
      return mockMessages.filter(
        (msg) =>
          (msg.sender_id === currentUserId && msg.receiver_id === receiverId) ||
          (msg.sender_id === receiverId && msg.receiver_id === currentUserId),
      )
    }

    try {
      let url = `/chat/history/${currentUserId}/${receiverId}`
      if (listingId) {
        url += `?listing_id=${listingId}`
      }

      const response = await apiClient.get<Message[]>(url)
      console.log("✅ Chat history loaded from API:", response.data.length, "messages")
      return response.data
    } catch (error) {
      console.error("❌ Error fetching chat history:", error)
      throw error
    }
  },

  // Get user info with caching to avoid redundant API calls
  getUserInfo: async (userId: string): Promise<{ name: string; avatar?: string; isOnline?: boolean }> => {
    console.log("👤 Fetching user info for:", userId)

    // Check cache first
    const cached = userInfoCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("📋 Using cached user info for:", userId)
      return cached.data
    }
 
    if (apiConfig.useMockApi) {
      console.log("🎭 Using mock user info (configured)")
      await new Promise((resolve) => setTimeout(resolve, apiConfig.mockApiDelay))
      const mockData = {
        name: userId === "1f8b7846-0177-4243-8775-afd1996247b8" ? "John Smith" : "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        isOnline: Math.random() > 0.5,
      }
      // Cache the mock data
      userInfoCache.set(userId, { data: mockData, timestamp: Date.now() })
      return mockData
    }

    try {
      const response = await apiClient.get<any>(`/users/${userId}`)
      const userData = response.data
      const userInfo = {
        name: userData.name || userData.username || userData.email || "Unknown User",
        avatar: userData.avatar || "/placeholder.svg?height=40&width=40",
        isOnline: userData.isOnline || false,
      }

      // Cache the result
      userInfoCache.set(userId, { data: userInfo, timestamp: Date.now() })
      console.log("✅ User info cached for:", userId)

      return userInfo
    } catch (error) {
      console.warn("⚠️ Could not fetch user info for:", userId, error)
      const fallbackInfo = {
        name: "Unknown User",
        avatar: "/placeholder.svg?height=40&width=40",
        isOnline: false,
      }
      // Cache the fallback to avoid repeated failed requests
      userInfoCache.set(userId, { data: fallbackInfo, timestamp: Date.now() })
      return fallbackInfo
    }
  },

  // Create a conversation object from chat parameters - displays receiver info
  createConversationFromChat: async (
    listingId: string,
    partnerId: string,
    messages: Message[] = [],
    currentUserId: string,
  ): Promise<Conversation> => {
    console.log("🆕 Creating conversation from chat params:", { listingId, partnerId, currentUserId })

    try {
      // Get receiver's (partner's) info for display
      const partnerInfo = await chatApi.getUserInfo(partnerId)
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

      return {
        id: `temp_${listingId}_${partnerId}`,
        listing_id: listingId,
        partnerId: partnerId, // This is the receiver
        partnerName: partnerInfo.name, // Display receiver's name
        partnerAvatar: partnerInfo.avatar || "/placeholder.svg?height=40&width=40",
        lastMessage: lastMessage?.content || "Start a conversation...",
        updatedAt: lastMessage?.sent_at || new Date().toISOString(),
        lastUpdated: lastMessage?.sent_at || new Date().toISOString(),
        unreadCount: messages.filter((msg) => !msg.is_read && msg.sender_id === partnerId).length,
        isOnline: partnerInfo.isOnline,
      }
    } catch (error) {
      console.error("❌ Error creating conversation:", error)
      return {
        id: `temp_${listingId}_${partnerId}`,
        listing_id: listingId,
        partnerId: partnerId,
        partnerName: "Unknown User",
        partnerAvatar: "/placeholder.svg?height=40&width=40",
        lastMessage: "Start a conversation...",
        updatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        unreadCount: 0,
        isOnline: false,
      }
    }
  },

  sendMessage: async (payload: Omit<CreateMessagePayload, "sender_id">, currentUserId: string): Promise<Message> => {
    console.log("📤 Sending message:", payload)

    if (apiConfig.useMockApi) {
      console.log("🎭 Using mock send message (configured)")
      await new Promise((resolve) => setTimeout(resolve, apiConfig.mockApiDelay))
      return {
        id: crypto.randomUUID(),
        content: payload.content,
        is_read: false,
        listing_id: payload.listing_id,
        sender_id: currentUserId,
        receiver_id: payload.receiver_id,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    try {
      const fullPayload: CreateMessagePayload = {
        ...payload,
        sender_id: currentUserId,
      }

      console.log("📤 Sending message with current user as sender:", fullPayload)
      const response = await apiClient.post<Message>("/chat", fullPayload)
      console.log("✅ Message sent successfully")
      return response.data
    } catch (error) {
      console.error("❌ Error sending message:", error)
      throw error
    }
  },

  updateMessage: async (messageId: string, payload: { content: string }): Promise<Message> => {
    console.log("✏️ Updating message:", { messageId, payload })

    if (apiConfig.useMockApi) {
      console.log("🎭 Using mock update message (configured)")
      await new Promise((resolve) => setTimeout(resolve, apiConfig.mockApiDelay))
      const existingMessage = mockMessages.find((m) => m.id === messageId)
      if (existingMessage) {
        return {
          ...existingMessage,
          content: payload.content,
          updated_at: new Date().toISOString(),
        }
      }
      throw new Error("Message not found")
    }

    try {
      const response = await apiClient.patch<Message>(`/chat/${messageId}`, payload)
      console.log("✅ Message updated successfully")
      return response.data
    } catch (error) {
      console.error("❌ Error updating message:", error)
      throw error
    }
  },

  markRead: async (messageId: string): Promise<void> => {
    console.log("📖 Marking message as read:", messageId)

    if (apiConfig.useMockApi) {
      console.log("🎭 Using mock mark read (configured)")
      await new Promise((resolve) => setTimeout(resolve, apiConfig.mockApiDelay))
      return
    }

    try {
      await apiClient.patch<void>(`/chat/${messageId}/read`, {})
      console.log("✅ Message marked as read")
    } catch (error) {
      console.error("❌ Error marking message as read:", error)
      // Don't throw here as this is not critical for user experience
    }
  },

  // Clear user info cache (useful for logout or user updates)
  clearUserCache: () => {
    userInfoCache.clear()
    console.log("🗑️ User info cache cleared")
  },
}
