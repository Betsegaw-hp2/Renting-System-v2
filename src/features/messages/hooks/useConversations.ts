import type { AppDispatch, RootState } from "@/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations } from "../slices/chatSlices";

export function useConversations() {
  const dispatch = useDispatch<AppDispatch>();
  const { conversations, loadingConversations, error } = useSelector((s: RootState) => s.chat);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  return { conversations, loadingConversations, error };
}
