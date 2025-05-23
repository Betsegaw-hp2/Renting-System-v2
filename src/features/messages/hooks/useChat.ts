import type { AppDispatch, RootState } from "@/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatWebSocketService } from "../services/chatWebSocket";
import { loadHistory, sendMessage as sendMsgThunk } from "../slices/chatSlices";

export function useChat(listingId: string, receiverId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((s: RootState) => s.auth.user);
  const token = useSelector((s: RootState) => s.auth.token);
  const chatState = useSelector((s: RootState) => s.chat);

  const [input, setInput] = useState("");

  useEffect(() => {
    if (!authUser || !token) return;
    const senderId = authUser.id;

    dispatch(loadHistory({ senderId, receiverId }));
    chatWebSocketService.connect(listingId, receiverId, token);

    return () => chatWebSocketService.disconnect();
  }, [dispatch, authUser, receiverId, listingId, token]);

  const sendMessage = () => {
    if (!authUser || !token || !input.trim()) return;
    const payload = {
      content: input,
      listing_id: listingId,
      sender_id: authUser.id,
      receiver_id: receiverId,
    };
    chatWebSocketService.send(payload);
    dispatch(sendMsgThunk(payload));
    setInput("");
  };

  return {
    history: chatState.history,
    loading: chatState.loadingHistory,
    input,
    setInput,
    sendMessage,
  };
}
