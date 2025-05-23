// src/features/messages/components/MessageInput.tsx
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import React from "react"

export const MessageInput: React.FC<{
  input: string
  setInput: (v: string) => void
  onSend: () => void
}> = ({ input, setInput, onSend }) => (
  <div className="border-t bg-white p-4">
    <form
      className="flex space-x-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSend()
      }}
    >
      <Textarea
        className="flex-1 resize-none"
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={1}
      />
      <Button type="submit">Send</Button>
    </form>
  </div>
)
