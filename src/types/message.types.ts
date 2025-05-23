
export interface Message {
  /** Unique identifier for the message */
  id: string;
  /** The text content of the message */
  content: string;
  /** Whether the receiver has read this message */
  is_read: boolean;
  /** ID of the listing this chat is associated with */
  listing_id: string;
  /** The user ID of the message recipient */
  receiver_id: string;
  /** The user ID of the message sender */
  sender_id: string;
  /** ISO-8601 timestamp when the message was sent */
  sent_at: string;
  /** ISO-8601 timestamp when the message was last updated */
  updated_at: string;
}

export interface CreateMessagePayload {
  content: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
}