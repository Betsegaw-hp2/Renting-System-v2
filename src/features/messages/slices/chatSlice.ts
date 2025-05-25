import type { Conversation, CreateMessagePayload, Message } from "@/types/message.types"
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { chatApi } from "../api/chatApi"

interface ChatState {
  conversations: Conversation[]
  history: Message[]
  loadingConversations: boolean
  loadingHistory: boolean
  loadingSend: boolean
  error?: string
}

const initialState: ChatState = {
  conversations: [],
  history: [],
  loadingConversations: false,
  loadingHistory: false,
  loadingSend: false,
  error: undefined,
}

// Thunks - now accept currentUserId as parameter to avoid redundant /users/me calls
export const fetchConversations = createAsyncThunk<Conversation[], string, { rejectValue: string }>(
  "chat/fetchConversations",
  async (currentUserId: string, { rejectWithValue }) => {
    try {
      return await chatApi.getConversations(currentUserId)
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  },
)

export const loadHistory = createAsyncThunk<
  Message[],
  { currentUserId: string; receiverId: string; listingId?: string },
  { rejectValue: string }
>("chat/loadHistory", async ({ currentUserId, receiverId, listingId }, { rejectWithValue }) => {
  try {
    return await chatApi.fetchHistory(currentUserId, receiverId, listingId)
  } catch (err: any) {
    return rejectWithValue(err.message)
  }
})

export const sendMessage = createAsyncThunk<
  Message,
  { payload: Omit<CreateMessagePayload, "sender_id">; currentUserId: string },
  { rejectValue: string }
>("chat/sendMessage", async ({ payload, currentUserId }, { rejectWithValue }) => {
  try {
    return await chatApi.sendMessage(payload, currentUserId)
  } catch (err: any) {
    return rejectWithValue(err.message)
  }
})

export const editMessage = createAsyncThunk<Message, { messageId: string; content: string }, { rejectValue: string }>(
  "chat/editMessage",
  async ({ messageId, content }, { rejectWithValue }) => {
    try {
      return await chatApi.updateMessage(messageId, { content })
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  },
)

export const markMessageRead = createAsyncThunk<void, string, { rejectValue: string }>(
  "chat/markMessageRead",
  async (id, { rejectWithValue }) => {
    try {
      await chatApi.markRead(id)
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  },
)

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    receiveMessage: (state, action: PayloadAction<Message>) => {
      state.history.push(action.payload)
    },
    addConversation: (state, action: PayloadAction<Conversation>) => {
      const existingIndex = state.conversations.findIndex(
        (c) => c.listing_id === action.payload.listing_id && c.partnerId === action.payload.partnerId,
      )
      if (existingIndex >= 0) {
        state.conversations[existingIndex] = action.payload
      } else {
        state.conversations.unshift(action.payload)
      }
    },
    clearHistory: (state) => {
      state.history = []
    },
    updateConversationLastMessage: (
      state,
      action: PayloadAction<{ listingId: string; partnerId: string; message: Message }>,
    ) => {
      const conversation = state.conversations.find(
        (c) => c.listing_id === action.payload.listingId && c.partnerId === action.payload.partnerId,
      )
      if (conversation) {
        conversation.lastMessage = action.payload.message.content
        conversation.lastUpdated = action.payload.message.sent_at
        conversation.updatedAt = action.payload.message.sent_at
      }
    },
  },
  extraReducers: (b) => {
    b
      // conversations
      .addCase(fetchConversations.pending, (s) => {
        s.loadingConversations = true
        s.error = undefined
      })
      .addCase(fetchConversations.fulfilled, (s, a) => {
        s.loadingConversations = false
        s.conversations = a.payload
      })
      .addCase(fetchConversations.rejected, (s, a) => {
        s.loadingConversations = false
        s.error = a.payload
      })

      // history
      .addCase(loadHistory.pending, (s) => {
        s.loadingHistory = true
        s.error = undefined
      })
      .addCase(loadHistory.fulfilled, (s, a) => {
        s.loadingHistory = false
        s.history = a.payload
      })
      .addCase(loadHistory.rejected, (s, a) => {
        s.loadingHistory = false
        s.error = a.payload
      })

      // send
      .addCase(sendMessage.pending, (s) => {
        s.loadingSend = true
      })
      .addCase(sendMessage.fulfilled, (s, a) => {
        s.loadingSend = false
        s.history.push(a.payload)
      })
      .addCase(sendMessage.rejected, (s, a) => {
        s.loadingSend = false
        s.error = a.payload
      })

      // edit
      .addCase(editMessage.fulfilled, (s, a) => {
        const i = s.history.findIndex((m) => m.id === a.payload.id)
        if (i !== -1) s.history[i] = a.payload
      })

      // mark read
      .addCase(markMessageRead.fulfilled, (s, a) => {
        const m = s.history.find((msg) => msg.id === a.meta.arg)
        if (m) m.is_read = true
      })
  },
})

export const { receiveMessage, addConversation, clearHistory, updateConversationLastMessage } = chatSlice.actions
export default chatSlice.reducer
