"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Plus, Search } from "lucide-react"
import { useState } from "react"
import type { Conversation } from "../../../types/message.types"

interface ConversationListProps {
  conversations: Conversation[]
  loading: boolean
  onSelectConversation: (listingId: string, receiverId: string) => void
  selectedListingId?: string
  selectedReceiverId?: string
}

export function ConversationList({
  conversations,
  loading,
  onSelectConversation,
  selectedListingId,
  selectedReceiverId,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter((conversation) =>
    conversation?.partner_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      // Today - show time
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 7) {
      // Less than a week - show day name
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      // More than a week - show date
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  <Skeleton className="h-3 w-10" />
                </div>
              ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No conversations found</div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => {
              const isActive =
                conversation.listing_id === selectedListingId && conversation.partner_id === selectedReceiverId

              return (
                <div
                  key={`${conversation.listing_id}_${conversation.partner_id}`}
                  className={cn(
                    "px-4 py-3 cursor-pointer transition-colors",
                    isActive ? "bg-accent" : "hover:bg-accent/50",
                  )}
                  onClick={() => onSelectConversation(conversation.listing_id, conversation.partner_id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <Avatar>
                        <AvatarImage
                          src={conversation.partner_avatar || "/placeholder.svg?height=40&width=40"}
                          alt={conversation.partner_name}
                        />
                        <AvatarFallback>
                          {conversation.partner_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.is_online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex justify-between items-center w-full">
                        <span className={cn("font-medium truncate", isActive && "text-accent-foreground")}>
                          {conversation.partner_name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          {formatTimestamp(conversation.last_updated || conversation.updated_at)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center w-full mt-1">
                        <span className="text-sm text-muted-foreground truncate">{conversation.last_message}</span>

                        {conversation.unread_count && conversation.unread_count > 0 && (
                          <Badge
                            variant="default"
                            className="ml-2 bg-primary h-5 w-5 flex items-center justify-center rounded-full p-0 flex-shrink-0"
                          >
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
