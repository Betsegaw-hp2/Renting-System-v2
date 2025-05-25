"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, Info, MoreVertical, Phone, Video } from "lucide-react"
import type { Conversation } from "../../../types/message.types"

interface ChatHeaderProps {
  partner: Conversation
  onBackClick: () => void
  showBackButton: boolean
}

export function ChatHeader({ partner, onBackClick, showBackButton }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-muted/10">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onBackClick} className="mr-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <Avatar>
          <AvatarImage src={partner.partnerAvatar || "/placeholder.svg?height=40&width=40"} alt={partner.partnerName} />
          <AvatarFallback>
            {partner?.partnerName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        <div>
          <div className="font-medium">{partner?.partnerName}</div>
          <div className="text-xs text-muted-foreground flex items-center">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-1 ${partner?.isOnline ? "bg-green-500" : "bg-gray-300"}`}
            />
            {partner.isOnline ? "Online" : "Offline"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Phone className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full">
          <Video className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full">
          <Info className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View listing</DropdownMenuItem>
            <DropdownMenuItem>Block user</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
