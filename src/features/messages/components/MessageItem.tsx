"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Check, CheckCheck, Edit, MoreHorizontal, Trash, X } from "lucide-react"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import type { Message } from "../../../types/message.types"

interface MessageItemProps {
  message: Message
  isCurrentUser: boolean
  showAvatar: boolean
  isLastInGroup: boolean
  onEdit: (messageId: string, content: string) => void
  isEditing: boolean
  setIsEditing: (messageId: string | null) => void
  partnerName?: string
}

export function MessageItem({
  message,
  isCurrentUser,
  showAvatar,
  isLastInGroup,
  onEdit,
  isEditing,
  setIsEditing,
  partnerName = "User",
}: MessageItemProps) {
  const [showOptions, setShowOptions] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length)
    }
  }, [isEditing])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleEditClick = () => {
    setEditContent(message.content)
    setIsEditing(message.id)
    setShowOptions(false)
  }

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent.trim())
    }
    setIsEditing(null)
  }

  const handleCancelEdit = () => {
    setEditContent(message.content)
    setIsEditing(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === "Escape") {
      handleCancelEdit()
    }
  }

  const handleDeleteClick = () => {
    // TODO: Implement delete functionality
    console.log("Delete message:", message.id)
    setShowOptions(false)
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div
      className={cn("flex gap-3 group relative", isCurrentUser ? "flex-row-reverse" : "flex-row")}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      {/* Avatar - only show for first message in group */}
      {showAvatar ? (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage
            src={isCurrentUser ? "/placeholder.svg?height=32&width=32" : "/placeholder.svg?height=32&width=32"}
            alt={isCurrentUser ? "You" : partnerName}
          />
          <AvatarFallback className="text-xs">
            {isCurrentUser ? "You".substring(0, 2) : getInitials(partnerName)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8 flex-shrink-0" />
      )}

      {/* Message content */}
      <div className={cn("max-w-[70%] min-w-0", isCurrentUser ? "text-right" : "text-left")}>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] resize-none"
              placeholder="Edit your message..."
            />
            <div className={cn("flex gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
              <Button size="sm" onClick={handleSaveEdit} disabled={!editContent.trim()}>
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div
              className={cn(
                "inline-block rounded-2xl px-4 py-2 text-sm break-words",
                isCurrentUser
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md",
                message.is_sending && "opacity-70",
                message.error && "bg-destructive/10 border border-destructive/20",
              )}
            >
              {message.content}
              {message.is_sending && <span className="ml-2 text-xs opacity-60">Sending...</span>}
              {message.error && <span className="ml-2 text-xs text-destructive">Failed to send</span>}
            </div>

            {/* Options button - only show for current user messages */}
            {showOptions && isCurrentUser && !message.is_sending && !isEditing && (
              <div className={cn("absolute top-1/2 -translate-y-1/2", isCurrentUser ? "-left-10" : "-right-10")}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-background border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isCurrentUser ? "end" : "start"}>
                    <DropdownMenuItem onClick={handleEditClick}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive">
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        )}

        {/* Message metadata */}
        {!isEditing && (
          <div
            className={cn(
              "flex items-center mt-1 text-xs text-muted-foreground gap-1",
              isCurrentUser ? "justify-end" : "justify-start",
            )}
          >
            <span>{formatTime(message.sent_at)}</span>
            {message.updated_at !== message.sent_at && <span className="opacity-60">(edited)</span>}

            {/* Read status for current user messages */}
            {isCurrentUser && isLastInGroup && (
              <span className="ml-1">
                {message.is_read ? (
                  <CheckCheck className="h-3 w-3 text-blue-500" />
                ) : (
                  <Check className="h-3 w-3 text-muted-foreground" />
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
