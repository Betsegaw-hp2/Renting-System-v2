"use client"

import { Bell } from "lucide-react"
import type React from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "../../../components/ui/button"
import type { RootState } from "../../../store"
import { toggleNotificationsPanel } from "../slices/notificationsSlice"

export const NotificationBell: React.FC = () => {
  const dispatch = useDispatch()
  const { unreadCount, wsConnected } = useSelector((state: RootState) => state.notifications)

  const handleClick = () => {
    dispatch(toggleNotificationsPanel())
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={handleClick}
      aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground animate-pulse">
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
      )}
      {/* WS status dot */}
      <span
      className={`absolute bottom-2/3 right-1 block h-2 w-2 rounded-full 
        ${wsConnected ? "bg-blue-300" : "bg-red-300"} animate-pulse`}
      title={wsConnected ? "Connected" : "Disconnected"}
      />
    </Button>
  )
}
