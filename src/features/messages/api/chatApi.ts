import apiClient from "@/api/client";
import apiConfig from "@/config/api.config";
import type { Message } from "@/types/message.types";

export const chatApi = {
  // Fetch chat history between two users for a specific listing
  fetchHistory: async (currentUserId: string, receiverId: string, listingId?: string): Promise<Message[]> => {
    console.log("📝 Fetching chat history:", { currentUserId, receiverId, listingId });
    if (apiConfig.useMockApi) {
      console.log("🎭 Using mock chat history (configured)");
      // const data = await mockMessagesApi.getChatHistory(currentUserId, receiverId);
      // return Array.isArray(data) ? data : [];
    }
    try {
      let url = `/chat/history/${currentUserId}/${receiverId}`;
      if (listingId) {
        url += `?listing_id=${listingId}`;
      }
      const response = await apiClient.get<Message[]>(url);
      const data = response.data ?? [];
      console.log("✅ Chat history loaded from API:", Array.isArray(data) ? data.length : 0, "messages");
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error fetching chat history:", error);
      return [];
    }
  },

  // Send a new message (NOTE: backend may not support this endpoint as POST, see OpenAPI doc)
  sendMessage: async (payload: { content: string; receiver_id: string; listing_id: string }, currentUserId: string): Promise<Message> => {
    console.log("📤 Sending message:", payload);
    if (apiConfig.useMockApi) {
      console.log("🎭 Using mock send message (configured)");
      // const fullPayload = { ...payload, sender_id: currentUserId };
      // return await mockMessagesApi.sendMessage(fullPayload);
    }
    try {
      // Only send { content } as per OpenAPI doc, but endpoint may not exist
      const response = await apiClient.post<Message>(
        `/listings/${payload.listing_id}/chat/${payload.receiver_id}`,
        { content: payload.content }
      );
      console.log("✅ Message sent successfully");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error sending message:", error);
      throw new Error("Failed to send message. This endpoint may not be implemented on the backend.");
    }
  },

  // Mark message as read
  markRead: async (messageId: string): Promise<void> => {
    console.log("📖 Marking message as read:", messageId);

    if (apiConfig.useMockApi) {
      // console.log("🎭 Using mock mark read (configured)");
      // return await mockMessagesApi.markAsRead(messageId);
    }

    try {
      await apiClient.patch<void>(`/chat/${messageId}/read`, {});
      console.log("✅ Message marked as read");
    } catch (error) {
      console.error("❌ Error marking message as read:", error);
    }
  },
};