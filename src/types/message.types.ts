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
  partner_id: string
  partner_name: string
  partner_avatar: string
  last_message: string
  updated_at: string
  last_updated: string // Keep both for compatibility
  unread_count: number
  is_online?: boolean
}
