"use client"

import { Card } from "@/components/ui/card"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { useMediaQuery } from "../../../hooks/use-media-query"
import type { AppDispatch, RootState } from "../../../store"
import { useChat } from "../hooks/useChat"
import { fetchConversations } from "../slices/chatSlice"
import { ChatHeader } from "./ChatHeader"
import { ChatLayout } from "./ChatLayout"
import { MessageInput } from "./MessageInput"
import { MessageList } from "./MessageList"

export function ChatPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { listingId, receiverId } = useParams<{ listingId: string; receiverId: string }>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { conversations } = useSelector((state: RootState) => state.chat)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Fetch conversations on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchConversations(user.id))
    }
  }, [dispatch, user?.id])

  // If we have a listingId and receiverId, we're in a conversation
  const isInConversation = Boolean(listingId && receiverId)

  // If we're on mobile and in a conversation, hide the sidebar
  const showSidebar = !isMobile || !isInConversation

  // If we're on mobile and not in a conversation, show only the sidebar
  const showConversation = !isMobile || isInConversation

  // Get the active conversation partner
  const activePartner = conversations.find((c) => c.partnerId === receiverId && c.listing_id === listingId)

  // Initialize chat hook
  const chat = useChat(isInConversation ? listingId! : "", isInConversation ? receiverId! : "")

  const handleBackClick = () => {
    navigate("/messages")
  }

  return (
    <ChatLayout>
      <Card className="flex h-[calc(100vh-8rem)] overflow-hidden my-4 shadow-md">
        {/* {showSidebar && (
          <div className={`${isMobile ? "w-full" : "w-80"} border-r`}>
            <Sidebar conversations={conversations} />
          </div>
        )} */}

        {showConversation && (
          <div className="flex flex-col flex-1 h-full bg-background">
            {isInConversation && activePartner && (
              <>
                <ChatHeader partner={activePartner} onBackClick={handleBackClick} showBackButton={isMobile} />

                <div className="flex-1 overflow-y-auto p-4">
                  {isInConversation && activePartner && (
                    <MessageList
                      messages={chat.messages}
                      currentUserId={user?.id || ""}
                      isLoading={chat.loading}
                      messagesEndRef={chat.messagesEndRef}
                      onEditMessage={chat.editMessage}
                      isEditing={chat.isEditing}
                      setIsEditing={chat.setIsEditing}
                    />
                  )}
                </div>

                <div className="p-4 border-t">
                  {isInConversation && activePartner && (
                    <MessageInput
                      value={chat.messageInput}
                      onChange={chat.setMessageInput}
                      onSend={chat.sendMessage}
                      isConnected={chat.connectionStatus === "connected"}
                    />
                  )}
                </div>
              </>
            )}

            {(!isInConversation || !activePartner) && (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <div className="w-48 h-48 mb-6">
                  <img
                    src="/placeholder.svg?height=192&width=192"
                    alt="Select a conversation"
                    className="w-full h-full object-contain opacity-50"
                  />
                </div>
                <h2 className="text-2xl font-semibold mb-2">No conversation selected</h2>
                <p className="text-muted-foreground">Choose a conversation from the sidebar or start a new one.</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </ChatLayout>
  )
}
