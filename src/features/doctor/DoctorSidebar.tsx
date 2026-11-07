import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  LayoutDashboard,
  Stethoscope,
  UserRound,
  ArrowRightLeft,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { doctorBookingService } from "@/services/booking";
import styles from "./DoctorSidebar.module.css";

export type DoctorSection =
  | "dashboard"
  | "schedule"
  | "shift-requests"
  | "consultation"
  | "profile";

export interface DoctorMenuGroup {
  title: { en: string; vi: string };
  items: {
    id: DoctorSection;
    en: string;
    vi: string;
    icon: LucideIcon;
    hasQueueBadge?: boolean;
  }[];
}

const menuGroups: DoctorMenuGroup[] = [
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
    title: { en: "Clinical & Consultation", vi: "Lâm sàng & Khám bệnh" },
    items: [
      {
        id: "consultation",
        en: "Consultation / EMR",
        vi: "Tiếp nhận & khám bệnh",
        icon: Stethoscope,
        hasQueueBadge: true,
      },
      {
        id: "schedule",
        en: "Personal Schedule",
        vi: "Lịch làm việc cá nhân",
        icon: CalendarClock,
      },
    ],
  },
  {
    title: { en: "Utilities & Account", vi: "Tiện ích & Tài khoản" },
    items: [
      {
        id: "shift-requests",
        en: "Shift Requests",
        vi: "Yêu cầu đổi / nghỉ ca",
        icon: ArrowRightLeft,
      },
      {
        id: "profile",
        en: "Doctor Profile",
        vi: "Hồ sơ cá nhân",
        icon: UserRound,
      },
    ],
  },
];

export interface DoctorSidebarProps {
  activeSection: DoctorSection | null;
  onSelect: (section: DoctorSection) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  waitingCount?: number;
}

export function DoctorSidebar({
  activeSection,
  onSelect,
  isCollapsed = false,
  onToggleCollapse,
  waitingCount,
}: DoctorSidebarProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  // Duty status toggle ("Đang trong ca khám" / "Nghỉ giải lao")
  const [isOnDuty, setIsOnDuty] = useState(() => {
    try {
      return localStorage.getItem("doctor_on_duty") !== "false";
    } catch {
      return true;
    }
  });

  const handleToggleDuty = () => {
    setIsOnDuty((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("doctor_on_duty", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Live queue data for badge counter if not passed from parent
  const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
  const { data: queueResponse } = useQuery({
    queryKey: ["booking", "doctor-sidebar-hang-doi", today],
    queryFn: () => doctorBookingService.getHangDoi(today),
    refetchInterval: 30000,
    staleTime: 15000,
    enabled: waitingCount === undefined,
  });

  const liveWaiting =
    waitingCount ?? queueResponse?.duLieu?.soLuong?.choKham ?? 0;

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""}`}
      aria-label={vi ? "Thanh điều hướng bác sĩ" : "Doctor navigation"}
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
              {group.items.map(
                ({ id, en, vi: viLabel, icon: Icon, hasQueueBadge }) => {
                  const isActive =
                    id === "dashboard"
                      ? activeSection === null || activeSection === "dashboard"
                      : activeSection === id;
                  const label = vi ? viLabel : en;

                  return (
                    <button
                      key={id}
                      type="button"
                      className={`${styles.item} ${isActive ? styles.active : ""}`}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => onSelect(id)}
                      title={
                        isCollapsed
                          ? hasQueueBadge && liveWaiting > 0
                            ? `${label} (${vi ? "Đang chờ: " : "Waiting: "}${liveWaiting})`
                            : label
                          : undefined
                      }
                    >
                      <div className={styles.itemContent}>
                        <Icon size={18} aria-hidden="true" />
                        <span>{label}</span>
                      </div>

                      {hasQueueBadge && (
                        <span
                          className={`${styles.badgeQueue} ${liveWaiting === 0 ? styles.badgeQueueMuted : ""}`}
                          title={
                            vi
                              ? `Số bệnh nhân đang chờ: ${liveWaiting}`
                              : `Patients waiting: ${liveWaiting}`
                          }
                        >
                          {liveWaiting > 0
                            ? vi
                              ? `Chờ: ${liveWaiting}`
                              : `Wait: ${liveWaiting}`
                            : vi
                              ? "0"
                              : "0"}
                        </span>
                      )}
                    </button>
                  );
                },
              )}
            </nav>
          </div>
        ))}
      </div>

      <div className={styles.sidebarFooter}>
        <button
          type="button"
          className={styles.dutyToggle}
          onClick={handleToggleDuty}
          title={
            vi
              ? `Trạng thái: ${isOnDuty ? "Đang trong ca khám (Nhấn để chuyển sang Nghỉ giải lao)" : "Nghỉ giải lao (Nhấn để tiếp nhận ca khám)"}`
              : `Duty status: ${isOnDuty ? "On Duty (Click for break)" : "On Break (Click for duty)"}`
          }
        >
          <div className={styles.dutyStatusText}>
            <span
              className={isOnDuty ? styles.dutyDotActive : styles.dutyDotBreak}
              aria-hidden="true"
            />
            <span>
              {isOnDuty
                ? vi
                  ? "Đang trong ca khám"
                  : "On Duty"
                : vi
                  ? "Nghỉ giải lao"
                  : "On Break"}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">⚡</span>
        </button>

        <span className={styles.footerVersion}>v1.0.2 - Doctor Portal</span>

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
