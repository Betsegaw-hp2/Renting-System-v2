"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import type { RootState } from "../../../store"

export function MessageIcon() {
  const navigate = useNavigate()
  const { conversations } = useSelector((state: RootState) => state.chat)

  const unreadCount = conversations.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0)

  return (
    <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/messages")}>
      <MessageSquare className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </Badge>
      )}
    </Button>
  )
}
