"use client"

import { Skeleton } from "@/components/ui/skeleton"
import type React from "react"
import type { Message } from "../../../types/message.types"
import { MessageItem } from "./MessageItem"

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement>
  onEditMessage: (messageId: string, content: string) => void
  isEditing: string | null
  setIsEditing: (messageId: string | null) => void
  partnerName?: string
}

export function MessageList({
  messages,
  currentUserId,
  isLoading,
  messagesEndRef,
  onEditMessage,
  isEditing,
  setIsEditing,
  partnerName = "User",
}: MessageListProps) {
  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {}

  messages.forEach((message) => {
    const date = new Date(message.sent_at).toLocaleDateString()
    if (!groupedMessages[date]) {
      groupedMessages[date] = []
    }
    groupedMessages[date].push(message)
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : "flex-row"}`}>
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-16 w-[250px] rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <div className="max-w-md">
          <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.keys(groupedMessages).map((date) => (
        <div key={date} className="space-y-1">
          {/* Date separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                {new Date(date).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Messages for this date */}
          <div className="space-y-1">
            {groupedMessages[date].map((message, index) => {
              const isCurrentUser = message.sender_id === currentUserId
              const prevMessage = index > 0 ? groupedMessages[date][index - 1] : null
              const nextMessage = index < groupedMessages[date].length - 1 ? groupedMessages[date][index + 1] : null

              // Show avatar if:
              // - It's the first message in the group
              // - The previous message is from a different sender
              // - There's a significant time gap (more than 5 minutes)
              const showAvatar =
                index === 0 ||
                prevMessage?.sender_id !== message.sender_id ||
                (prevMessage && new Date(message.sent_at).getTime() - new Date(prevMessage.sent_at).getTime() > 300000)

              // This is the last message in a group if:
              // - It's the last message overall
              // - The next message is from a different sender
              // - There's a significant time gap to the next message
              const isLastInGroup =
                index === groupedMessages[date].length - 1 ||
                nextMessage?.sender_id !== message.sender_id ||
                (nextMessage && new Date(nextMessage.sent_at).getTime() - new Date(message.sent_at).getTime() > 300000)

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  isCurrentUser={isCurrentUser}
                  showAvatar={showAvatar}
                  isLastInGroup={isLastInGroup}
                  onEdit={onEditMessage}
                  isEditing={isEditing === message.id}
                  setIsEditing={setIsEditing}
                  partnerName={partnerName}
                />
              )
            })}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
