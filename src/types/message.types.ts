export interface Conversation {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  lastMessage: string;
  listing_id: string;
  updatedAt: string;    // ISO timestamp
}

export interface Message {
  id: string;
  content: string;
  is_read: boolean;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  sent_at: string;
  updated_at: string;
}

export interface CreateMessagePayload {
  content: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
}
