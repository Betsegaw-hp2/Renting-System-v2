"use client"

import { formatDistanceToNow } from "date-fns"
import type React from "react"
import type { Notification } from "../../../types/notification.types"

interface NotificationItemProps {
  notification: Notification
  onClick: (notification: Notification) => void
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const formattedTime = notification.created_at
    ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })
    : "recently"

  return (
    <div
      className={`p-3 mb-2 rounded-md cursor-pointer transition-colors ${
        notification.is_read ? "bg-gray-50 hover:bg-gray-100" : "bg-blue-50 hover:bg-blue-100"
      }`}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm ${notification.is_read ? "text-gray-700" : "text-gray-900 font-medium"}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-1">{formattedTime}</p>
        </div>
        {!notification.is_read && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1"></div>}
      </div>
    </div>
  )
}