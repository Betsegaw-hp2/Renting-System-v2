import { mockNotificationsApi } from "../../../api/mockNotificationsApi"
import { store } from "../../../store"
import type { Notification } from "../../../types/notification.types"
import { addNotification } from "../slices/notificationsSlice"

class NotificationWebSocketService {
  private socket: WebSocket | null = null
  private userId: string | null = null
  private reconnectAttempts = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  private mockCleanup: (() => void) | null = null

  connect(userId: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return
    }

    this.userId = userId

    // Use mock API in development
    if (process.env.NODE_ENV === "development") {
      console.log("Using mock WebSocket for notifications")
      this.mockCleanup = mockNotificationsApi.connectToWebSocket(userId, (notification) => {
        store.dispatch(addNotification(notification))
      })
      return
    }

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? window.location.origin.replace("http", "ws").replace("https", "wss")
        : "ws://localhost:8080"

    // Updated to match the exact endpoint from the documentation
    const socketURL = `${baseUrl}/v1/users/${userId}/notifications/connect`

    try {
      this.socket = new WebSocket(socketURL)

      this.socket.onopen = () => {
        console.log("Connected to notifications websocket")
        this.reconnectAttempts = 0
      }

      this.socket.onmessage = (event) => {
        try {
          const notification: Notification = JSON.parse(event.data)
          store.dispatch(addNotification(notification))
        } catch (error) {
          console.error("Error parsing notification:", error)
        }
      }

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error)
      }

      this.socket.onclose = (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason)
        if (!event.wasClean) {
          this.reconnect()
        }
      }
    } catch (error) {
      console.error("Error connecting to WebSocket:", error)
      this.reconnect()
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    if (this.mockCleanup) {
      this.mockCleanup()
      this.mockCleanup = null
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    this.userId = null
    this.reconnectAttempts = 0
  }

  private reconnect(): void {
    if (this.reconnectAttempts < 5 && this.userId) {
      const timeout = Math.pow(2, this.reconnectAttempts + 1) * 1000
      console.log(`Attempting to reconnect in ${timeout / 1000} seconds`)
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++
        if (this.userId) {
          this.connect(this.userId)
        }
      }, timeout)
    } else {
      console.error("Max reconnect attempts reached.")
    }
  }
}

// Export a singleton instance
export const notificationWebSocketService = new NotificationWebSocketService()