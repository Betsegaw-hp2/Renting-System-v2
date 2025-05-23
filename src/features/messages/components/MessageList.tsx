// src/features/messages/components/MessageList.tsx
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Message } from "@/types/message.types"
import React, { useEffect, useRef } from "react"
import { MessageItem } from "./MessageItem"

export const MessageList: React.FC<{
  messages: Message[]
  me: string
  loading: boolean
}> = ({ messages, me, loading }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // scroll to bottom whenever messages change
  useEffect(() => {
    const el = containerRef.current
    if (el) {
      // small timeout so DOM has rendered
      setTimeout(() => {
        el.scrollTop = el.scrollHeight
      }, 50)
    }
  }, [messages.length])

  return (
    <ScrollArea className="flex-1 px-4 py-6 flex flex-col space-y-4" ref={containerRef}>
      {loading
        ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
          ))
        : messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} isMine={msg.sender_id === me} />
          ))}
    </ScrollArea>
  )
}
