"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser } from "@/contexts/UserContext"
import { useWebSocket } from "@/features/messages/hooks/useWebSocket"
import { useToast } from "@/hooks/useToast"
import type { Message } from "@/types/message.types"
import { Paperclip, Send, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { chatApi } from "../api/chatApi"

export function ChatThread() {
  const { toast } = useToast()
  const { currentUser } = useUser()
  const { listingId, receiverId } = useParams<{ listingId: string; receiverId: string }>()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { sendMessageWS } = useWebSocket(listingId, receiverId)

  const currentUserId = currentUser?.id

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadHistory = async () => {
    if (!currentUserId || !receiverId) return
    setIsLoading(true)
    try {
      const history = await chatApi.fetchHistory(currentUserId, receiverId, listingId)
      setMessages(history.sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()))
    } catch (error) {
      console.error("Failed to load chat history:", error)
      toast({
        title: "Error",
        description: "Could not load chat history.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
    // Optionally: setup WebSocket connection here
    // ...
    // return () => { /* cleanup WebSocket */ }
  }, [listingId, receiverId, currentUserId])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUserId || !receiverId) return

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      sender_id: currentUserId,
      receiver_id: receiverId,
      listing_id: listingId!,
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_read: false,
    }

    setMessages((prevMessages) => [...prevMessages, optimisticMessage])
    setNewMessage("")

    try {
      sendMessageWS({
        sender_id: currentUserId,
        receiver_id: receiverId,
        content: newMessage,
      })
    } catch (error) {
      console.error("Failed to send message via WebSocket:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!currentUserId || !receiverId || !listingId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Invalid chat parameters.</p>
          <Button onClick={() => navigate(-1)} className="mt-2">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="w-full border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
            <X className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={"/placeholder.svg?height=40&width=40"} alt={receiverId} />
            <AvatarFallback>{receiverId[0]}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-lg">Instant Chat Room</span>
          <span className="ml-2 text-xs text-green-600 animate-pulse">(Instant)</span>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center w-full">
        <div className="w-full max-w-2xl flex flex-col h-[80vh] border rounded-lg bg-white shadow-lg mt-8 mb-8">
          <ScrollArea className="flex-grow p-4 bg-gray-50" style={{ minHeight: 0, maxHeight: "100%", overflowY: "auto" }}>
            <div className="space-y-4">
              {isLoading && <p className="text-center text-gray-500">Loading messages...</p>}
              {!isLoading && messages.length === 0 && (
                <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender_id === currentUserId
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1 text-gray-500">
                      {new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-white">
            <div className="flex w-full items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-grow"
              />
              <Button type="button" onClick={handleSendMessage} disabled={!newMessage.trim() || isLoading}>
                <Send className="h-5 w-5 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
