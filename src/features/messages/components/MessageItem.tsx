// src/features/messages/components/MessageItem.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { AppDispatch } from "@/store"
import type { Message } from "@/types/message.types"
import { Check, Loader2, Pencil, X } from "lucide-react"
import React, { useState } from "react"
import { useDispatch } from "react-redux"
import { editMessage } from "../slices/chatSlices"

export const MessageItem: React.FC<{
  message: Message
  isMine: boolean
}> = ({ message, isMine }) => {
  const dispatch = useDispatch<AppDispatch>()
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(message.content)
  const [saving, setSaving] = useState(false)

  const saveEdit = async () => {
    setSaving(true)
    try {
      await dispatch(editMessage({ id: message.id, content })).unwrap()
      setEditing(false)
    } catch {
      // TODO: show a toast
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card
      className={`
        w-auto max-w-xl group  
        ${isMine ? "self-end bg-primary text-primary-foreground" : "self-start bg-gray-100 text-gray-800"}
      `}
    >
      <CardContent className="relative">
        {editing ? (
          <div className="flex space-x-2">
            <textarea
              className="flex-1 resize-none rounded-md border p-2 text-black"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button
              size="icon"
              variant="outline"
              onClick={saveEdit}
              disabled={saving || !content.trim()}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check />}
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => editing && setEditing(false)}
              disabled={saving}
            >
              <X />
            </Button>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap">{message.content}</p>
            {isMine && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                onClick={() => setEditing(true)}
                title="Edit message"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </>
        )}

        <span
          className={`block mt-1 text-right text-xs ${
            isMine ? "text-primary-foreground/80" : "text-gray-500"
          }`}
        >
          {new Date(message.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </CardContent>
    </Card>
  )
}
