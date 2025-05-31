import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { tagApi } from "@/api/tagApi"
import { useUser } from "@/contexts/UserContext"
import type { RootState } from "@/store"

export function useTagManager() {
  const { currentUser, refreshUser } = useUser()
  const { user: authUser } = useSelector((state: RootState) => state.auth)
  const [isTagPromptOpen, setIsTagPromptOpen] = useState(false)
  const [hasCheckedTags, setHasCheckedTags] = useState(false)
  const [lastCheckedUserId, setLastCheckedUserId] = useState<string | null>(null)  // Check if user needs tag prompt when user data loads
  useEffect(() => {
    // Get the current user - prioritize UserContext over Redux
    const userToCheck = currentUser || authUser
    const userId = userToCheck?.id
    
    console.log("🏷️ Tag manager effect triggered:", {
      hasUserContext: !!currentUser,
      hasAuthUser: !!authUser,
      userId,
      hasCheckedTags,
      lastCheckedUserId
    })
    
    if (!userToCheck || !userId) {
      console.log("🏷️ No user available yet, waiting...")
      return
    }

    // Reset check state if user changed
    if (userId !== lastCheckedUserId) {
      console.log("🔄 User changed, resetting tag check state:", { prev: lastCheckedUserId, current: userId })
      setHasCheckedTags(false)
      setLastCheckedUserId(userId)
      sessionStorage.setItem('lastCheckedUserId', userId)
    }

    // Only proceed if we haven't checked tags for this user yet
    if (hasCheckedTags && userId === lastCheckedUserId) {
      return
    }
    
    console.log("🏷️ Performing tag check for user:", userId)
    
    // Check for auth trigger flags first
    const shouldTriggerAfterLogin = sessionStorage.getItem('triggerTagPromptAfterLogin') === 'true'
    const shouldTriggerAfterSignup = sessionStorage.getItem('triggerTagPromptAfterSignup') === 'true'
    
    if (shouldTriggerAfterLogin || shouldTriggerAfterSignup) {
      console.log("🚀 Triggering tag prompt after auth:", { 
        login: shouldTriggerAfterLogin, 
        signup: shouldTriggerAfterSignup,
        userTags: userToCheck.tags
      })
      
      // Clear the trigger flags
      sessionStorage.removeItem('triggerTagPromptAfterLogin')
      sessionStorage.removeItem('triggerTagPromptAfterSignup')
      sessionStorage.removeItem('skippedTagPrompt') // Clear any previous skip
      
      setIsTagPromptOpen(true)
      setHasCheckedTags(true)
      return
    }

    // Normal check for tag prompt (for existing users)
    const shouldShow = shouldShowTagPrompt(userToCheck)
    if (shouldShow) {
      console.log("🏷️ Showing normal tag prompt for user without tags")
      setIsTagPromptOpen(true)
    } else {
      console.log("🏷️ Not showing tag prompt:", {
        hasSkipped: sessionStorage.getItem('skippedTagPrompt') === 'true',
        hasTags: userToCheck.tags && userToCheck.tags.length > 0,
        tagCount: userToCheck.tags?.length || 0
      })
    }
    
    setHasCheckedTags(true)
  }, [authUser, currentUser, hasCheckedTags, lastCheckedUserId])
  // Additional effect to catch any missed login triggers with periodic checking
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    let timeout: NodeJS.Timeout | null = null

    const checkLoginTriggers = () => {
      const shouldTriggerAfterLogin = sessionStorage.getItem('triggerTagPromptAfterLogin') === 'true'
      const shouldTriggerAfterSignup = sessionStorage.getItem('triggerTagPromptAfterSignup') === 'true'
      
      if (shouldTriggerAfterLogin || shouldTriggerAfterSignup) {
        const userToCheck = currentUser || authUser
        if (userToCheck) {
          console.log("🚀 Periodic check - found trigger flag, opening tag prompt:", { 
            login: shouldTriggerAfterLogin, 
            signup: shouldTriggerAfterSignup,
            userId: userToCheck.id
          })
          
          sessionStorage.removeItem('triggerTagPromptAfterLogin')
          sessionStorage.removeItem('triggerTagPromptAfterSignup')
          sessionStorage.removeItem('skippedTagPrompt')
          
          setIsTagPromptOpen(true)
          setHasCheckedTags(true)
          
          // Clear the interval since we found and handled the trigger
          if (interval) clearInterval(interval)
          if (timeout) clearTimeout(timeout)
        }
      }
    }

    // Start periodic checking only if we have trigger flags but no prompt is open yet
    const hasLoginTrigger = sessionStorage.getItem('triggerTagPromptAfterLogin') === 'true'
    const hasSignupTrigger = sessionStorage.getItem('triggerTagPromptAfterSignup') === 'true'
    
    if ((hasLoginTrigger || hasSignupTrigger) && !isTagPromptOpen) {
      console.log("🔍 Starting periodic check for login/signup triggers")
      
      // Check immediately
      checkLoginTriggers()
      
      // Then check every 500ms for up to 5 seconds
      interval = setInterval(checkLoginTriggers, 500)
      timeout = setTimeout(() => {
        if (interval) clearInterval(interval)
        console.log("⏰ Stopping periodic trigger check after 5 seconds")
      }, 5000)
    }

    return () => {
      if (interval) clearInterval(interval)
      if (timeout) clearTimeout(timeout)
    }
  }, [authUser, currentUser, isTagPromptOpen])

  const shouldShowTagPrompt = (user: any): boolean => {
    // Don't show if user has already skipped this session
    if (sessionStorage.getItem('skippedTagPrompt') === 'true') {
      return false
    }

    // Don't show if user already has tags
    if (user.tags && user.tags.length > 0) {
      return false
    }

    // Show the prompt for users without tags
    return true
  }

  const handleSaveTags = async (selectedTagIds: string[]): Promise<void> => {
    if (!currentUser) throw new Error("No user logged in")

    try {
      await tagApi.updateUserTags(currentUser.id, selectedTagIds)
      // Refresh user data to get updated tags
      await refreshUser()
      setIsTagPromptOpen(false)
      // Clear the skip flag since user has now set tags
      sessionStorage.removeItem('skippedTagPrompt')
    } catch (error) {
      console.error("Failed to save user tags:", error)
      throw error
    }
  }

  const handleCloseTagPrompt = () => {
    setIsTagPromptOpen(false)
    // Set session flag to not show again this session
    sessionStorage.setItem('skippedTagPrompt', 'true')
  }
  const manuallyOpenTagPrompt = () => {
    setIsTagPromptOpen(true)
  }

  const shouldShowTagPromptForUser = (user: any): boolean => {
    return shouldShowTagPrompt(user)
  }

  const triggerTagPromptForLogin = () => {
    // Clear any existing skip flag when user logs in
    sessionStorage.removeItem('skippedTagPrompt')
    setHasCheckedTags(false) // Reset check state
    
    // Force check on next render
    setTimeout(() => {
      if (currentUser) {
        const shouldShow = shouldShowTagPrompt(currentUser)
        if (shouldShow) {
          setIsTagPromptOpen(true)
        }
        setHasCheckedTags(true)
      }
    }, 100)
  }
  return {
    isTagPromptOpen,
    handleSaveTags,
    handleCloseTagPrompt,
    manuallyOpenTagPrompt,
    shouldShowTagPromptForUser,
    triggerTagPromptForLogin,
    currentUserTags: currentUser?.tags || []
  }
}
