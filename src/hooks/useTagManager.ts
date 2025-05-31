import { tagApi } from "@/api/tagApi"
import { useUser } from "@/contexts/UserContext"
import type { RootState } from "@/store"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

export function useTagManager() {
  const { currentUser, refreshUser } = useUser()
  const { user: authUser } = useSelector((state: RootState) => state.auth)
  const [isTagPromptOpen, setIsTagPromptOpen] = useState(false)
  const [hasCheckedTags, setHasCheckedTags] = useState(false)

  useEffect(() => {
    const userToCheck = currentUser || authUser
    if (!userToCheck?.id || hasCheckedTags) return

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

    const shouldShow = shouldShowTagPrompt(userToCheck)
    if (shouldShow) {
      setIsTagPromptOpen(true)
    }
    setHasCheckedTags(true)
  }, [authUser, currentUser, hasCheckedTags])

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
