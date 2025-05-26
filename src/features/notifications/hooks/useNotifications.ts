import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../../store"
import { notificationWebSocketService } from "../services/notificationWebSocket"
import { fetchUserNotifications } from "../slices/notificationsSlice"

export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user, token } = useSelector((s: RootState) => s.auth)
  const { notifications, unreadCount, isLoading, error, isOpen } =
    useSelector((s: RootState) => s.notifications)

  useEffect(() => {
    if (user?.id && token) {
      dispatch(fetchUserNotifications(user.id))
      notificationWebSocketService.connect(user.id, token)
      return () => { notificationWebSocketService.disconnect() }
    }
  }, [dispatch, user?.id, token])

  return { notifications, unreadCount, isLoading, error, isOpen }
}
