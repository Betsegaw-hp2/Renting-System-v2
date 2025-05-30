// App.tsx
"use client"

import { useEffect } from "react"
import { Provider, useDispatch, useSelector } from "react-redux"
import { ThemeProvider } from "./components/layout/ThemeProvider"
import { Toaster } from "./components/ui/toaster"
import { UserProvider } from "./contexts/UserContext"
import { fetchCurrentUser } from "./features/auth/slices/authSlice"
import { NotificationsProvider } from "./features/notifications/components/NotificationProvider"
import Routes from "./routes"
import { store, type AppDispatch, type RootState } from "./store"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

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
        <UserProvider>
          <NotificationsProvider>
            <Routes />
            <Toaster />
          </NotificationsProvider>
        </UserProvider>
        <ToastContainer position="top-right" autoClose={3000} />
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
