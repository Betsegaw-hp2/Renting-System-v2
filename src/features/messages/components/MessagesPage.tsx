"use client"

import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/UserContext"
import { AlertCircle, MessageSquare } from "lucide-react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Outlet, useNavigate, useParams } from "react-router-dom"
import { useMediaQuery } from "../../../hooks/use-media-query"
import type { AppDispatch, RootState } from "../../../store"
import { fetchConversations } from "../slices/chatSlice"
import { ConversationList } from "./ConversationList"
import { EmptyState } from "./EmptyState"

export function MessagesPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { listingId, receiverId } = useParams<{ listingId?: string; receiverId?: string }>()
  const { conversations, loadingConversations, error } = useSelector((state: RootState) => state.chat)
  const { currentUser, loading: userLoading } = useUser() // Use cached user context
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Track if a conversation is selected
  const isConversationSelected = Boolean(listingId && receiverId)

  // On mobile, determine which pane to show
  const [showConversationList, setShowConversationList] = useState(!isConversationSelected || !isMobile)
  const [showChatThread, setShowChatThread] = useState(isConversationSelected || !isMobile)

  // Fetch conversations when current user is available
  useEffect(() => {
    if (currentUser && !userLoading) {
      console.log("🔄 Fetching conversations for cached user:", currentUser.id)
      dispatch(fetchConversations(currentUser.id))
    }
  }, [dispatch, currentUser, userLoading])

  // Update visibility when route params change
  useEffect(() => {
    if (isMobile) {
      setShowConversationList(!isConversationSelected)
      setShowChatThread(isConversationSelected)
    } else {
      setShowConversationList(true)
      setShowChatThread(true)
    }
  }, [isMobile, isConversationSelected])

  // Handle conversation selection
  const handleSelectConversation = (listingId: string, receiverId: string) => {
    navigate(`/messages/${listingId}/${receiverId}`)
  }

  // Handle back button on mobile
  const handleBackToList = () => {
    navigate("/messages")
  }

  const handleRetryConversations = () => {
    if (currentUser) {
      dispatch(fetchConversations(currentUser.id))
    }
  }

  // Render empty conversations state
  const renderEmptyConversations = () => (
    <div className="flex items-center justify-center h-full p-4">
      <div className="text-center max-w-sm">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Start a conversation by visiting a property listing and contacting the owner.
        </p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Browse Properties
        </Button>
      </div>
    </div>
  )

  // Render error state
  const renderErrorState = () => (
    <div className="flex items-center justify-center h-full p-4">
      <div className="text-center">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-3">Failed to load conversations</p>
        <Button size="sm" onClick={handleRetryConversations}>
          Try Again
        </Button>
      </div>
    </div>
  )

  // Show loading state while fetching current user
  if (userLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading user information...</p>
          </div>
        </main>
        {/* <Footer /> */}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-lg border shadow-sm">
            {/* Conversation List (Left Pane) - Shows receiver names */}
            {showConversationList && (
              <div className={`${isMobile ? "w-full" : "w-1/3 border-r"} bg-background`}>
                {error ? (
                  renderErrorState()
                ) : !loadingConversations && conversations.length === 0 ? (
                  renderEmptyConversations()
                ) : (
                  <ConversationList
                    conversations={conversations}
                    loading={loadingConversations}
                    onSelectConversation={handleSelectConversation}
                    selectedListingId={listingId}
                    selectedReceiverId={receiverId}
                  />
                )}
              </div>
            )}

            {/* Chat Thread (Right Pane) - Shows receiver information */}
            {showChatThread && (
              <div className={`${isMobile ? "w-full" : "w-2/3"} flex flex-col bg-background`}>
                {isConversationSelected ? (
                  <Outlet context={{ onBackClick: handleBackToList, showBackButton: isMobile }} />
                ) : (
                  <EmptyState />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      {/* <Footer />
      <AuthDebug /> */}
    </div>
  )
}