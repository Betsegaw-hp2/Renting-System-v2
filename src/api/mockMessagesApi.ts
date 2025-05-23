// in‐memory stub data for dev
import type { Conversation, CreateMessagePayload, Message } from "@/types/message.types";

let _conversations: Conversation[] = [
  {
    id: "conv-1",
    partnerId: "user-123",
    partnerName: "Alice Johnson",
    partnerAvatar: "/avatars/alice.jpg",
    lastMessage: "See you tomorrow!",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "conv-2",
    partnerId: "user-456",
    partnerName: "Bob Smith",
    partnerAvatar: "/avatars/bob.jpg",
    lastMessage: "Thanks for booking.",
    updatedAt: new Date().toISOString(),
  },
];

let _messages: Record<string, Message[]> = {
  "user-me|user-123": [
    {
      id: "msg-1",
      content: "Hey Alice!",
      listing_id: "list-1",
      sender_id: "user-me",
      receiver_id: "user-123",
      is_read: true,
      sent_at: new Date(Date.now() - 3600_000).toISOString(),
      updated_at: new Date(Date.now() - 3600_000).toISOString(),
    },
    {
      id: "msg-2",
      content: "See you tomorrow!",
      listing_id: "list-1",
      sender_id: "user-123",
      receiver_id: "user-me",
      is_read: false,
      sent_at: new Date(Date.now() - 1_800_000).toISOString(),
      updated_at: new Date(Date.now() - 1_800_000).toISOString(),
    },
  ],
  "user-me|user-456": [
    {
      id: "msg-3",
      content: "Hello Bob",
      listing_id: "list-2",
      sender_id: "user-me",
      receiver_id: "user-456",
      is_read: true,
      sent_at: new Date(Date.now() - 7_200_000).toISOString(),
      updated_at: new Date(Date.now() - 7_200_000).toISOString(),
    },
    {
      id: "msg-4",
      content: "Thanks for booking.",
      listing_id: "list-2",
      sender_id: "user-456",
      receiver_id: "user-me",
      is_read: false,
      sent_at: new Date(Date.now() - 900_000).toISOString(),
      updated_at: new Date(Date.now() - 900_000).toISOString(),
    },
  ],
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockMessagesApi = {
  getConversations: async (): Promise<Conversation[]> => {
    await wait(200);
    return [..._conversations];
  },

  getChatHistory: async (senderId: string, receiverId: string): Promise<Message[]> => {
    await wait(200);
    return _messages[`${senderId}|${receiverId}`] ?? [];
  },

  sendMessage: async (payload: CreateMessagePayload): Promise<Message> => {
    await wait(200);
    const msg: Message = {
      id: crypto.randomUUID(),
      ...payload,
      is_read: false,
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const key = `${payload.sender_id}|${payload.receiver_id}`;
    _messages[key] = (_messages[key] || []).concat(msg);

    const conv = _conversations.find((c) => c.partnerId === payload.receiver_id);
    if (conv) {
      conv.lastMessage = msg.content;
      conv.updatedAt = msg.sent_at;
    }
    return msg;
  },

  updateMessage: async (id: string, { content }: { content: string }): Promise<Message> => {
    await wait(200);
    for (const key of Object.keys(_messages)) {
      const idx = _messages[key].findIndex((m) => m.id === id);
      if (idx !== -1) {
        const m = _messages[key][idx];
        m.content = content;
        m.updated_at = new Date().toISOString();
        return m;
      }
    }
    throw new Error("Message not found");
  },

  markAsRead: async (id: string): Promise<void> => {
    await wait(200);
    for (const key of Object.keys(_messages)) {
      const msg = _messages[key].find((m) => m.id === id);
      if (msg) {
        msg.is_read = true;
        return;
      }
    }
  },
};
