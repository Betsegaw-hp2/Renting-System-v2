"use client"

import { useEffect } from "react"
import { Provider } from "react-redux"
import { ThemeProvider } from "./components/layout/ThemeProvider"
import { Toaster } from "./components/ui/toaster"
import { fetchCurrentUser } from "./features/auth/slices/authSlice"
import { getAuthToken } from "./lib/cookies"
import Routes from "./routes"
import { store } from "./store"


function App() {
  useEffect(() => {
    // Check if user is logged in on app startup
    if (getAuthToken()) {
      store.dispatch(fetchCurrentUser())
    }
  }, [])

  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="light" storageKey="rental-theme">
        <Routes />
        <Toaster />
      </ThemeProvider>
    </Provider>
  )
}

export default App
