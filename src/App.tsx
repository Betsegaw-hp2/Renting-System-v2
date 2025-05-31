// App.tsx
"use client"

import { useEffect } from "react"
import { Provider, useDispatch, useSelector } from "react-redux"
import { ThemeProvider } from "./components/layout/ThemeProvider"
import { TagSelectionModal } from "./components/preferences/TagSelectionModal"
import { Toaster } from "./components/ui/toaster"
import { UserProvider } from "./contexts/UserContext"
import { fetchCurrentUser } from "./features/auth/slices/authSlice"
import { NotificationsProvider } from "./features/notifications/components/NotificationProvider"
import { useTagManager } from "./hooks/useTagManager"
import Routes from "./routes"
import { store, type AppDispatch, type RootState } from "./store"

function AppContent() {
  const dispatch = useDispatch<AppDispatch>()
  const { token, user } = useSelector((s: RootState) => s.auth)
  const { isTagPromptOpen, handleSaveTags, handleCloseTagPrompt } = useTagManager()

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
        
        {/* Tag Selection Modal */}        <TagSelectionModal
          isOpen={isTagPromptOpen}
          onClose={handleCloseTagPrompt}
          onSave={handleSaveTags}
          title="Choose Your Interests"
          description="Select tags that match your interests to get personalized recommendations for rentals."
          showSkipOption={true}
        />
      </NotificationsProvider>
    </ThemeProvider>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </Provider>
  )
}
