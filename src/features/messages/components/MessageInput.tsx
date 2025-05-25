"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { AlertCircle, Mic, Paperclip, Send, Smile } from "lucide-react"
import type { KeyboardEvent } from "react"

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isConnected: boolean
}

export function MessageInput({ value, onChange, onSend, isConnected }: MessageInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="relative">
      {!isConnected && (
        <div className="absolute -top-8 left-0 right-0 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md flex items-center text-sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          Connection lost. Reconnecting...
        </div>
      )}

      <div className="flex items-end gap-2 bg-muted/10 rounded-lg p-2">
        <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
          <Paperclip className="h-5 w-5" />
        </Button>

        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className={cn(
            "min-h-[60px] max-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent",
            !isConnected && "border-yellow-300",
          )}
        />

        <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
          <Smile className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
          <Mic className="h-5 w-5" />
        </Button>

        <Button
          onClick={onSend}
          disabled={!value.trim() || !isConnected}
          size="icon"
          className="h-10 w-10 rounded-full flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
