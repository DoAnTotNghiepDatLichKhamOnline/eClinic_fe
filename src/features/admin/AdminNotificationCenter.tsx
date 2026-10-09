import { useEffect, useRef, useState } from "react";
import { AlertCircle, Bell, CalendarClock, Check, CheckCheck, UserPlus } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import type { AdminSection } from "./AdminSidebar";
import styles from "./AdminNotificationCenter.module.css";

interface AdminNotice {
  id: string;
  kind: "booking" | "doctor" | "shift";
  section: AdminSection;
  time: string;
  read: boolean;
  title: { vi: string; en: string };
  desc: { vi: string; en: string };
}

interface AdminNotificationCenterProps {
  onNavigate: (section: AdminSection) => void;
}

const initialNotices: AdminNotice[] = [
  {
    id: "admin-notice-01",
    kind: "booking",
    section: "schedule",
    time: "10:12",
    read: false,
    title: {
      vi: "Yêu cầu đặt lịch mới",
      en: "New appointment request",
    },
    desc: {
      vi: "Bệnh nhân Nguyễn Văn An vừa đặt khám chuyên khoa Tim mạch.",
      en: "Patient Nguyen Van An booked a Cardiology appointment.",
    },
  },
  {
    id: "admin-notice-02",
    kind: "doctor",
    section: "doctors",
    time: "09:05",
    read: false,
    title: {
      vi: "Hồ sơ bác sĩ chờ phê duyệt",
      en: "Doctor profile pending review",
    },
    desc: {
      vi: "BS. Trần Thị Bình đã gửi cập nhật chứng chỉ chuyên khoa Sản.",
      en: "Dr. Tran Thi Binh submitted updated obstetrics credentials.",
    },
  },
  {
    id: "admin-notice-03",
    kind: "shift",
    section: "schedule",
    time: "Hôm qua",
    read: true,
    title: {
      vi: "Cảnh báo phân ca trực",
      en: "Shift scheduling alert",
    },
    desc: {
      vi: "Khoa Nhi cần bổ sung bác sĩ phụ trách ca trực chiều mai.",
      en: "Pediatrics requires an additional doctor for tomorrow afternoon shift.",
    },
  },
];

export function AdminNotificationCenter({ onNavigate }: AdminNotificationCenterProps) {
  const { lang } = useLanguage();
  const [notices, setNotices] = useState(initialNotices);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const unreadCount = notices.filter((n) => !n.read).length;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const markAllRead = () => {
    setNotices((current) => current.map((n) => ({ ...n, read: true })));
  };

  const handleOpenNotice = (notice: AdminNotice) => {
    setNotices((current) =>
      current.map((item) => (item.id === notice.id ? { ...item, read: true } : item))
    );
    setOpen(false);
    onNavigate(notice.section);
  };

  const renderIcon = (notice: AdminNotice) => {
    if (notice.read) return <Check size={13} aria-hidden="true" />;
    if (notice.kind === "booking") return <CalendarClock size={13} aria-hidden="true" />;
    if (notice.kind === "doctor") return <UserPlus size={13} aria-hidden="true" />;
    return <AlertCircle size={13} aria-hidden="true" />;
  };

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={
          lang === "vi"
            ? `Thông báo quản trị, ${unreadCount} chưa đọc`
            : `Admin notifications, ${unreadCount} unread`
        }
        aria-expanded={open}
        onClick={() => setOpen((val) => !val)}
      >
        <Bell aria-hidden="true" size={18} />
        {unreadCount > 0 && <span className={styles.count}>{unreadCount}</span>}
      </button>

      {open && (
        <section
          className={styles.panel}
          aria-label={lang === "vi" ? "Trung tâm thông báo quản trị" : "Admin notification center"}
        >
          <header className={styles.panelHeader}>
            <span className={styles.panelTitle}>
              {lang === "vi" ? "Thông báo hệ thống" : "System Notifications"}
            </span>
            {unreadCount > 0 && (
              <button type="button" className={styles.markAll} onClick={markAllRead}>
                <CheckCheck size={14} aria-hidden="true" />
                {lang === "vi" ? "Đã đọc hết" : "Mark all read"}
              </button>
            )}
          </header>

          <div className={styles.list}>
            {notices.length === 0 ? (
              <div className={styles.empty}>
                {lang === "vi" ? "Không có thông báo mới" : "No new notifications"}
              </div>
            ) : (
              notices.map((notice) => (
                <button
                  key={notice.id}
                  type="button"
                  className={`${styles.notice} ${notice.read ? "" : styles.unread}`}
                  onClick={() => handleOpenNotice(notice)}
                >
                  <span className={styles.noticeDot}>{renderIcon(notice)}</span>
                  <span className={styles.noticeCopy}>
                    <strong>{lang === "vi" ? notice.title.vi : notice.title.en}</strong>
                    <span>{lang === "vi" ? notice.desc.vi : notice.desc.en}</span>
                    <time>{notice.time}</time>
                  </span>
                </button>
              ))
            )}
          </div>

          <p className={styles.footer}>
            {lang === "vi"
              ? "Hệ thống thông báo thời gian thực dành cho Quản trị viên"
              : "Real-time system notification stream for Administrators"}
          </p>
        </section>
      )}
    </div>
  );
}
