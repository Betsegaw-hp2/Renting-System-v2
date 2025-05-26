export interface Message {
  id: string
  content: string
  is_read: boolean
  listing_id: string
  sender_id: string
  receiver_id: string
  sent_at: string
  updated_at: string
  attachments?: MessageAttachment[]
  is_sending?: boolean
  error?: boolean
}

export interface MessageAttachment {
  id: string
  type: "image" | "video" | "file"
  url: string
  thumbnail_url?: string
  file_name?: string
  file_size?: number
  duration?: number // For videos
  width?: number
  height?: number
}

export interface CreateMessagePayload {
  content: string
  listing_id: string
  sender_id: string
  receiver_id: string
  attachments?: File[]
}

export interface Conversation {
  id: string
  listing_id: string
  partnerId: string
  partnerName: string
  partnerAvatar: string
  lastMessage: string
  lastUpdated: string
  unreadCount: number
  isOnline?: boolean
}
