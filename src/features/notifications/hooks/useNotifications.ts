"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../../../store"
import { notificationWebSocketService } from "../services/notificationWebSocket"
import { fetchUserNotifications } from "../slices/notificationsSlice"

export const useNotifications = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const { notifications, unreadCount, isLoading, error, isOpen } = useSelector(
    (state: RootState) => state.notifications,
  )

  useEffect(() => {
    if (user?.id) {
      // Fetch initial notifications
      dispatch(fetchUserNotifications(user.id) as any)

      // Connect to WebSocket for real-time notifications
      notificationWebSocketService.connect(user.id)

      return () => {
        notificationWebSocketService.disconnect()
      }
    }
  }, [dispatch, user?.id])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    isOpen,
  }
}