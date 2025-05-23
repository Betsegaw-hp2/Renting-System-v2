import apiConfig from "@/config/api.config";
import { store } from "../../../store";
import type { CreateMessagePayload, Message } from "../../../types/message.types";
import { receiveMessage } from "../slices/chatSlices";

export class ChatWebSocketService {
  private socket: WebSocket | null = null;
  private connected: boolean = false;

  connect(listingId: string, receiverId: string, token: string) {
    // Prevent duplicate connections
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

     const url = new URL(apiConfig.apiBaseUrl)
    url.protocol = url.protocol.replace("https", "wss")
    url.pathname = `/v1/listings/${listingId}/chat/${receiverId}`;
    url.searchParams.set("token", token)
    
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.connected = true;
      console.log("Chat WS open");
    };

    this.socket.onmessage = (e) => {
    const raw: Partial<Message> = JSON.parse(e.data);
    const msg: Message = {
      id: raw.id ?? crypto.randomUUID(),
      content: raw.content || "",
      listing_id: raw.listing_id || "",
      sender_id: raw.sender_id || "",
      receiver_id: raw.receiver_id || "",
      is_read: raw.is_read ?? false,
      sent_at: raw.sent_at ?? new Date().toISOString(),
      updated_at: raw.updated_at ?? raw.sent_at ?? new Date().toISOString(),
    };
    store.dispatch(receiveMessage(msg));
  };

    this.socket.onerror = (err) => {
      // Only log if already connected (ignore connect-time errors)
      if (this.connected) {
        console.error("Chat WS error", err);
      }
    };

    this.socket.onclose = (e) => {
      console.warn("Chat WS closed", e.reason);
      this.connected = false;
    };
  }

  send(msg: CreateMessagePayload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    } else {
      console.warn("Chat WS not open; cannot send message");
    }
  }

  disconnect() {
    if (this.socket) {
      try {
        if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
          this.socket.close();
        }
      } catch {
        // swallow close errors
      }
      this.socket = null;
      this.connected = false;
    }
  }
}

export const chatWebSocketService = new ChatWebSocketService();
