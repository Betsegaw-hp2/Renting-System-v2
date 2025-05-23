import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Message } from "../../../types/message.types";
import { chatApi } from "../api/chatApi";

interface ChatState {
  history: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  history: [],
  loading: false,
  error: null,
};

export const loadHistory = createAsyncThunk<
  Message[],
  { senderId: string; receiverId: string },
  { rejectValue: string }
>(
  "chat/loadHistory",
  async ({ senderId, receiverId }, { rejectWithValue }) => {
    try {
      return await chatApi.fetchHistory(senderId, receiverId);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load chat history");
    }
  }
);

export const editMessage = createAsyncThunk<
  Message,
  { id: string; content: string },
  { rejectValue: string }
>(
  "chat/editMessage",
  async ({ id, content }, { rejectWithValue }) => {
    try {
      return await chatApi.updateMessage(id, { content });
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to edit message");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    receiveMessage: (state, action: PayloadAction<Message>) => {
      if (Array.isArray(state.history)) {
        state.history.push(action.payload);
      }
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(loadHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadHistory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.history = payload || [];
      })
      .addCase(loadHistory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? null;
      })
      .addCase(editMessage.fulfilled, (state, { payload }) => {
        // replace the message in history
        const idx = state.history.findIndex((m) => m.id === payload.id);
        if (idx !== -1) {
          state.history[idx] = payload;
        }
      })
      .addCase(editMessage.rejected, (state, { payload }) => {
        state.error = payload ?? null;
      }),
});

export const { receiveMessage } = chatSlice.actions;
export default chatSlice.reducer;
