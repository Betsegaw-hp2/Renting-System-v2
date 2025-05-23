import { Header as SiteHeader } from "@/components/layout/Header"
import { Skeleton } from "@/components/ui/skeleton"
import type { RootState } from "@/store"
import { useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { useChat } from "../hooks/useChat"
import { ChatHeader } from "./ChatHeader"
import { MessageInput } from "./MessageInput"
import { MessageList } from "./MessageList"
import { Sidebar } from "./Sidebar"

export const ChatPage: React.FC = () => {
  const { listingId = "", receiverId = "" } = useParams<{ listingId: string; receiverId: string }>()
  const authUser = useSelector((s: RootState) => s.auth.user)
  const { history, loading, input, setInput, sendMessage } = useChat(listingId, receiverId)

  if (!authUser) {
	return (
	  <div className="flex h-screen flex-col">
		<Skeleton className="h-16 w-full flex-shrink-0" />

		<div className="flex flex-1 overflow-hidden">
		  <aside className="hidden lg:block lg:flex-shrink-0">
			<Skeleton className="h-full w-64" />
		  </aside>

		  <div className="flex flex-1 flex-col">
			<Skeleton className="h-16 flex-shrink-0 border-b" />

			<div className="flex-1 overflow-y-auto p-4 space-y-3">
			  <Skeleton className="h-10 w-3/4 rounded" />
			  <Skeleton className="h-10 w-1/2 rounded ml-auto" />
			  <Skeleton className="h-10 w-3/5 rounded" />
			  <Skeleton className="h-10 w-3/4 rounded" />
			  <Skeleton className="h-10 w-2/3 rounded ml-auto" />
			</div>

			<Skeleton className="h-14 flex-shrink-0 border-t" />
		  </div>
		</div>
	  </div>
	)
  }
  return (
    <div className="flex h-screen flex-col">
      {/* Global site header (optional) */}
      <SiteHeader showSidebarToggle />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: hidden on small screens */}
        <aside className="hidden lg:flex lg:flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Chat column */}
        <div className="flex flex-1 flex-col bg-gray-50">
          {/* Chat header */}
          <ChatHeader />

          {/* Message list */}
          <div className="flex-1 overflow-y-auto">
            <MessageList messages={history} me={authUser.id} loading={loading} />
          </div>

          {/* Message input */}
          <MessageInput
            input={input}
            setInput={setInput}
            onSend={sendMessage}
          />
        </div>
      </div>
    </div>
  )
}
