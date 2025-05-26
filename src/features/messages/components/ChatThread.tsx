"use client"

import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/UserContext"
import { AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useOutletContext, useParams } from "react-router-dom"
import type { AppDispatch, RootState } from "../../../store"
import type { Conversation } from "../../../types/message.types"
import { chatApi } from "../api/chatApi"
import { useChat } from "../hooks/useChat"
import { addConversation, clearHistory, loadHistory } from "../slices/chatSlice"
import { ChatHeader } from "./ChatHeader"
import { MessageInput } from "./MessageInput"
import { MessageList } from "./MessageList"

interface OutletContextType {
  onBackClick: () => void
  showBackButton: boolean
}

export function ChatThread() {
  const dispatch = useDispatch<AppDispatch>()
  const { listingId, receiverId } = useParams<{ listingId: string; receiverId: string }>()
  const { conversations, history } = useSelector((state: RootState) => state.chat)
  const { currentUser, loading: userLoading } = useUser() // Use cached user context
  const { onBackClick, showBackButton } = useOutletContext<OutletContextType>()
  const [activePartner, setActivePartner] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize chat hook
  const chat = useChat(listingId!, receiverId!)

  // Clear history when switching conversations
  useEffect(() => {
    dispatch(clearHistory())
  }, [dispatch, listingId, receiverId])

  // Load conversation and message history when conversation changes
  useEffect(() => {
    const loadConversationData = async () => {
      if (!listingId || !receiverId || !currentUser || userLoading) {
        setLoading(userLoading)
        return
      }

      setLoading(true)
      setError(null)

      try {
        console.log("🔍 Loading conversation data for:", { listingId, receiverId, currentUserId: currentUser.id })

        // First, try to find the conversation in the existing list
        let partner = conversations.find((c) => c.partnerId === receiverId && c.listing_id === listingId)

        if (partner) {
          console.log("✅ Found existing conversation in list:", partner)
          setActivePartner(partner)
        }

        // Always fetch the message history (this is the primary data source)
        console.log("📥 Fetching message history...")
        const historyResult = await dispatch(loadHistory({ currentUserId: currentUser.id, receiverId, listingId }))

        if (loadHistory.fulfilled.match(historyResult)) {
          const messages = historyResult.payload

          // If we don't have a conversation object yet, create one from the chat data
          // This will display the receiver's information
          if (!partner) {
            console.log("🆕 Creating conversation from chat data...")
            partner = await chatApi.createConversationFromChat(listingId, receiverId, messages, currentUser.id)
            setActivePartner(partner)

            // Add this conversation to the Redux store so it appears in the sidebar
            dispatch(addConversation(partner))
          }
        } else {
          throw new Error("Failed to load message history")
        }
      } catch (error: any) {
        console.error("❌ Error loading conversation data:", error)
        setError(error.message || "Failed to load conversation")

        // Create a minimal fallback conversation for UI purposes
        const fallbackConversation: Conversation = {
          id: `fallback_${listingId}_${receiverId}`,
          listing_id: listingId,
          partnerId: receiverId,
          partnerName: "Unknown User",
          partnerAvatar: "/placeholder.svg?height=40&width=40",
          lastMessage: "Unable to load conversation",
          updatedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          unreadCount: 0,
          isOnline: false,
        }
        setActivePartner(fallbackConversation)
      } finally {
        setLoading(false)
      }
    }

    loadConversationData()
  }, [dispatch, currentUser, receiverId, listingId, conversations, userLoading])

  const handleRetry = () => {
    setError(null)
    if (currentUser && receiverId && listingId) {
      dispatch(loadHistory({ currentUserId: currentUser.id, receiverId, listingId }))
    }
  }

  if (loading || userLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Conversation</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={handleRetry}>Try Again</Button>
            <Button variant="outline" onClick={onBackClick}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!activePartner || !currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Conversation not found</p>
          <button onClick={onBackClick} className="mt-2 text-primary hover:underline">
            Go back to conversations
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Display receiver's information in header */}
      <ChatHeader partner={activePartner} onBackClick={onBackClick} showBackButton={showBackButton} />

      <div className="flex-1 overflow-y-auto p-4">
        <MessageList
          messages={chat.messages}
          currentUserId={currentUser.id}
          isLoading={chat.loading}
          messagesEndRef={chat.messagesEndRef}
          onEditMessage={chat.editMessage}
          isEditing={chat.isEditing}
          setIsEditing={chat.setIsEditing}
          partnerName={activePartner.partnerName} // Display receiver's name
        />
      </div>

      <div className="p-4 border-t">
        <MessageInput
          value={chat.messageInput}
          onChange={chat.setMessageInput}
          onSend={chat.sendMessage}
          isConnected={chat.connectionStatus === "connected"}
        />
      </div>
    </div>
  )
}
