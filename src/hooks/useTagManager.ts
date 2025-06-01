import { tagApi } from "@/api/tagApi"
import { useUser } from "@/contexts/UserContext"
import type { RootState } from "@/store"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

export function useTagManager() {
  const { currentUser, loading: userLoading, refreshUser } = useUser()
  const { user: authUser, is_loading: authLoading, is_authenticated } = useSelector((state: RootState) => state.auth)
  const [isTagPromptOpen, setIsTagPromptOpen] = useState(false)
  const [hasCheckedTags, setHasCheckedTags] = useState(false)
  const [lastUserId, setLastUserId] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  // Update current path when it changes
  useEffect(() => {
    const updatePath = () => setCurrentPath(window.location.pathname)
    window.addEventListener('popstate', updatePath)
    // Also listen for programmatic navigation
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState
    
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args)
      updatePath()
    }
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args)
      updatePath()
    }
    
    return () => {
      window.removeEventListener('popstate', updatePath)
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [])

  // Define routes where tag prompt should NOT appear
  const isOnVerificationPage = currentPath.includes('/verify-email') || 
                               currentPath.includes('/email-verification') ||
                               currentPath === '/verify' ||
                               currentPath.includes('/oauth') ||
                               currentPath.includes('/auth/callback')
    // Reset checking state when user changes
  useEffect(() => {
    const userToCheck = currentUser || authUser
    const currentUserId = userToCheck?.id || null
    
    if (currentUserId !== lastUserId) {
      setHasCheckedTags(false)
      setLastUserId(currentUserId)
    }
  }, [currentUser, authUser, lastUserId])
    // Reset checking state when leaving verification pages
  useEffect(() => {
    if (!isOnVerificationPage) {
      setHasCheckedTags(false)
    }
  }, [isOnVerificationPage])
  
  useEffect(() => {
    // Don't show tag prompt on verification pages
    if (isOnVerificationPage) return
    
    // Wait for authentication state to stabilize and user data to be loaded
    if (!is_authenticated || userLoading || authLoading) return
    
    const userToCheck = currentUser || authUser
    if (!userToCheck?.id || hasCheckedTags) return

    // Check immediately if we have session storage flags set
    const shouldTriggerAfterLogin = sessionStorage.getItem('triggerTagPromptAfterLogin') === 'true'
    const shouldTriggerAfterSignup = sessionStorage.getItem('triggerTagPromptAfterSignup') === 'true'
    
    if (shouldTriggerAfterLogin || shouldTriggerAfterSignup) {
      sessionStorage.removeItem('triggerTagPromptAfterLogin')
      sessionStorage.removeItem('triggerTagPromptAfterSignup')
      sessionStorage.removeItem('skippedTagPrompt')
      setIsTagPromptOpen(true)
      setHasCheckedTags(true)
      return
    }

    // For normal tag checking, add a small delay to ensure navigation is complete
    const timer = setTimeout(() => {
      const shouldShow = shouldShowTagPrompt(userToCheck)
      if (shouldShow) {
        setIsTagPromptOpen(true)
      }
      setHasCheckedTags(true)
    }, 200) // Increased delay slightly

    return () => clearTimeout(timer)
  }, [authUser, currentUser, hasCheckedTags, userLoading, authLoading, is_authenticated, isOnVerificationPage, currentPath])

  const shouldShowTagPrompt = (user: any): boolean => {
    if (sessionStorage.getItem('skippedTagPrompt') === 'true') {
      return false
    }
    return !user.tags || user.tags.length === 0
  }

  const manuallyOpenTagPrompt = () => {
    setIsTagPromptOpen(true)
  }

  const handleSaveTags = async (selectedTagIds: string[]): Promise<void> => {
    const userToCheck = currentUser || authUser
    if (!userToCheck?.id) throw new Error("No user logged in")

    try {
      await tagApi.updateUserTags(userToCheck.id, selectedTagIds)
      await refreshUser()
      setIsTagPromptOpen(false)
      sessionStorage.removeItem('skippedTagPrompt')
    } catch (error) {
      console.error("Failed to save tags:", error)
      throw error
    }
  }

  const handleCloseTagPrompt = () => {
    setIsTagPromptOpen(false)
    sessionStorage.setItem('skippedTagPrompt', 'true')
  }

  return {
    isTagPromptOpen,
    manuallyOpenTagPrompt,
    handleSaveTags,
    handleCloseTagPrompt
  }
}
