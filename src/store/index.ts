import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/slices/authSlice"
import chatReducer from "../features/messages/slices/chatSlice"
import notificationsReducer from "../features/notifications/slices/notificationsSlice"
import adminReportReducer from "../features/report/slices/adminReportSlice"
import reportReducer from "../features/report/slices/reportSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
    chat: chatReducer,
    report: reportReducer,
    adminReports: adminReportReducer,
    // Add other reducers here as your app grows
    // ... other reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  // ... other store configuration
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
