export interface Message {
  id: string
  content: string
  is_read: boolean
  listing_id: string
  sender_id: string
  receiver_id: string
  sent_at: string
  updated_at: string
  is_sending?: boolean
  error?: boolean
}

export interface CreateMessagePayload {
  content: string
  listing_id: string
  sender_id: string
  receiver_id: string
}

export interface Conversation {
  id: string
  listing_id: string
  partnerId: string
  partnerName: string
  partnerAvatar: string
  lastMessage: string
  updatedAt: string
  lastUpdated: string // Keep both for compatibility
  unreadCount: number
  isOnline?: boolean
}
