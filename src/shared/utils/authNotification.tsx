import { notification } from 'antd'
import { CircleAlert, CircleCheck, Info } from 'lucide-react'

type AuthNotificationType = 'success' | 'info' | 'error'

const icons = {
  success: <CircleCheck aria-hidden="true" size={20} />,
  info: <Info aria-hidden="true" size={20} />,
  error: <CircleAlert aria-hidden="true" size={20} />,
}

export function notifyAuth(type: AuthNotificationType, message: string, description: string) {
  notification.open({
    title: message,
    description,
    icon: icons[type],
    placement: 'topRight',
    duration: 4,
  })
}