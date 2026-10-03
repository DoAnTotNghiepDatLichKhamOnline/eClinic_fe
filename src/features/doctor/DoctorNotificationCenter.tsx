import { useState } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { useLanguage } from '@/shared/context/LanguageContext'
import type { DoctorSection } from './DoctorSidebar'
import styles from './DoctorNotificationCenter.module.css'

interface Notice {
  id: string
  kind: 'booking' | 'shift' | 'appointment'
  section: DoctorSection
  time: string
  read: boolean
}

interface DoctorNotificationCenterProps {
  onNavigate: (section: DoctorSection) => void
}

const initialNotices: Notice[] = [
  { id: 'notice-booking-01', kind: 'booking', section: 'appointments', time: '09:42', read: false },
  { id: 'notice-shift-01', kind: 'shift', section: 'schedule', time: '09:18', read: false },
  { id: 'notice-move-01', kind: 'appointment', section: 'appointments', time: '08:55', read: false },
]

export function DoctorNotificationCenter({ onNavigate }: DoctorNotificationCenterProps) {
  const { lang } = useLanguage()
  const [notices, setNotices] = useState(initialNotices)
  const [open, setOpen] = useState(false)
  const unreadCount = notices.filter((notice) => !notice.read).length

  const copy = (notice: Notice) => {
    if (notice.kind === 'booking') return lang === 'vi'
      ? ['Yêu cầu đặt lịch mới', 'Nguyễn Thị Mai vừa đăng ký khám tim mạch.']
      : ['New appointment request', 'Nguyen Thi Mai requested a cardiology visit.']
    if (notice.kind === 'shift') return lang === 'vi'
      ? ['Yêu cầu đổi ca đã được duyệt', 'Quản trị viên đã cập nhật lịch trực của bạn.']
      : ['Shift change approved', 'Your administrator updated your work schedule.']
    return lang === 'vi'
      ? ['Lịch hẹn được cập nhật', 'Một bệnh nhân đã dời hoặc hủy lịch khám.']
      : ['Appointment updated', 'A patient rescheduled or cancelled a visit.']
  }

  const openNotice = (notice: Notice) => {
    setNotices((current) => current.map((item) => item.id === notice.id ? { ...item, read: true } : item))
    setOpen(false)
    onNavigate(notice.section)
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={lang === 'vi' ? `Thông báo, ${unreadCount} chưa đọc` : `Notifications, ${unreadCount} unread`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell aria-hidden="true" size={19} />
        {unreadCount > 0 && <span className={styles.count}>{unreadCount}</span>}
      </button>

      {open && (
        <section className={styles.panel} aria-label={lang === 'vi' ? 'Trung tâm thông báo' : 'Notification center'}>
          <header className={styles.panelHeader}>
            <strong>{lang === 'vi' ? 'Thông báo' : 'Notifications'}</strong>
            <button
              type="button"
              className={styles.markAll}
              onClick={() => setNotices((current) => current.map((notice) => ({ ...notice, read: true })))}
            >
              <CheckCheck aria-hidden="true" size={15} />{lang === 'vi' ? 'Đã đọc hết' : 'Mark all read'}
            </button>
          </header>
          <div className={styles.list}>
            {notices.map((notice) => {
              const [title, description] = copy(notice)
              return (
                <button key={notice.id} type="button" className={`${styles.notice} ${notice.read ? '' : styles.unread}`} onClick={() => openNotice(notice)}>
                  <span className={styles.noticeDot}>{notice.read ? <Check aria-hidden="true" size={13} /> : <span />}</span>
                  <span className={styles.noticeCopy}><strong>{title}</strong><span>{description}</span><time>{notice.time}</time></span>
                </button>
              )
            })}
          </div>
          <p className={styles.footer}>{lang === 'vi' ? 'Thông tin mẫu, chờ kết nối dịch vụ thông báo.' : 'Sample feed. Live updates require a notification service.'}</p>
        </section>
      )}
    </div>
  )
}