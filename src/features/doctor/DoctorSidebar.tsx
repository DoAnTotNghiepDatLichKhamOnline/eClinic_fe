import {
  CalendarClock,
  LayoutDashboard,
  Stethoscope,
  UserRound,
  ArrowRightLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import styles from "./DoctorSidebar.module.css";

export type DoctorSection =
  | "dashboard"
  | "schedule"
  | "shift-requests"
  | "consultation"
  | "profile";

const items: { id: DoctorSection; en: string; vi: string; icon: LucideIcon }[] =
  [
    {
      id: "dashboard",
      en: "Dashboard",
      vi: "Bảng điều khiển",
      icon: LayoutDashboard,
    },
    {
      id: "schedule",
      en: "Personal Schedule",
      vi: "Lịch làm việc cá nhân",
      icon: CalendarClock,
    },
    {
      id: "shift-requests",
      en: "Shift Requests",
      vi: "Yêu cầu đổi / nghỉ ca",
      icon: ArrowRightLeft,
    },
    {
      id: "consultation",
      en: "Consultation / EMR",
      vi: "Tiếp nhận & khám bệnh",
      icon: Stethoscope,
    },
    {
      id: "profile",
      en: "Doctor Profile",
      vi: "Hồ sơ cá nhân",
      icon: UserRound,
    },
  ];

interface DoctorSidebarProps {
  activeSection: DoctorSection | null;
  onSelect: (section: DoctorSection) => void;
}

export function DoctorSidebar({ activeSection, onSelect }: DoctorSidebarProps) {
  const { lang } = useLanguage();

  return (
    <aside className={styles.sidebar}>
      <span className={styles.label}>
        {lang === "vi" ? "Không gian bác sĩ" : "Doctor workspace"}
      </span>
      <nav
        className={styles.menu}
        aria-label={lang === "vi" ? "Menu bác sĩ" : "Doctor menu"}
      >
        {items.map(({ id, en, vi, icon: Icon }) => {
          const isActive =
            id === "dashboard"
              ? activeSection === null || activeSection === "dashboard"
              : activeSection === id;
          return (
            <button
              key={id}
              type="button"
              className={`${styles.item} ${isActive ? styles.active : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onSelect(id)}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{lang === "vi" ? vi : en}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
