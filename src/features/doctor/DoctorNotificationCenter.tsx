import { useState } from 'react'
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react'
import { useLanguage } from '@/shared/context/LanguageContext'
import { useDanhSachThongBao, useSoThongBaoChuaDoc, useNotificationActions } from '@/hooks/useNotification'
import type { ThongBaoResponse } from '@/types/notification.type'
import type { DoctorSection } from './DoctorSidebar'
import styles from './DoctorNotificationCenter.module.css'

interface DoctorNotificationCenterProps {
  onNavigate: (section: DoctorSection) => void
}

function formatNoticeTime(isoDate?: string, vi?: boolean): string {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (mins < 5) return vi ? 'Vừa xong' : 'Just now'
  if (mins < 60) return vi ? `${mins} phút trước` : `${mins}m ago`
  if (hours < 24) return vi ? `${hours} giờ trước` : `${hours}h ago`
  if (days < 7) return vi ? `${days} ngày trước` : `${days}d ago`
  return d.toLocaleDateString(vi ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric' })
}

export function DoctorNotificationCenter({ onNavigate }: DoctorNotificationCenterProps) {
  const { lang } = useLanguage()
  const vi = lang === 'vi'

  const { danhSach: notices, isLoading } = useDanhSachThongBao({ kichThuoc: 10 })
  const { soChuaDoc } = useSoThongBaoChuaDoc()
  const { danhDauDaDoc, danhDauTatCaDaDoc } = useNotificationActions()

  const [open, setOpen] = useState(false)

  const openNotice = async (notice: ThongBaoResponse) => {
    if (!notice.daDoc) {
      try {
        await danhDauDaDoc(notice.id)
      } catch (err) {
        console.error(err)
      }
    }
    setOpen(false)
    if (notice.idYeuCau) {
      onNavigate('schedule')
    } else {
      onNavigate('dashboard')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await danhDauTatCaDaDoc()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={vi ? `Thông báo, ${soChuaDoc} chưa đọc` : `Notifications, ${soChuaDoc} unread`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell aria-hidden="true" size={19} />
        {soChuaDoc > 0 && <span className={styles.count}>{soChuaDoc}</span>}
      </button>

      {open && (
        <section className={styles.panel} aria-label={vi ? 'Trung tâm thông báo' : 'Notification center'}>
          <header className={styles.panelHeader}>
            <strong>{vi ? 'Thông báo' : 'Notifications'}</strong>
            {soChuaDoc > 0 && (
              <button
                type="button"
                className={styles.markAll}
                onClick={handleMarkAllRead}
              >
                <CheckCheck aria-hidden="true" size={15} />{vi ? 'Đã đọc hết' : 'Mark all read'}
              </button>
            )}
          </header>
          <div className={styles.list}>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0', color: '#64748b' }}>
                <Loader2 size={16} className="animate-spin" />
              </div>
            ) : notices.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#8a948f', fontSize: '13px' }}>
                {vi ? 'Không có thông báo mới' : 'No new notifications'}
              </div>
            ) : (
              notices.map((notice) => (
                <button
                  key={notice.id}
                  type="button"
                  className={`${styles.notice} ${notice.daDoc ? '' : styles.unread}`}
                  onClick={() => openNotice(notice)}
                >
                  <span className={styles.noticeDot}>{notice.daDoc ? <Check aria-hidden="true" size={13} /> : <span />}</span>
                  <span className={styles.noticeCopy}>
                    <strong>{vi ? 'Thông báo' : 'Notification'}</strong>
                    <span>{notice.noiDung}</span>
                    <time>{formatNoticeTime(notice.ngayTao, vi)}</time>
                  </span>
                </button>
              ))
            )}
          </div>
          <p className={styles.footer}>{vi ? 'Cập nhật trực tiếp từ hệ thống eClinic.' : 'Real-time updates from eClinic.'}</p>
        </section>
      )}
    </div>
  )
}