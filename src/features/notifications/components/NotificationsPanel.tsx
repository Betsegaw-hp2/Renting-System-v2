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
  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.is_read) {
      dispatch(markNotificationAsRead(notification.id) as any)
    }
  }  // Navigate after marking as read - updated for real API schema
  const handleNavigate = (notification: Notification) => {
    console.log('Navigation triggered for notification:', notification)
    const payload = notification.payload || {}
    
    console.log('Notification type:', notification.type, 'Payload:', payload)
    
    switch (notification.type) {
      case "booking_request":
      case "booking_confirmed":
        // For booking_confirmed with checkout_url, open payment page
        if (notification.type === "booking_confirmed" && payload.checkout_url) {
          console.log('Opening checkout URL:', payload.checkout_url)
          window.open(payload.checkout_url, "_blank")
        } else if (payload.listing_id && payload.booking_id) {
          // Route: /listings/:listingId/bookings/:bookingId
          const url = `/listings/${payload.listing_id}/bookings/${payload.booking_id}`
          console.log('Navigating to booking:', url)
          window.location.href = url
        } else if (payload.listing_id) {
          // Route: /listings/:id
          const url = `/listings/${payload.listing_id}`
          console.log('Navigating to listing:', url)
          window.location.href = url
        } else {
          console.log('No valid booking/listing data found in payload')
        }
        break

      case "new_message":
        if (payload.listing_id && payload.receiver_id) {
          // Route: /messages/:listingId/:receiverId
          const url = `/messages/${payload.listing_id}/${payload.receiver_id}`
          console.log('Navigating to messages:', url)
          window.location.href = url
        } else if (payload.chat_id) {
          // Fallback to messages page if specific params not available
          console.log('Navigating to messages fallback')
          window.location.href = `/messages`
        } else {
          console.log('No valid message data found in payload')
        }
        break

      case "generic":
        if (payload.url) {
          if (typeof payload.url === "string" && payload.url.startsWith("http")) {
            console.log('Opening external URL:', payload.url)
            window.open(payload.url, "_blank")
          } else {
            console.log('Navigating to internal URL:', payload.url)
            window.location.href = payload.url
          }
        } else {
          console.log('No URL found in generic notification payload')
        }
        break

      default:
        console.log("No specific action for this notification type:", notification.type)
        break
    }
    dispatch(closeNotificationsPanel())
  }

  const handleMarkAllAsRead = () => {
    if (user?.id) {
      dispatch(markAllNotificationsAsRead(user.id) as any)
    }
  }
  return (    <div
      ref={panelRef}
      className={`fixed z-50 overflow-hidden transition-all duration-300 bg-white border rounded-lg shadow-lg ${
        isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } 
      /* Mobile: Full width with margins */
      top-14 left-4 right-4 
      /* Desktop: Fixed width on the right */
      sm:top-14 sm:right-4 sm:left-auto sm:w-96 sm:max-w-md`}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2 min-w-0">
          <Bell className="h-5 w-5 text-gray-500 flex-shrink-0" />
          <h2 className="text-lg font-semibold text-gray-900 truncate">Notifications</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-xs font-medium text-primary-foreground flex-shrink-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => dispatch(closeNotificationsPanel())}>
          <X className="h-4 w-4" />
        </Button>
      </div>      {/* Content */}
      <ScrollArea className="h-[350px] sm:h-[400px] max-h-[60vh]">
        <div className="p-3">
          {notifications?.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onNavigate={handleNavigate}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">
                We'll notify you when something happens
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer - Mark all as read */}
      {notifications?.length > 0 && unreadCount > 0 && (
        <div className="p-3 border-t bg-gray-50">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 h-9"
            onClick={handleMarkAllAsRead}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
            ) : (
              <Check className="h-4 w-4" />
            )}
            <span className="text-sm">Mark all as read</span>
          </Button>
        </div>
      )}
    </div>
  )
}