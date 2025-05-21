import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/slices/authSlice"
import notificationsReducer from "../features/notifications/slices/notificationsSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
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
