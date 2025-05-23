// src/features/messages/components/ChatHeader.tsx
import { Button } from "@/components/ui/button"
import type { RootState } from "@/store"
import { ArrowLeft } from "lucide-react"
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

export const ChatHeader: React.FC = () => {
  const navigate = useNavigate()
  const { listingId, receiverId } = useParams<{ listingId: string; receiverId: string }>()
  const convo = useSelector((s: RootState) =>
    s.chat.conversations.find(
      (c) => c.listing_id === listingId && c.partnerId === receiverId
    )
  )

  return (
    <header className="flex items-center border-b bg-white p-4">
      <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
        <ArrowLeft />
      </Button>
      <div className="ml-4">
        <h3 className="text-lg font-semibold">{convo?.partnerName ?? "Chat"}</h3>
        <p className="text-sm text-gray-500">Online</p>
      </div>
    </header>
  )
}
