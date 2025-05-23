import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { RootState } from "@/store"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

export const Sidebar: React.FC = () => {
  const chats = useSelector((s: RootState) => s.chat.conversations)
  const navigate = useNavigate()

  return (
    <div className="flex h-full w-72 flex-col border-r bg-white">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Conversations</h2>
      </div>
      <ScrollArea className="flex-1">
        <ul className="space-y-2 p-2">
          {chats.map((c) => (
            <li key={c.id}>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate(`/messages/${c.listing_id}/${c.partnerId}`)}
              >
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={c.partnerAvatar} alt={c.partnerName} />
                  <AvatarFallback>{c.partnerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col text-left">
                  <span className="font-medium">{c.partnerName}</span>
                  <span className="text-sm text-gray-500 truncate">{c.lastMessage}</span>
                </div>
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
}
