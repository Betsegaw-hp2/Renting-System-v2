import { mockMessagesApi } from "@/api/mockMessagesApi";
import apiConfig from "@/config/api.config";
import type { Conversation, CreateMessagePayload, Message } from "@/types/message.types";
import apiClient from "../../../api/client";

const useMock = apiConfig.useMockApi;

export const chatApi = {
  // NEW!
  getConversations: async (): Promise<Conversation[]> =>
    useMock
      ? mockMessagesApi.getConversations()
      : (await apiClient.get<Conversation[]>(`${apiConfig.apiBaseUrl}/chat/conversations`)).data,

  fetchHistory: async (senderId: string, receiverId: string): Promise<Message[]> =>
    useMock
      ? mockMessagesApi.getChatHistory(senderId, receiverId)
      : (await apiClient.get<Message[]>(`${apiConfig.apiBaseUrl}/chat/history/${senderId}/${receiverId}`)).data,

  sendMessage: async (payload: CreateMessagePayload): Promise<Message> =>
    useMock
      ? mockMessagesApi.sendMessage(payload)
      : (await apiClient.post<Message>(`${apiConfig.apiBaseUrl}/chat`, payload)).data,

  markRead: async (messageId: string): Promise<void> =>
    useMock
      ? mockMessagesApi.markAsRead(messageId)
      : apiClient.patch(`${apiConfig.apiBaseUrl}/chat/${messageId}/read`),

  updateMessage: async (messageId: string, payload: { content: string }): Promise<Message> =>
    useMock
      ? mockMessagesApi.updateMessage(messageId, payload)
      : (await apiClient.patch<Message>(`${apiConfig.apiBaseUrl}/chat/${messageId}`, payload)).data,
};
