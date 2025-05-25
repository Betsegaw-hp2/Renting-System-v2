"use client"

import { MessageSquare } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <MessageSquare className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">No conversation selected</h2>
      <p className="text-muted-foreground max-w-md">
        Select a conversation from the list to view messages or start a new conversation.
      </p>
    </div>
  )
}
