"use client"

import { getAuthToken } from "@/lib/cookies"
import type React from "react"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../../../store"
import { notificationWebSocketService } from "../services/notificationWebSocket"
import { fetchUserNotifications } from "../slices/notificationsSlice"
import { NotificationsPanel } from "./NotificationsPanel"

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const { isOpen } = useSelector((state: RootState) => state.notifications)

  useEffect(() => {
      if (!user?.id || !user.is_verified) {
        return
      }
      // Fetch initial notifications
      dispatch(fetchUserNotifications(user.id) as any)

      // Connect to WebSocket for real-time notifications
      notificationWebSocketService.connect(user.id, getAuthToken() ?? "")

      return () => {
        notificationWebSocketService.disconnect()
      }

  }, [dispatch, user])

  return (
    <>
      {children}
      <NotificationsPanel isOpen={isOpen} />
    </>
  )
}
