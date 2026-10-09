import { useEffect, useRef, useState } from "react";
import { Bell, Calendar, Check, CheckCheck, FileText, HeartPulse } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import type { LoaiThongBao } from "@/types/common.type";
import styles from "./PatientNotificationCenter.module.css";

interface PatientNotice {
  id: string;
  loai: LoaiThongBao;
  path: string;
  time: string;
  read: boolean;
  title: { vi: string; en: string };
  desc: { vi: string; en: string };
}

const initialNotices: PatientNotice[] = [
  {
    id: "pat-notice-01",
    loai: "NHAC_LICH_KHAM",
    path: "/patient/my-appointments",
    time: "09:30",
    read: false,
    title: {
      vi: "Nhắc nhở lịch khám sắp tới",
      en: "Upcoming appointment reminder",
    },
    desc: {
      vi: "Lịch hẹn lúc 09:30 ngày 18/10 với BS. Trần Thị Lan.",
      en: "Appointment at 09:30 on Oct 18 with Dr. Tran Thi Lan.",
    },
  },
  {
    id: "pat-notice-02",
    loai: "HE_THONG",
    path: "/patient/patient-profile",
    time: "08:15",
    read: false,
    title: {
      vi: "Hồ sơ y tế được cập nhật",
      en: "Medical records updated",
    },
    desc: {
      vi: "Thông tin thẻ BHYT và tiền sử bệnh đã được lưu thành công.",
      en: "Health insurance and medical history updated successfully.",
    },
  },
  {
    id: "pat-notice-03",
    loai: "NHAC_LICH_KHAM",
    path: "/appointment",
    time: "Hôm qua",
    read: true,
    title: {
      vi: "Tái khám theo hẹn bác sĩ",
      en: "Follow-up visit reminder",
    },
    desc: {
      vi: "Đã đến kỳ tái khám chuyên khoa Tim mạch theo chỉ định.",
      en: "It is time for your scheduled Cardiology follow-up visit.",
    },
  },
];

export function PatientNotificationCenter() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
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

  const handleOpenNotice = (notice: PatientNotice) => {
    setNotices((current) =>
      current.map((item) => (item.id === notice.id ? { ...item, read: true } : item))
    );
    setOpen(false);
    navigate(notice.path);
  };

  const renderIcon = (notice: PatientNotice) => {
    if (notice.read) return <Check size={13} aria-hidden="true" />;
    if (notice.loai === "NHAC_LICH_KHAM") return <Calendar size={12} aria-hidden="true" />;
    if (notice.loai === "HE_THONG") return <FileText size={12} aria-hidden="true" />;
    return <HeartPulse size={12} aria-hidden="true" />;
  };

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={
          lang === "vi"
            ? `Thông báo, ${unreadCount} chưa đọc`
            : `Notifications, ${unreadCount} unread`
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
          aria-label={lang === "vi" ? "Trung tâm thông báo" : "Notification center"}
        >
          <header className={styles.panelHeader}>
            <span className={styles.panelTitle}>
              {lang === "vi" ? "Thông báo bệnh nhân" : "Patient Notifications"}
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
              ? "Cập nhật thời gian thực về lịch hẹn và kết quả khám"
              : "Real-time updates on appointments & medical records"}
          </p>
        </section>
      )}
    </div>
  );
}
