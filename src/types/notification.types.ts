export interface Notification {
	id: string
	user_id: string
	message: string
	is_read: boolean
	created_at: string
  }
  
  export interface NotificationState {
	notifications: Notification[]
	unreadCount: number
	isLoading: boolean
	error: string | null
	isOpen: boolean
  }
  