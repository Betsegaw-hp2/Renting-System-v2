"use client"

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

  return (
    <>
      {children}
      <NotificationsPanel isOpen={isOpen} />
    </>
  )
}
