import { useEffect, useRef, useState } from "react";
import { AlertCircle, Bell, CalendarClock, Check, CheckCheck, UserPlus, Loader2 } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useDanhSachThongBao, useSoThongBaoChuaDoc, useNotificationActions } from "@/hooks/useNotification";
import type { ThongBaoResponse } from "@/types/notification.type";
import type { AdminSection } from "./AdminSidebar";
import styles from "./AdminNotificationCenter.module.css";

interface AdminNotificationCenterProps {
  onNavigate: (section: AdminSection) => void;
}

function formatNoticeTime(isoDate?: string, vi?: boolean): string {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 5) return vi ? "Vừa xong" : "Just now";
  if (mins < 60) return vi ? `${mins} phút trước` : `${mins}m ago`;
  if (hours < 24) return vi ? `${hours} giờ trước` : `${hours}h ago`;
  if (days < 7) return vi ? `${days} ngày trước` : `${days}d ago`;
  return d.toLocaleDateString(vi ? "vi-VN" : "en-US", { month: "short", day: "numeric" });
}

export function AdminNotificationCenter({ onNavigate }: AdminNotificationCenterProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  const { danhSach: notices, isLoading } = useDanhSachThongBao({ kichThuoc: 10 });
  const { soChuaDoc } = useSoThongBaoChuaDoc();
  const { danhDauDaDoc, danhDauTatCaDaDoc } = useNotificationActions();

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const handleMarkAllRead = async () => {
    try {
      await danhDauTatCaDaDoc();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenNotice = async (notice: ThongBaoResponse) => {
    if (!notice.daDoc) {
      try {
        await danhDauDaDoc(notice.id);
      } catch (err) {
        console.error(err);
      }
    }
    setOpen(false);
    if (notice.idLichHen) {
      onNavigate("schedule");
    } else if (notice.idYeuCau) {
      onNavigate("schedule");
    } else {
      onNavigate("dashboard");
    }
  };

  const renderIcon = (notice: ThongBaoResponse) => {
    if (notice.daDoc) return <Check size={13} aria-hidden="true" />;
    if (notice.idLichHen) return <CalendarClock size={13} aria-hidden="true" />;
    if (notice.idYeuCau) return <UserPlus size={13} aria-hidden="true" />;
    return <AlertCircle size={13} aria-hidden="true" />;
  };

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={
          vi
            ? `Thông báo quản trị, ${soChuaDoc} chưa đọc`
            : `Admin notifications, ${soChuaDoc} unread`
        }
        aria-expanded={open}
        onClick={() => setOpen((val) => !val)}
      >
        <Bell aria-hidden="true" size={18} />
        {soChuaDoc > 0 && <span className={styles.count}>{soChuaDoc}</span>}
      </button>

      {open && (
        <section
          className={styles.panel}
          aria-label={vi ? "Trung tâm thông báo quản trị" : "Admin notification center"}
        >
          <header className={styles.panelHeader}>
            <span className={styles.panelTitle}>
              {vi ? "Thông báo hệ thống" : "System Notifications"}
            </span>
            {soChuaDoc > 0 && (
              <button type="button" className={styles.markAll} onClick={handleMarkAllRead}>
                <CheckCheck size={14} aria-hidden="true" />
                {vi ? "Đã đọc hết" : "Mark all read"}
              </button>
            )}
          </header>

          <div className={styles.list}>
            {isLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "24px 0", color: "#64748b" }}>
                <Loader2 size={16} className="animate-spin" />
              </div>
            ) : notices.length === 0 ? (
              <div className={styles.empty}>
                {vi ? "Không có thông báo mới" : "No new notifications"}
              </div>
            ) : (
              notices.map((notice) => (
                <button
                  key={notice.id}
                  type="button"
                  className={`${styles.notice} ${notice.daDoc ? "" : styles.unread}`}
                  onClick={() => handleOpenNotice(notice)}
                >
                  <span className={styles.noticeDot}>{renderIcon(notice)}</span>
                  <span className={styles.noticeCopy}>
                    <strong>{vi ? "Thông báo" : "Notification"}</strong>
                    <span>{notice.noiDung}</span>
                    <time>{formatNoticeTime(notice.ngayTao, vi)}</time>
                  </span>
                </button>
              ))
            )}
          </div>

          <p className={styles.footer}>
            {vi
              ? "Hệ thống thông báo thời gian thực dành cho Quản trị viên"
              : "Real-time system notification stream for Administrators"}
          </p>
        </section>
      )}
    </div>
  );
}
