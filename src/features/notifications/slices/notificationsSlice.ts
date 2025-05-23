import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Notification, NotificationState } from "../../../types/notification.types"
import { notificationsApi } from "../api/notificationsApi"

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  isOpen: false,
  wsConnected: false,
}

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  if (typeof error === "string") return error
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.response?.data?.error) return error.response.data.error
  if (error?.message) return error.message
  return "An unknown error occurred"
}

// Async thunks
export const fetchUserNotifications = createAsyncThunk(
  "notifications/fetchUserNotifications",
  async (userId: string, { rejectWithValue }) => {
    try {
      const notifications = await notificationsApi.getUserNotifications(userId)
      return notifications
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id: string, { rejectWithValue }) => {
    try {
      await notificationsApi.markAsRead(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (userId: string, { rejectWithValue, dispatch, getState }) => {
    try {
      const state = getState() as { notifications: NotificationState }
      const unreadNotifications = (state.notifications.notifications ?? []).filter((n) => !n.is_read)

      // Mark each notification as read
      await Promise.all(
        unreadNotifications.map(async (notification) => {
          await notificationsApi.markAsRead(notification.id)
          dispatch(markNotificationAsRead.fulfilled(notification.id, "markNotificationAsRead", notification.id))
        }),
      )

      return userId
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.is_read) {
        state.unreadCount += 1
      }
    },
    toggleNotificationsPanel: (state) => {
      state.isOpen = !state.isOpen
    },
    closeNotificationsPanel: (state) => {
      state.isOpen = false
    },
    setWsConnected: (state) => { state.wsConnected = true },
    setWsDisconnected: (state) => { state.wsConnected = false }
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder.addCase(fetchUserNotifications.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchUserNotifications.fulfilled, (state, action) => {
      state.isLoading = false
      state.notifications = action.payload
      state.unreadCount = (action.payload ?? []).filter((notification) => !notification.is_read).length
    })
    builder.addCase(fetchUserNotifications.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Mark as read
    builder.addCase(markNotificationAsRead.pending, (state, action) => {
      // Optimistically update the UI
      const notificationId = action.meta.arg
      const notification = state.notifications.find((n) => n.id === notificationId)
      if (notification && !notification.is_read) {
        notification.is_read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    })
    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      // Already updated in pending, nothing to do here
    })
    builder.addCase(markNotificationAsRead.rejected, (state, action) => {
      // Revert the optimistic update if the API call fails
      const notificationId = action.meta.arg
      const notification = state.notifications.find((n) => n.id === notificationId)
      if (notification && notification.is_read) {
        notification.is_read = false
        state.unreadCount += 1
      }
    })

    // Mark all as read is handled in the thunk itself
  },
})

export const { addNotification, toggleNotificationsPanel, closeNotificationsPanel, setWsConnected, setWsDisconnected } = notificationsSlice.actions
export default notificationsSlice.reducer