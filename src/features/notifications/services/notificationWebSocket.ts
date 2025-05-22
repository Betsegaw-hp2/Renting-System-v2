import apiConfig from "@/config/api.config"
import { getAuthToken } from "@/lib/cookies"
import { store } from "../../../store"
import { addNotification, setWsConnected, setWsDisconnected } from "../slices/notificationsSlice"

class NotificationWebSocketService {
  private socket: WebSocket | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private userId: string | null = null

  connect(userId: string, authToken: string) {
    if (this.socket?.readyState === WebSocket.OPEN) return
    this.userId = userId

    if (apiConfig.useMockApi) {
      // ... your mock logic
      return
    }

    const url = new URL(apiConfig.apiBaseUrl)
    url.protocol = url.protocol.replace("https", "wss")
    url.pathname = `/v1/users/${userId}/notifications/connect`
    url.searchParams.set("token", authToken)

    this.socket = new WebSocket(url.toString())

    this.socket.onopen = () => {
      console.log("✅ WS open")
      this.reconnectAttempts = 0
      // start heartbeat
      this.heartbeatTimer = setInterval(() => {
        this.socket?.send(JSON.stringify({ type: "ping" }))
      }, 30_000)
      store.dispatch(setWsConnected());
    }

    this.socket.onmessage = (ev) => {
      try {
        const notification = JSON.parse(ev.data)
        store.dispatch(addNotification(notification))
      } catch {
        console.error("❌ WS parse error")
      }
    }

    this.socket.onclose = (ev) => {
      console.log("🔒 WS closed", ev.code, ev.reason)
      store.dispatch(setWsDisconnected());
      if (!ev.wasClean) this.scheduleReconnect()
      this.cleanupHeartbeat()
    }

    this.socket.onerror = (err) => {
      console.error("⚠️ WS error", err)
      store.dispatch(setWsDisconnected());
      this.socket?.close()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < 5 && this.userId) {
      const delay = 2 ** this.reconnectAttempts * 1000
      this.reconnectTimer = setTimeout(() => {
        this.reconnectAttempts++
        this.connect(this.userId!, getAuthToken()!) 
      }, delay)
    } else {
      console.error("Max WS reconnect attempts reached")
    }
  }

  private cleanupHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
    this.heartbeatTimer = null
  }

  disconnect() {
    this.socket?.close()
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.cleanupHeartbeat()
    this.socket = null
    this.userId = null
    this.reconnectAttempts = 0
  }
}

export const notificationWebSocketService = new NotificationWebSocketService()
