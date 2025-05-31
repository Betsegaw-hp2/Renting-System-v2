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
  
  // Reset checking state when user changes
  useEffect(() => {
    const userToCheck = currentUser || authUser
    const currentUserId = userToCheck?.id || null
    
    if (currentUserId !== lastUserId) {
      setHasCheckedTags(false)
      setLastUserId(currentUserId)
    }
  }, [currentUser, authUser, lastUserId])
    useEffect(() => {
    // Wait for authentication state to stabilize and user data to be loaded
    if (!is_authenticated || userLoading || authLoading) return
    
    const userToCheck = currentUser || authUser
    if (!userToCheck?.id || hasCheckedTags) return    // Check immediately if we have session storage flags set
    const shouldTriggerAfterLogin = sessionStorage.getItem('triggerTagPromptAfterLogin') === 'true'
    const shouldTriggerAfterSignup = sessionStorage.getItem('triggerTagPromptAfterSignup') === 'true'
      if (shouldTriggerAfterLogin || shouldTriggerAfterSignup) {
      sessionStorage.removeItem('triggerTagPromptAfterLogin')
      sessionStorage.removeItem('triggerTagPromptAfterSignup')
      sessionStorage.removeItem('skippedTagPrompt')
      setIsTagPromptOpen(true)
      setHasCheckedTags(true)
      return
    }    // For normal tag checking, add a small delay to ensure navigation is complete
    const timer = setTimeout(() => {
      const shouldShow = shouldShowTagPrompt(userToCheck)
      if (shouldShow) {
        setIsTagPromptOpen(true)
      }
      setHasCheckedTags(true)
    }, 200) // Increased delay slightly

    return () => clearTimeout(timer)
  }, [authUser, currentUser, hasCheckedTags, userLoading, authLoading, is_authenticated])

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
