import type { Conversation, Message } from "../types/message.types"

// Sample user data
const users = [
  { id: "user1", name: "Jacquenetta Slowgrave", avatar: "/placeholder.svg?height=40&width=40", isOnline: true },
  { id: "user2", name: "Nickola Peever", avatar: "/placeholder.svg?height=40&width=40", isOnline: true },
  { id: "user3", name: "Farand Hume", avatar: "/placeholder.svg?height=40&width=40", isOnline: false },
  { id: "user4", name: "Ossie Peasey", avatar: "/placeholder.svg?height=40&width=40", isOnline: true },
  { id: "user5", name: "Hall Negri", avatar: "/placeholder.svg?height=40&width=40", isOnline: false },
  { id: "user6", name: "Elyssa Segot", avatar: "/placeholder.svg?height=40&width=40", isOnline: true },
]

// Sample conversations
const mockConversations: Conversation[] = users.map((user, index) => ({
  id: `conv${index + 1}`,
  listing_id: `listing${index + 1}`,
  partnerId: user.id,
  partnerName: user.name,
  partnerAvatar: user.avatar,
  lastMessage:
    index % 2 === 0 ? "Hey, is this still available?" : "Yes, it's available. When would you like to see it?",
  lastUpdated: new Date(Date.now() - index * 3600000).toISOString(),
  unreadCount: index % 3,
  isOnline: user.isOnline,
}))

// Sample messages for each conversation
const mockMessages: Record<string, Message[]> = {}

// Generate mock messages for each conversation
mockConversations.forEach((conv) => {
  const messages: Message[] = []
  const count = 5 + Math.floor(Math.random() * 10) // 5-15 messages

  for (let i = 0; i < count; i++) {
    const isFromPartner = i % 2 === 0
    const timestamp = new Date(Date.now() - (count - i) * 600000).toISOString()

    messages.push({
      id: `msg_${conv.id}_${i}`,
      content: isFromPartner
        ? "I know how important this file is to you. You can trust me ;)"
        : "Thanks for the quick response! Looking forward to it.",
      is_read: i < count - (conv.unreadCount || 0),
      listing_id: conv.listing_id,
      sender_id: isFromPartner ? conv.partnerId : "currentUser", // Assuming current user
      receiver_id: isFromPartner ? "currentUser" : conv.partnerId,
      sent_at: timestamp,
      updated_at: timestamp,
    })
  }

  mockMessages[conv.listing_id + "_" + conv.partnerId] = messages
})

export const mockDataService = {
  getConversations: async (userId: string): Promise<Conversation[]> => {
    return mockConversations
  },

  getChatHistory: async (senderId: string, receiverId: string, listingId: string): Promise<Message[]> => {
    const key = listingId + "_" + receiverId
    return mockMessages[key] || []
  },

  markMessageAsRead: async (messageId: string): Promise<void> => {
    // In a real implementation, this would update the message in the mockMessages object
    return Promise.resolve()
  },

  updateMessage: async (messageId: string, content: string): Promise<Message> => {
    // Find the message in our mock data
    let updatedMessage: Message | null = null

    Object.keys(mockMessages).forEach((key) => {
      const message = mockMessages[key].find((m) => m.id === messageId)
      if (message) {
        message.content = content
        message.updated_at = new Date().toISOString()
        updatedMessage = message
      }
    })

    if (!updatedMessage) {
      throw new Error("Message not found")
    }

    return updatedMessage
  },
}
