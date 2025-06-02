
// Based on actual API schema from Swagger documentation
export type NotificationType = 
  | "booking_confirmed"
  | "booking_request" 
  | "new_message"
  | "generic"

export interface NotificationPayload {
  // For booking-related notifications
  listing_id?: string;
  booking_id?: string;
  
  // For payment-related notifications
  payment_id?: string;
  invoice_url?: string;
  checkout_url?: string; // Added based on real API response
  amount?: number;
  currency?: string;
  // For message notifications
  chat_id?: string;
  sender_id?: string;
  receiver_id?: string;

  // For generic link notifications
  url?: string;
  link_text?: string;

  // Allow for additional custom fields
  [key: string]: any;
}

export interface Notification {
  id: string;
  user_id: string;
  created_at: string;
  is_read: boolean;
  type: NotificationType;
  title: string; // Required field based on API schema
  message: string;
  payload: NotificationPayload; // Object, not string - matches real API response
}
  
  export interface NotificationState {
	notifications: Notification[]
	unreadCount: number
	isLoading: boolean
	error: string | null
	isOpen: boolean
	wsConnected: boolean
  }
  