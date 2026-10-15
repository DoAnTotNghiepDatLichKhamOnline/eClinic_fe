import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Calendar,
  Check,
  CheckCheck,
  FileText,
  HeartPulse,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import {
  useDanhSachThongBao,
  useSoThongBaoChuaDoc,
  useNotificationActions,
} from "@/hooks/useNotification";
import type { LoaiThongBao, ThongBaoResponse } from "@/types/notification.type";
import styles from "./PatientNotificationCenter.module.css";

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
  return d.toLocaleDateString(vi ? "vi-VN" : "en-US", {
    month: "short",
    day: "numeric",
  });
}

function getNoticeTitle(loai: LoaiThongBao, vi: boolean): string {
  switch (loai) {
    case "NHAC_LICH_KHAM":
      return vi ? "Nhắc nhở lịch khám" : "Appointment reminder";
    case "NHAC_TAI_KHAM":
      return vi ? "Nhắc lịch tái khám" : "Follow-up reminder";
    case "LICH_HEN_MOI":
    case "LICH_HEN_DA_XAC_NHAN":
      return vi ? "Đặt lịch thành công" : "Booking confirmed";
    case "LICH_HEN_DA_DOI":
    case "LICH_HEN_CAN_DOI":
    case "LICH_HEN_DOI_PHONG":
      return vi ? "Thay đổi lịch hẹn" : "Appointment rescheduled";
    case "LICH_HEN_DA_HUY":
    case "LICH_HEN_BI_TU_CHOI":
      return vi ? "Hủy lịch khám" : "Appointment cancelled";
    case "CA_LAM_VIEC_THAY_DOI":
      return vi ? "Thay đổi lịch khám" : "Schedule updated";
    default:
      return vi ? "Thông báo hệ thống" : "System notification";
  }
}

export function PatientNotificationCenter() {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const navigate = useNavigate();

  const { danhSach: notices, isLoading } = useDanhSachThongBao({
    kichThuoc: 10,
  });
  const { soChuaDoc } = useSoThongBaoChuaDoc();
  const { danhDauDaDoc, danhDauTatCaDaDoc } = useNotificationActions();

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
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
    if (notice.loai === "NHAC_TAI_KHAM" && notice.maPhieuKham) {
      navigate(
        `/appointment?followup=${encodeURIComponent(notice.maPhieuKham)}`,
      );
      return;
    }
    if (
      notice.maPhieuKham ||
      notice.loai === "NHAC_LICH_KHAM" ||
      notice.loai === "LICH_HEN_MOI" ||
      notice.loai === "LICH_HEN_DA_XAC_NHAN"
    ) {
      navigate("/patient/my-appointments");
    } else {
      navigate("/patient/dashboard");
    }
  };

  const renderIcon = (notice: ThongBaoResponse) => {
    if (notice.daDoc) return <Check size={13} aria-hidden="true" />;
    if (
      notice.loai === "NHAC_LICH_KHAM" ||
      notice.loai === "LICH_HEN_MOI" ||
      notice.loai === "LICH_HEN_DA_XAC_NHAN"
    )
      return <Calendar size={12} aria-hidden="true" />;
    if (notice.loai === "HE_THONG")
      return <FileText size={12} aria-hidden="true" />;
    return <HeartPulse size={12} aria-hidden="true" />;
  };

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={
          vi
            ? `Thông báo, ${soChuaDoc} chưa đọc`
            : `Notifications, ${soChuaDoc} unread`
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
          aria-label={vi ? "Trung tâm thông báo" : "Notification center"}
        >
          <header className={styles.panelHeader}>
            <span className={styles.panelTitle}>
              {vi ? "Thông báo bệnh nhân" : "Patient Notifications"}
            </span>
            {soChuaDoc > 0 && (
              <button
                type="button"
                className={styles.markAll}
                onClick={handleMarkAllRead}
              >
                <CheckCheck size={14} aria-hidden="true" />
                {vi ? "Đã đọc hết" : "Mark all read"}
              </button>
            )}
          </header>

          <div className={styles.list}>
            {isLoading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "24px 0",
                  color: "#64748b",
                }}
              >
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
                    <strong>{getNoticeTitle(notice.loai, vi)}</strong>
                    <span>{notice.noiDung}</span>
                    <time>{formatNoticeTime(notice.ngayTao, vi)}</time>
                  </span>
                </button>
              ))
            )}
          </div>

          <p className={styles.footer}>
            {vi
              ? "Cập nhật thời gian thực về lịch hẹn và kết quả khám"
              : "Real-time updates on appointments & medical records"}
          </p>
        </section>
      )}
    </div>
  );
}
