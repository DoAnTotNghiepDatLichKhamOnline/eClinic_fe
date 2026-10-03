import { BookOpen, CalendarDays, LayoutDashboard, Stethoscope, UsersRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/shared/context/LanguageContext'
import styles from './AdminSidebar.module.css'

export type AdminSection = 'dashboard' | 'schedule' | 'catalog' | 'doctors' | 'patients'

const items: { id: AdminSection; en: string; vi: string; icon: LucideIcon }[] = [
  { id: 'dashboard', en: 'Dashboard', vi: 'Dashboard', icon: LayoutDashboard },
  { id: 'schedule', en: 'Schedule Management', vi: 'Quản lý lịch khám', icon: CalendarDays },
  { id: 'catalog', en: 'Medical Catalog', vi: 'Danh mục y tế', icon: BookOpen },
  { id: 'doctors', en: 'Doctor Management', vi: 'Quản lý bác sĩ', icon: Stethoscope },
  { id: 'patients', en: 'Patient Management', vi: 'Quản lý bệnh nhân', icon: UsersRound },
]

interface AdminSidebarProps {
  activeSection: AdminSection
  onSelect: (section: AdminSection) => void
}

export function AdminSidebar({ activeSection, onSelect }: AdminSidebarProps) {
  const { lang } = useLanguage()

  return (
    <aside className={styles.sidebar}>
      <span className={styles.sidebarLabel}>{lang === 'vi' ? 'Điều hướng' : 'Workspace'}</span>
      <nav className={styles.menuList} aria-label={lang === 'vi' ? 'Menu quản trị' : 'Admin menu'}>
        {items.map(({ id, en, vi, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`${styles.menuItem} ${activeSection === id ? styles.menuItemActive : ''}`}
            aria-current={activeSection === id ? 'page' : undefined}
            onClick={() => onSelect(id)}
          >
            <Icon aria-hidden="true" size={18} />
            <span>{lang === 'vi' ? vi : en}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}