// src/features/messages/components/ChatPage.tsx
import { Header } from "@/components/layout/Header";
import type { AppDispatch, RootState } from "@/store";
import type { Message } from "@/types/message.types";
import { Check, Pencil, X } from "lucide-react";
import React, { useState } from "react";
import { Footer } from "react-day-picker";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useChat } from "../hooks/useChat";
import { editMessage } from "../slices/chatSlices";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const ChatSkeleton: React.FC = () => (
  <div className="space-y-4 p-4">
    {[...Array(4)].map((_, idx) => (
      <div key={idx} className="flex items-start space-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
        </div>
      </div>
    ))}
  </div>
);

const MessageBubble: React.FC<{
  message: Message;
  isMine: boolean;
  onEdit: (m: Message) => void;
  isEditing: boolean;
  editContent: string;
  setEditContent: React.Dispatch<React.SetStateAction<string>>;
  onSave: () => void;
  onCancel: () => void;
}> = ({ message, isMine, onEdit, isEditing, editContent, setEditContent, onSave, onCancel }) => (
  <Card className={`relative max-w-[60%] ${isMine ? 'self-end bg-blue-600 text-white' : 'self-start bg-gray-50'} group`}>
    <CardContent className="py-3 px-4">
      {isEditing ? (
        <div className="flex space-x-2">
          <Textarea
            className="flex-1 py-2"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <Button size="icon" variant="outline" onClick={onSave}>
            <Check />
          </Button>
          <Button size="icon" variant="outline" onClick={onCancel}>
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
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
              onClick={() => onEdit(message)}
              aria-label="Edit message"
            >
              <Pencil className="h-4 w-4 text-gray-600" />
            </Button>
          )}
        </>
      )}
    </CardContent>
    <div className="px-3 pb-2 text-xs text-gray-500 text-right">
      {new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </div>
  </Card>
);

const MessageInput: React.FC<{ input: string; setInput: (v: string) => void; onSend: () => void }> = ({ input, setInput, onSend }) => (
  <div className="p-4 bg-white border-t">
    <form className="flex space-x-2" onSubmit={(e) => { e.preventDefault(); onSend(); }}>
      <Textarea
        className="flex-1 resize-none"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button type="submit">Send</Button>
    </form>
  </div>
);

export const ChatPage: React.FC = () => {
  const { listingId, receiverId } = useParams<{ listingId: string; receiverId: string }>();
  const { history, loading, input, setInput, sendMessage } = useChat(listingId!, receiverId!);
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((s: RootState) => s.auth.user);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  if (authUser === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full animate-pulse" />
      </div>
    );
  }
  const me = authUser.id;

  return (
    <div className="flex flex-col h-screen">
      <Header />

      <main className="flex flex-1 flex-col">
        <Card className="flex-1 m-4 flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1 p-4 space-y-4">
            {loading ? (
              <ChatSkeleton />
            ) : (
              history.map((msg, idx) => (
                <MessageBubble
                  key={`${msg.id ?? idx}-${msg.sent_at ?? idx}`}
                  message={msg}
                  isMine={msg.sender_id === me}
                  onEdit={(m) => { setEditingId(m.id); setEditContent(m.content); }}
                  isEditing={editingId === msg.id}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  onSave={() => { dispatch(editMessage({ id: msg.id, content: editContent })); setEditingId(null); }}
                  onCancel={() => setEditingId(null)}
                />
              ))
            )}
          </ScrollArea>
          <MessageInput input={input} setInput={setInput} onSend={sendMessage} />
        </Card>
      </main>

      <Footer className="hidden md:block" />
    </div>
  );
};


// import React from "react";
// import { Header } from "@/components/layout/Header";
// import { Footer } from "react-day-picker";
// import { Sidebar } from "./Sidebar";
// import { ChatHeader } from "./ChatHeader";
// import { MessageList } from "./MessageList";
// import { MessageInput } from "./MessageInput";
// import { useParams } from "react-router-dom";
// import { useChat } from "../hooks/useChat";
// import { useSelector } from "react-redux";
// import type { RootState } from "@/store";

// export const ChatPage: React.FC = () => {
//   const { listingId, receiverId } = useParams<{ listingId: string; receiverId: string }>();
//   const { history, loading, input, setInput, sendMessage } = useChat(listingId!, receiverId!);
//   const authUser = useSelector((s: RootState) => s.auth.user)!;

//   return (
//     <div className="flex h-screen overflow-hidden">
//       <Sidebar />
//       <div className="flex flex-1 flex-col">
//         <ChatHeader />
//         <MessageList messages={history} me={authUser.id} loading={loading} />
//         <MessageInput input={input} setInput={setInput} onSend={sendMessage} />
//       </div>
//       <Footer className="hidden md:block" />
//     </div>
//   );
// };