"use client"

import { Bell, Check, X } from "lucide-react"
import type React from "react"
import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "../../../components/ui/button"
import { ScrollArea } from "../../../components/ui/scroll-area"
import type { RootState } from "../../../store"
import type { Notification } from "../../../types/notification.types"
import {
  closeNotificationsPanel,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../slices/notificationsSlice"
import { NotificationItem } from "./NotificationItem"

interface NotificationsPanelProps {
  isOpen: boolean
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen }) => {
  const dispatch = useDispatch()
  const { notifications, unreadCount, isLoading } = useSelector((state: RootState) => state.notifications)
  const { user } = useSelector((state: RootState) => state.auth)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        dispatch(closeNotificationsPanel())
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, dispatch])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      dispatch(markNotificationAsRead(notification.id) as any)
    }
  }

  const handleMarkAllAsRead = () => {
    if (user?.id) {
      dispatch(markAllNotificationsAsRead(user.id) as any)
    }
  }

  return (
    <div
      ref={panelRef}
      className={`fixed top-14 right-4 w-96 bg-white border rounded-md shadow-md z-50 overflow-hidden transition-all duration-300 ${
        isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </div>
        <div>
          <Button variant="ghost" size="sm" onClick={() => dispatch(closeNotificationsPanel())}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[400px] p-2">
        {notifications?.length > 0 ? (
          (notifications ?? []).map((notification) => (
            <NotificationItem key={notification.id} notification={notification} onClick={handleNotificationClick} />
          ))
        ) : (
          <div className="text-center text-gray-500 p-4">No new notifications</div>
        )}
      </ScrollArea>
      {notifications?.length > 0 && unreadCount > 0 && (
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleMarkAllAsRead}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
            ) : (
              <Check className="h-4 w-4" />
            )}
            Mark all as read
          </Button>
        </div>
      )}
    </div>
  )
}