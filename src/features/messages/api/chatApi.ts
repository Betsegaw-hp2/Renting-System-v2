import apiConfig from "@/config/api.config";
import type { Message } from "@/types/message.types";
import apiClient from "../../../api/client";

export const chatApi = {
  /** Fetch full history between current user and peer */
  fetchHistory: async (senderId: string, receiverId: string): Promise<Message[]> => {
    const { data } = await apiClient.get<Message[]>(
      `${apiConfig.apiBaseUrl}/chat/history/${senderId}/${receiverId}`
    );
    return data;
  },

  /** Mark a message as read */
  markRead: async (messageId: string): Promise<void> => {
    await apiClient.patch(`${apiConfig.apiBaseUrl}/chat/${messageId}/read`);
  },

  updateMessage: async (messageId: string, payload: { content: string }): Promise<Message> => {
    const { data } = await apiClient.patch<Message>(`${apiConfig.apiBaseUrl}/chat/${messageId}`, payload);
    return data;
  },
};
