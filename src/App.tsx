// App.tsx
"use client"

import { Provider, useDispatch, useSelector } from "react-redux"
import { ThemeProvider } from "./components/layout/ThemeProvider"
import { Toaster } from "./components/ui/toaster"
import { NotificationsProvider } from "./features/notifications/components/NotificationProvider"
import Routes from "./routes"
import { store, type AppDispatch, type RootState } from "./store"
import { useEffect } from "react"
import { fetchCurrentUser } from "./features/auth/slices/authSlice"

function AppContent() {
  const dispatch = useDispatch<AppDispatch>()
  const { token, user } = useSelector((s: RootState) => s.auth)

  useEffect(() => {
    if (token && user === null) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch, token, user])

  return (
    <ThemeProvider defaultTheme="light" storageKey="rental-theme">
      <NotificationsProvider>
        <Routes />
        <Toaster />
      </NotificationsProvider>
    </ThemeProvider>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}
