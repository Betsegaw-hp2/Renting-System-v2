"use client"

import { useUser } from "@/contexts/UserContext"
import { getAuthToken } from "@/lib/cookies"
import { useCallback, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../../store"
import { chatWebSocketService } from "../services/chatWebSocket"
import { editMessage, markMessageRead, sendMessage, updateConversationLastMessage } from "../slices/chatSlice"

export function useChat(listingId: string, receiverId: string) {
  const dispatch = useDispatch<AppDispatch>()
  const { history, loadingHistory } = useSelector((state: RootState) => state.chat)
  const { token } = useSelector((state: RootState) => state.auth)
  const { currentUser } = useUser() // Use cached user context
  const [messageInput, setMessageInput] = useState("")
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "error" | "idle">("idle")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Add this validation to prevent unnecessary API calls
  const isValidParams = Boolean(listingId && receiverId && currentUser)

  // Connect to WebSocket - only if we have valid parameters and authentication
  useEffect(() => {
    if (!isValidParams) {
      console.log("Invalid parameters for WebSocket connection:", { listingId, receiverId, currentUser: !!currentUser })
      return
    }

    const authToken = getAuthToken()

    if (!authToken) {
      console.warn("No authentication token found for WebSocket connection")
      setConnectionStatus("error")
      return
    }

    console.log("Connecting to WebSocket with token:", authToken.substring(0, 10) + "...")

    try {
      // Connect to WebSocket
      chatWebSocketService.connect(listingId, receiverId, authToken)
      setConnectionStatus("connected")
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error)
      setConnectionStatus("error")
    }

    return () => {
      chatWebSocketService.disconnect()
      setConnectionStatus("idle")
    }
  }, [listingId, receiverId, isValidParams, token, currentUser])

  // Mark messages as read - only if we have valid parameters and current user
  useEffect(() => {
    if (!isValidParams) {
      return
    }

    const unreadMessages = history.filter((msg) => !msg.is_read && msg.sender_id === receiverId)

    unreadMessages.forEach((msg) => {
      dispatch(markMessageRead(msg.id))
    })
  }, [dispatch, history, receiverId, isValidParams])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [history])

  // Send message
  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !isValidParams) return

    if (isEditing) {
      dispatch(editMessage({ messageId: isEditing, content: messageInput }))
      setIsEditing(null)
    } else {
      const payload = {
        content: messageInput,
        listing_id: listingId,
        receiver_id: receiverId,
      }

      // Send message and update conversation
      dispatch(sendMessage({ payload, currentUserId: currentUser!.id })).then((result) => {
        if (sendMessage.fulfilled.match(result)) {
          // Update the conversation's last message
          dispatch(
            updateConversationLastMessage({
              listingId,
              partnerId: receiverId,
              message: result.payload,
            }),
          )
        }
      })

      // Also send via WebSocket for real-time delivery if connected
      if (connectionStatus === "connected") {
        chatWebSocketService.send({
          ...payload,
          sender_id: currentUser!.id,
        })
      }
    }

    setMessageInput("")
  }, [dispatch, messageInput, listingId, receiverId, isEditing, isValidParams, connectionStatus, currentUser])

  // Edit message
  const handleEditMessage = useCallback((messageId: string, content: string) => {
    setIsEditing(messageId)
    setMessageInput(content)
  }, [])

  return {
    messages: history,
    messageInput,
    setMessageInput,
    sendMessage: handleSendMessage,
    editMessage: handleEditMessage,
    isEditing,
    setIsEditing,
    messagesEndRef,
    loading: loadingHistory,
    connectionStatus,
    currentUser,
  }
}
