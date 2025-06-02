import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/contexts/UserContext";
import { chatApi } from "@/features/messages/api/chatApi";
import { useWebSocket } from "@/features/messages/hooks/useWebSocket";
import { useToast } from "@/hooks/useToast";
import type { Message } from "@/types/message.types";
import { Paperclip, Send, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  listingId: string;
}

const ChatDialog: React.FC<ChatDialogProps> = ({
  isOpen,
  onClose,
  partnerId,
  partnerName,
  partnerAvatar,
  listingId,
}) => {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const { sendMessageWS } = useWebSocket(listingId, partnerId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = currentUser?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadHistory = async () => {
    if (!isOpen || !currentUserId || !partnerId) return;
    setIsLoading(true);
    try {
      const history = await chatApi.fetchHistory(currentUserId, partnerId, listingId);
      setMessages(history.sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()));
    } catch (error) {
      console.error("Failed to load chat history:", error);
      toast({
        title: "Error",
        description: "Could not load chat history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !partnerId || !listingId) return;

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      sender_id: currentUserId,
      receiver_id: partnerId,
      listing_id: listingId,
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
    setNewMessage("");

    try {
      // Send via WebSocket
      sendMessageWS({
        content: optimisticMessage.content,
        sender_id: currentUserId,
        receiver_id: partnerId,
        listing_id: listingId,
      });
      // Optionally: Listen for server confirmation and update message state
    } catch (error) {
      console.error("Failed to send message via WebSocket:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[700px] p-0 flex flex-col h-[80vh]">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={partnerAvatar} alt={partnerName} />
              <AvatarFallback>{partnerName[0]}</AvatarFallback>
            </Avatar>
            {partnerName}
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="flex-grow p-4 bg-gray-50">
          <div className="space-y-4">
            {isLoading && <p className="text-center text-gray-500">Loading messages...</p>}
            {!isLoading && messages.length === 0 && (
              <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.sender_id === currentUserId
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs mt-1 text-gray-500">
                    {new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t bg-white">
          <div className="flex w-full items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-grow"
            />
            <Button type="button" onClick={handleSendMessage} disabled={!newMessage.trim() || isLoading}>
              <Send className="h-5 w-5 mr-2" />
              Send
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
