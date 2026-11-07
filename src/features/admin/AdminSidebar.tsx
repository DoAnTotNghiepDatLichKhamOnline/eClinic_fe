import {
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  Stethoscope,
  UsersRound,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import styles from "./AdminSidebar.module.css";

export type AdminSection =
  | "dashboard"
  | "schedule"
  | "catalog"
  | "doctors"
  | "patients"
  | "accounts";

export interface MenuGroup {
  title: { en: string; vi: string };
  items: {
    id: AdminSection;
    en: string;
    vi: string;
    icon: LucideIcon;
  }[];
}

const menuGroups: MenuGroup[] = [
  {
    title: { en: "Overview", vi: "Tổng quan" },
    items: [
      {
        id: "dashboard",
        en: "Dashboard",
        vi: "Bảng điều khiển",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: { en: "Medical Operations", vi: "Nghiệp vụ y tế" },
    items: [
      {
        id: "schedule",
        en: "Schedule Management",
        vi: "Quản lý lịch khám",
        icon: CalendarDays,
      },
      {
        id: "catalog",
        en: "Medical Catalog",
        vi: "Danh mục y tế",
        icon: BookOpen,
      },
      {
        id: "doctors",
        en: "Doctor Management",
        vi: "Quản lý bác sĩ",
        icon: Stethoscope,
      },
      {
        id: "patients",
        en: "Patient Management",
        vi: "Bệnh nhân & Tiếp nhận",
        icon: UsersRound,
      },
    ],
  },
  {
    title: { en: "System & Settings", vi: "Hệ thống & Cài đặt" },
    items: [
      {
        id: "accounts",
        en: "Account Management",
        vi: "Quản lý tài khoản",
        icon: ShieldCheck,
      },
    ],
  },
];

export interface AdminSidebarProps {
  activeSection: AdminSection;
  onSelect: (section: AdminSection) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  activeSection,
  onSelect,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""}`}
      aria-label={vi ? "Thanh điều hướng quản trị" : "Admin navigation"}
    >
      <div className={styles.sidebarBody}>
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className={styles.group}>
            <span className={styles.groupHeader}>
              {vi ? group.title.vi : group.title.en}
            </span>
            <nav
              className={styles.menuList}
              aria-label={vi ? group.title.vi : group.title.en}
            >
              {group.items.map(({ id, en, vi: viLabel, icon: Icon }) => {
                const isActive = activeSection === id;
                const label = vi ? viLabel : en;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => onSelect(id)}
                    title={isCollapsed ? label : undefined}
                  >
                    <Icon aria-hidden="true" size={18} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className={styles.sidebarFooter}>
        <div className={styles.footerInfo}>
          <div className={styles.footerStatus}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span>{vi ? "Hệ thống trực tuyến" : "System online"}</span>
          </div>
          <span className={styles.footerVersion}>v1.0.2 - eClinic</span>
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={onToggleCollapse}
            title={
              isCollapsed
                ? vi
                  ? "Mở rộng thanh menu"
                  : "Expand sidebar"
                : vi
                  ? "Thu gọn thanh menu"
                  : "Collapse sidebar"
            }
          >
            {isCollapsed ? (
              <PanelLeftOpen size={16} aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose size={16} aria-hidden="true" />
                <span>{vi ? "Thu gọn menu" : "Collapse"}</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
