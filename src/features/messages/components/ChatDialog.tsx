import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/contexts/UserContext";
import { chatApi } from "@/features/messages/api/chatApi";
import { useWebSocket } from "@/features/messages/hooks/useWebSocket";
import { useToast } from "@/hooks/useToast";
import type { Message } from "@/types/message.types";
import { Paperclip, Send, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
        sender_id: currentUserId,
        receiver_id: partnerId,
        content: optimisticMessage.content,
        // listing_id: listingId,
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

  // WebSocket status effect
  useEffect(() => {
    function handleOpen() { setWsStatus('connected'); }
    function handleClose() { setWsStatus('disconnected'); }
    window.addEventListener('chat-ws-open', handleOpen);
    window.addEventListener('chat-ws-close', handleClose);
    return () => {
      window.removeEventListener('chat-ws-open', handleOpen);
      window.removeEventListener('chat-ws-close', handleClose);
    };
  }, []);

  // Manual refresh handler
  const handleRefresh = () => {
    loadHistory();
  };

  // Ensure scroll to bottom on open and on new messages
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[700px] p-0 flex flex-col h-[80vh]">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between bg-muted">
          <div className="flex items-center gap-2">
            {/* Webhook status pulse */}
            <span className="relative flex h-3 w-3 mr-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${wsStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${wsStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={partnerAvatar} alt={partnerName} />
              <AvatarFallback>{partnerName[0]}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-lg">Instant Chat <span className="ml-2 text-xs text-green-600 animate-pulse">(Instant)</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" title="Refresh" onClick={handleRefresh}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.582 9A7.003 7.003 0 0112 5c1.657 0 3.156.576 4.354 1.536M18.418 15A7.003 7.003 0 0112 19c-1.657 0-3.156-.576-4.354-1.536" /></svg>
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/messages/${listingId}/${partnerId}`)}>
              Open Page
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-grow p-4 bg-gray-50" style={{ minHeight: 0, maxHeight: '100%', overflowY: 'auto' }}>
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
