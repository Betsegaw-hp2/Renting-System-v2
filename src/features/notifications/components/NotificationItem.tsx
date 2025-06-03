"use client"

import { formatDistanceToNow } from "date-fns"
import { Check, ChevronDown, ChevronRight, ExternalLink } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { Button } from "../../../components/ui/button"
import type { Notification } from "../../../types/notification.types"

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (notification: Notification) => void
  onNavigate?: (notification: Notification) => void
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead, 
  onNavigate 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const formattedTime = notification.created_at
    ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })
    : "recently"
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMarkAsRead(notification)
  }
  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onNavigate) {
      onNavigate(notification)
    }
  }
  // Truncate message for collapsed view
  const truncatedMessage = notification.message.length > 80 
    ? `${notification.message.substring(0, 80)}...` 
    : notification.message
  const hasNavigationAction = () => {
    if (!notification.payload) return false
    
    switch (notification.type) {
      case "booking_request":
      case "booking_confirmed":
        return !!(notification.payload.listing_id || notification.payload.booking_id)
      case "new_message":
        return !!(notification.payload.listing_id && notification.payload.receiver_id) || !!notification.payload.chat_id
      case "generic":
        return !!notification.payload.url
      default:
        return false
    }
  }
  const getActionButtons = () => {
    if (!hasNavigationAction()) return null
    
    switch (notification.type) {
      case "booking_request":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNavigate}
            className="h-8 px-3 text-xs"
          >
            View Request
          </Button>
        )
      case "booking_confirmed":
        // If there's a checkout_url, show "Proceed to Payment", otherwise "View Booking"
        if (notification.payload.checkout_url) {
          return (
            <Button
              variant="default"
              size="sm"
              onClick={handleNavigate}
              className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700"
            >
              Proceed to Payment
            </Button>
          )
        } else {
          return (
            <Button
              variant="default"
              size="sm"
              onClick={handleNavigate}
              className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700"
            >
              View Booking
            </Button>
          )
        }
      case "new_message":
        return (
          <Button
            variant="default"
            size="sm"
            onClick={handleNavigate}
            className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
          >
            Reply
          </Button>
        )
      case "generic":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNavigate}
            className="h-8 px-3 text-xs"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View
          </Button>
        )
      default:
        return null
    }
  }
  return (
    <div
      className={`mb-2 rounded-lg border transition-all duration-200 overflow-hidden ${
        notification.is_read 
          ? "bg-white border-gray-200 hover:border-gray-300" 
          : "bg-blue-50 border-blue-200 hover:border-blue-300"
      }`}
    >
      {/* Header - Always visible */}
      <div 
        className="p-3 cursor-pointer"
        onClick={handleToggleExpand}
      >
        <div className="flex items-start gap-3">
          {/* Expand/Collapse Icon */}
          <button className="mt-0.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          {/* Content */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className={`text-sm font-semibold truncate flex-1 ${
                notification.is_read ? 'text-gray-700' : 'text-gray-900'
              }`}>
                {notification.title || notification.type}
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!notification.is_read && (
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                )}
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formattedTime}
                </span>
              </div>
            </div>
            
            {/* Message - Truncated in collapsed view, full width */}
            <div className="w-full">
              <p className={`text-sm break-words ${
                notification.is_read ? "text-gray-600" : "text-gray-800"
              }`}>
                {isExpanded ? notification.message : truncatedMessage}
              </p>
            </div>
          </div>
        </div>
      </div>      {/* Expanded Actions - Grows downward */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/50">
          <div className="p-3">
            {/* Navigation hint */}
            {hasNavigationAction() && (
              <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700 flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Click on action buttons below to view details
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Mark as Read Button */}
                {!notification.is_read && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAsRead}
                    className="h-8 px-3 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark as read
                  </Button>
                )}
                
                {/* Type-specific Action Buttons */}
                {getActionButtons()}
              </div>
              
              {/* Status indicator */}
              {notification.is_read && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">
                  Read
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}