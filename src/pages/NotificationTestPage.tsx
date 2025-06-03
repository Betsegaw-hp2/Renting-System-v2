import { Bell } from "lucide-react"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "../components/ui/button"
import { NotificationsPanel } from "../features/notifications/components/NotificationsPanel"
import { toggleNotificationsPanel } from "../features/notifications/slices/notificationsSlice"
import type { RootState } from "../store"

export const NotificationTestPage: React.FC = () => {
  const dispatch = useDispatch()
  const { isOpen } = useSelector((state: RootState) => state.notifications)

  const handleOpenNotifications = () => {
    dispatch(toggleNotificationsPanel())
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Notification System Demo
          </h1>
          <p className="text-gray-600 mb-6">
            Test the new responsive notification system with expandable items, 
            separate mark-as-read actions, and navigation buttons.
          </p>
          
          <div className="space-y-4">
            <div className="relative">
              <Button 
                onClick={handleOpenNotifications}
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Open Notifications Panel
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Features</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Responsive design (mobile & desktop)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Expandable notification items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Message truncation with "..." indicator</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Separate "Mark as read" button</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Navigation action buttons</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>No horizontal overflow/scrolling</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">How to Test</h2>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-medium">1.</span>
                    <span>Click "Open Notifications Panel" button</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-medium">2.</span>
                    <span>Click expand arrow to see full message</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-medium">3.</span>
                    <span>Use "Mark as read" for individual items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-medium">4.</span>
                    <span>Click "View details" to navigate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-medium">5.</span>
                    <span>Test on mobile by resizing browser</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Technical Implementation
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Key Changes:</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Separated mark-as-read from navigation</li>
                <li>• Added expandable notification items</li>
                <li>• Implemented message truncation (80 chars)</li>
                <li>• Fixed horizontal overflow issues</li>
                <li>• Added responsive positioning</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">API Integration:</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• PATCH requests for mark-as-read</li>
                <li>• JSON payload parsing for navigation</li>
                <li>• Route-specific navigation logic</li>
                <li>• Error handling for malformed data</li>
                <li>• WebSocket real-time updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
        {/* Notification Panel */}
      <NotificationsPanel isOpen={isOpen} />
    </div>
  )
}

export default NotificationTestPage
