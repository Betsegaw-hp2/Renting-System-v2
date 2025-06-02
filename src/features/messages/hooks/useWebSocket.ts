import { useEffect } from "react";
import { chatWebSocketService } from "@/features/messages/services/chatWebSocket";
import { useUser } from "@/contexts/UserContext";
import { getAuthToken } from "@/lib/cookies";
import type { CreateMessagePayload } from "@/types/message.types";

export function useWebSocket(listingId?: string, receiverId?: string) {
  const { currentUser } = useUser();

  useEffect(() => {
    if (!listingId || !receiverId || !currentUser) return;
    const token = getAuthToken();
    if (!token) return;
    chatWebSocketService.connect(listingId, receiverId, token);
    return () => chatWebSocketService.disconnect();
  }, [listingId, receiverId, currentUser]);

  function sendMessageWS(payload: CreateMessagePayload) {
    chatWebSocketService.send(payload);
  }

  return { sendMessageWS };
}
