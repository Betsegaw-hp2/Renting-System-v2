import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import type { Message } from "../../../types/message.types";
import { chatWebSocketService } from "../services/chatWebSocket";
import { loadHistory } from "../slices/chatSlices";

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

    // Open WS
    chatWebSocketService.connect(listingId, receiverId, token);

    // Clean up on unmount / dependencies change
    return () => {
      chatWebSocketService.disconnect();
    };
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
    setInput("");
  };

  // If no user, return empty state so the UI can show a loading or redirect
  if (!authUser) {
    return {
      history: [] as Message[],
      loading: false,
      input,
      setInput,
      sendMessage,
    };
  }

  return {
    history: chatState.history,
    loading: chatState.loading,
    input,
    setInput,
    sendMessage,
  };
}
